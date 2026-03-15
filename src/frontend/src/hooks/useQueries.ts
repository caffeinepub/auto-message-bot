import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Message, Rule, Template } from "../backend.d";
import { useActor } from "./useActor";

export function useMessages() {
  const { actor, isFetching } = useActor();
  return useQuery<Message[]>({
    queryKey: ["messages"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllMessages();
    },
    enabled: !!actor && !isFetching,
    refetchInterval: 1000,
  });
}

export function useRules() {
  const { actor, isFetching } = useActor();
  return useQuery<Rule[]>({
    queryKey: ["rules"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllRules();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTemplates() {
  const { actor, isFetching } = useActor();
  return useQuery<Template[]>({
    queryKey: ["templates"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getAllTemplates();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useSendMessage() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ sender, text }: { sender: string; text: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.sendMessage(sender, text);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["messages"] }),
  });
}

export function useToggleBot() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (state: boolean) => {
      if (!actor) throw new Error("No actor");
      return actor.toggleBot(state);
    },
  });
}

export function useSetFallback() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (response: string) => {
      if (!actor) throw new Error("No actor");
      return actor.setFallback(response);
    },
  });
}

export function useCreateRule() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      keyword,
      response,
    }: { keyword: string; response: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.createRule(keyword, response);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rules"] }),
  });
}

export function useDeleteRule() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteRule(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["rules"] }),
  });
}

export function useCreateTemplate() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      name,
      content,
    }: { name: string; content: string }) => {
      if (!actor) throw new Error("No actor");
      return actor.createTemplate(name, content);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["templates"] }),
  });
}

export function useDeleteTemplate() {
  const { actor } = useActor();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: bigint) => {
      if (!actor) throw new Error("No actor");
      return actor.deleteTemplate(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["templates"] }),
  });
}
