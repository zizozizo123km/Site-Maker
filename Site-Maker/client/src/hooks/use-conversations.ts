import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { z } from "zod";

function parseWithLogging<T>(schema: z.ZodSchema<T>, data: unknown, label: string): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    console.error(`[Zod] ${label} validation failed:`, result.error.format());
    throw new Error(`Validation failed for ${label}`);
  }
  return result.data;
}

export function useConversations() {
  return useQuery({
    queryKey: [api.conversations.list.path],
    queryFn: async () => {
      const res = await fetch(api.conversations.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch conversations");
      const data = await res.json();
      return parseWithLogging(api.conversations.list.responses[200], data, "conversations.list");
    },
  });
}

export function useConversation(id: number) {
  return useQuery({
    queryKey: [api.conversations.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.conversations.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch conversation");
      const data = await res.json();
      return parseWithLogging(api.conversations.get.responses[200], data, "conversations.get");
    },
    enabled: !!id && !isNaN(id),
  });
}

export function useCreateConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (title?: string) => {
      const res = await fetch(api.conversations.create.path, {
        method: api.conversations.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(title ? { title } : {}),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create conversation");
      const data = await res.json();
      return parseWithLogging(api.conversations.create.responses[201], data, "conversations.create");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.conversations.list.path] });
    },
  });
}

export function useDeleteConversation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.conversations.delete.path, { id });
      const res = await fetch(url, {
        method: api.conversations.delete.method,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete conversation");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.conversations.list.path] });
    },
  });
}

export function useChat(conversationId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) => {
      const url = buildUrl(api.conversations.chat.path, { id: conversationId });
      const res = await fetch(url, {
        method: api.conversations.chat.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to send message");
      const data = await res.json();
      return parseWithLogging(api.conversations.chat.responses[200], data, "conversations.chat");
    },
    onSuccess: (data) => {
      // Optimistically update the specific conversation cache
      queryClient.setQueryData(
        [api.conversations.get.path, conversationId],
        (old: any) => {
          if (!old) return old;
          return {
            conversation: data.conversation,
            messages: [...old.messages, data.message],
          };
        }
      );
      // Invalidate list to update timestamp/title if needed
      queryClient.invalidateQueries({ queryKey: [api.conversations.list.path] });
    },
  });
}
