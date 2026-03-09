import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get(api.conversations.list.path, async (req, res) => {
    const data = await storage.getConversations();
    res.json(data);
  });

  app.get(api.conversations.get.path, async (req, res) => {
    const id = Number(req.params.id);
    const conversation = await storage.getConversation(id);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }
    const messages = await storage.getMessages(id);
    res.json({ conversation, messages });
  });

  app.post(api.conversations.create.path, async (req, res) => {
    const input = api.conversations.create.input?.parse(req.body) || {};
    const title = input.title || "New Project";
    const conversation = await storage.createConversation(title);
    
    await storage.createMessage(
      conversation.id,
      "assistant",
      "Hello! I am your AI website builder. What kind of website would you like to create today?"
    );
    
    res.status(201).json(conversation);
  });

  app.delete(api.conversations.delete.path, async (req, res) => {
    const id = Number(req.params.id);
    await storage.deleteConversation(id);
    res.status(204).send();
  });

  app.post(api.conversations.chat.path, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const input = api.conversations.chat.input.parse(req.body);
      
      const conversation = await storage.getConversation(id);
      if (!conversation) {
        return res.status(404).json({ message: "Conversation not found" });
      }

      // Save user message
      await storage.createMessage(id, "user", input.content);

      // Fetch history for AI
      const dbMessages = await storage.getMessages(id);
      
      const openaiMessages = [
        {
          role: "system",
          content: `You are an expert frontend web developer. The user wants to build or modify a website.
Current website code:
\`\`\`html
${conversation.currentCode || "<!-- Empty -->"}
\`\`\`

You must respond with a JSON object matching this schema:
{
  "reply": "Your conversational response to the user, explaining what you did",
  "code": "The COMPLETE, updated HTML code for the website including inline CSS/JS. Do not use markdown blocks here, just the raw HTML string."
}`
        },
        ...dbMessages.map(m => ({
          role: m.role as "user" | "assistant",
          content: m.content
        }))
      ];

      const response = await openai.chat.completions.create({
        model: "gpt-5.1",
        messages: openaiMessages as any,
        response_format: { type: "json_object" },
      });

      const responseContent = response.choices[0]?.message?.content;
      if (!responseContent) throw new Error("No response from AI");

      const parsed = JSON.parse(responseContent);
      const reply = parsed.reply || "Done.";
      const code = parsed.code || conversation.currentCode || "";

      // Save assistant message
      const assistantMessage = await storage.createMessage(id, "assistant", reply);
      
      // Update code
      const updatedConversation = await storage.updateConversationCode(id, code);

      res.json({
        message: assistantMessage,
        conversation: updatedConversation
      });
    } catch (err) {
      console.error(err);
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existing = await storage.getConversations();
  if (existing.length === 0) {
    const conv = await storage.createConversation("Personal Portfolio");
    await storage.createMessage(conv.id, "assistant", "Hello! I am your AI website builder. What kind of website would you like to create today?");
    await storage.createMessage(conv.id, "user", "Can you make a simple dark mode portfolio?");
    await storage.createMessage(conv.id, "assistant", "I've created a simple dark mode portfolio for you.");
    await storage.updateConversationCode(conv.id, `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Portfolio</title>
<style>
  body { background-color: #121212; color: #ffffff; font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; }
  .container { text-align: center; }
</style>
</head>
<body>
  <div class="container">
    <h1>My Portfolio</h1>
    <p>Welcome to my dark mode portfolio.</p>
  </div>
</body>
</html>`);
  }
}
