import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Toaster } from "@/components/ui/sonner";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Canvas } from "@react-three/fiber";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  CheckCircle2,
  FileText,
  Loader2,
  MessageSquare,
  Plus,
  Send,
  Settings,
  Trash2,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Suspense, useEffect, useRef, useState } from "react";
import { SiWhatsapp } from "react-icons/si";
import { toast } from "sonner";
import { BotMesh } from "./components/BotCharacter3D";
import {
  useCreateRule,
  useCreateTemplate,
  useDeleteRule,
  useDeleteTemplate,
  useMessages,
  useRules,
  useSendMessage,
  useSetFallback,
  useTemplates,
  useToggleBot,
} from "./hooks/useQueries";

const queryClient = new QueryClient();

function formatTime(ts: bigint): string {
  const ms = Number(ts / 1_000_000n);
  const d = new Date(ms);
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function BotAvatar({
  size = 40,
  cameraZ = 2.2,
}: { size?: number; cameraZ?: number }) {
  return (
    <div
      style={{ width: size, height: size }}
      className="rounded-full overflow-hidden bg-transparent"
    >
      <Suspense
        fallback={<div className="w-full h-full rounded-full bg-primary/20" />}
      >
        <Canvas
          camera={{ position: [0, 0.1, cameraZ], fov: 45 }}
          style={{ background: "transparent" }}
          gl={{ alpha: true, antialias: true }}
        >
          <ambientLight intensity={0.7} />
          <directionalLight position={[2, 3, 2]} intensity={1.2} />
          <pointLight position={[-1, 1, 1]} intensity={0.5} color="#25D366" />
          <BotMesh scale={1} />
        </Canvas>
      </Suspense>
    </div>
  );
}

function BotAvatarLarge() {
  return (
    <div style={{ width: 200, height: 200 }} className="mx-auto">
      <Suspense
        fallback={<div className="w-full h-full rounded-full bg-primary/20" />}
      >
        <Canvas
          camera={{ position: [0, 0.1, 2.8], fov: 40 }}
          style={{ background: "transparent" }}
          gl={{ alpha: true, antialias: true }}
        >
          <ambientLight intensity={0.7} />
          <directionalLight position={[2, 3, 2]} intensity={1.4} />
          <pointLight position={[-1, 1, 1]} intensity={0.8} color="#25D366" />
          <BotMesh scale={1.3} />
        </Canvas>
      </Suspense>
    </div>
  );
}

function ChatWindow({
  input,
  setInput,
}: {
  input: string;
  setInput: (v: string) => void;
}) {
  const [botOn, setBotOn] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { data: messages = [], isLoading } = useMessages();
  const sendMessage = useSendMessage();
  const toggleBot = useToggleBot();
  // biome-ignore lint/correctness/useExhaustiveDependencies: scroll on message count change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages.length]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    try {
      await sendMessage.mutateAsync({ sender: "user", text });
    } catch {
      toast.error("Failed to send message");
    }
  };

  const handleToggleBot = async (val: boolean) => {
    setBotOn(val);
    try {
      await toggleBot.mutateAsync(val);
      toast.success(val ? "Auto-reply bot enabled" : "Bot paused");
    } catch {
      setBotOn(!val);
      toast.error("Failed to toggle bot");
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <div className="relative shrink-0">
            <BotAvatar size={48} cameraZ={2.2} />
            <span
              className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-card transition-colors ${
                botOn ? "bg-primary" : "bg-muted-foreground"
              }`}
            />
          </div>
          <div>
            <h2
              className="font-semibold text-sm text-foreground"
              style={{ fontFamily: "Bricolage Grotesque" }}
            >
              AutoBot Assistant
            </h2>
            <p className="text-xs text-muted-foreground">
              {botOn ? "Auto-replies active" : "Manual mode"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {botOn ? "Bot On" : "Bot Off"}
          </span>
          <Switch
            data-ocid="chat.toggle"
            checked={botOn}
            onCheckedChange={handleToggleBot}
            className="data-[state=checked]:bg-primary"
          />
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 chat-bg">
        <div className="p-4 space-y-3 min-h-full">
          {isLoading ? (
            <div
              className="flex items-center justify-center h-32"
              data-ocid="chat.loading_state"
            >
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : messages.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center justify-center gap-3 pt-8"
              data-ocid="chat.empty_state"
            >
              <BotAvatarLarge />
              <p
                className="text-sm font-semibold text-foreground"
                style={{ fontFamily: "Bricolage Grotesque" }}
              >
                Hi! I'm AutoBot 👋
              </p>
              <p className="text-xs text-muted-foreground text-center max-w-[200px]">
                Set up rules in the sidebar and enable the bot to get started!
              </p>
            </motion.div>
          ) : (
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <motion.div
                  key={`${msg.sender}-${String(msg.timestamp)}-${i}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${
                    msg.sender === "user" ? "justify-end" : "justify-start"
                  }`}
                  data-ocid={`chat.item.${i + 1}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                      msg.sender === "user"
                        ? "bubble-user rounded-tr-sm"
                        : "bubble-bot rounded-tl-sm"
                    }`}
                  >
                    {msg.sender !== "user" && (
                      <p className="text-xs font-semibold text-primary mb-1">
                        AutoBot
                      </p>
                    )}
                    <p className="text-sm text-foreground leading-relaxed">
                      {msg.text}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1 text-right">
                      {formatTime(msg.timestamp)}
                    </p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-3 border-t border-border bg-card flex gap-2 items-end">
        <Input
          data-ocid="chat.input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
          placeholder="Type a message..."
          className="flex-1 bg-secondary border-border text-foreground placeholder:text-muted-foreground rounded-full px-4"
        />
        <Button
          data-ocid="chat.primary_button"
          onClick={handleSend}
          disabled={!input.trim() || sendMessage.isPending}
          size="icon"
          className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shrink-0"
        >
          {sendMessage.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>
    </div>
  );
}

function RulesTab() {
  const [keyword, setKeyword] = useState("");
  const [response, setResponse] = useState("");
  const [fallback, setFallbackLocal] = useState("");
  const { data: rules = [] } = useRules();
  const createRule = useCreateRule();
  const deleteRule = useDeleteRule();
  const setFallback = useSetFallback();

  const handleAdd = async () => {
    if (!keyword.trim() || !response.trim()) return;
    try {
      await createRule.mutateAsync({
        keyword: keyword.trim(),
        response: response.trim(),
      });
      setKeyword("");
      setResponse("");
      toast.success("Rule added");
    } catch {
      toast.error("Failed to add rule");
    }
  };

  const handleDelete = async (idx: number) => {
    try {
      await deleteRule.mutateAsync(BigInt(idx));
      toast.success("Rule deleted");
    } catch {
      toast.error("Failed to delete rule");
    }
  };

  const handleFallback = async () => {
    if (!fallback.trim()) return;
    try {
      await setFallback.mutateAsync(fallback.trim());
      toast.success("Fallback reply saved");
    } catch {
      toast.error("Failed to save fallback");
    }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Add Auto-Reply Rule
        </h3>
        <Input
          data-ocid="rules.input"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Keyword (e.g. hello)"
          className="bg-secondary border-border"
        />
        <Textarea
          data-ocid="rules.textarea"
          value={response}
          onChange={(e) => setResponse(e.target.value)}
          placeholder="Auto-reply response..."
          className="bg-secondary border-border resize-none"
          rows={2}
        />
        <Button
          data-ocid="rules.primary_button"
          onClick={handleAdd}
          disabled={!keyword.trim() || !response.trim() || createRule.isPending}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          size="sm"
        >
          {createRule.isPending ? (
            <Loader2 className="w-3 h-3 animate-spin mr-1" />
          ) : (
            <Plus className="w-3 h-3 mr-1" />
          )}
          Add Rule
        </Button>
      </div>

      <Separator className="bg-border" />

      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Active Rules ({rules.length})
        </h3>
        {rules.length === 0 ? (
          <div
            className="flex flex-col items-center py-6 gap-2"
            data-ocid="rules.empty_state"
          >
            <Zap className="w-6 h-6 text-muted-foreground/40" />
            <p className="text-xs text-muted-foreground">No rules yet</p>
          </div>
        ) : (
          <div className="space-y-2" data-ocid="rules.list">
            {rules.map((rule, i) => (
              <motion.div
                key={`${rule.keyword}-${i}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-2 p-3 rounded-lg bg-secondary group"
                data-ocid={`rules.item.${i + 1}`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge
                      variant="secondary"
                      className="text-[10px] bg-primary/20 text-primary border-primary/30 font-mono"
                    >
                      {rule.keyword}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {rule.response}
                  </p>
                </div>
                <Button
                  data-ocid={`rules.delete_button.${i + 1}`}
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(i)}
                  className="h-6 w-6 shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <Separator className="bg-border" />

      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Fallback Reply
        </h3>
        <Textarea
          data-ocid="rules.fallback.textarea"
          value={fallback}
          onChange={(e) => setFallbackLocal(e.target.value)}
          placeholder="Reply when no keyword matches..."
          className="bg-secondary border-border resize-none"
          rows={2}
        />
        <Button
          data-ocid="rules.fallback.save_button"
          onClick={handleFallback}
          disabled={!fallback.trim() || setFallback.isPending}
          variant="outline"
          className="w-full border-border hover:bg-secondary"
          size="sm"
        >
          {setFallback.isPending ? (
            <Loader2 className="w-3 h-3 animate-spin mr-1" />
          ) : (
            <CheckCircle2 className="w-3 h-3 mr-1" />
          )}
          Save Fallback
        </Button>
      </div>
    </div>
  );
}

function TemplatesTab({ onUse }: { onUse: (content: string) => void }) {
  const [name, setName] = useState("");
  const [content, setContent] = useState("");
  const { data: templates = [] } = useTemplates();
  const createTemplate = useCreateTemplate();
  const deleteTemplate = useDeleteTemplate();

  const handleAdd = async () => {
    if (!name.trim() || !content.trim()) return;
    try {
      await createTemplate.mutateAsync({
        name: name.trim(),
        content: content.trim(),
      });
      setName("");
      setContent("");
      toast.success("Template saved");
    } catch {
      toast.error("Failed to save template");
    }
  };

  const handleDelete = async (idx: number) => {
    try {
      await deleteTemplate.mutateAsync(BigInt(idx));
      toast.success("Template deleted");
    } catch {
      toast.error("Failed to delete template");
    }
  };

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          New Template
        </h3>
        <Input
          data-ocid="templates.input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Template name"
          className="bg-secondary border-border"
        />
        <Textarea
          data-ocid="templates.textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Template content..."
          className="bg-secondary border-border resize-none"
          rows={3}
        />
        <Button
          data-ocid="templates.primary_button"
          onClick={handleAdd}
          disabled={!name.trim() || !content.trim() || createTemplate.isPending}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          size="sm"
        >
          {createTemplate.isPending ? (
            <Loader2 className="w-3 h-3 animate-spin mr-1" />
          ) : (
            <Plus className="w-3 h-3 mr-1" />
          )}
          Save Template
        </Button>
      </div>

      <Separator className="bg-border" />

      <div className="space-y-2">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Saved Templates ({templates.length})
        </h3>
        {templates.length === 0 ? (
          <div
            className="flex flex-col items-center py-6 gap-2"
            data-ocid="templates.empty_state"
          >
            <FileText className="w-6 h-6 text-muted-foreground/40" />
            <p className="text-xs text-muted-foreground">No templates yet</p>
          </div>
        ) : (
          <div className="space-y-2" data-ocid="templates.list">
            {templates.map((tpl, i) => (
              <motion.div
                key={`${tpl.name}-${i}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-start gap-2 p-3 rounded-lg bg-secondary group"
                data-ocid={`templates.item.${i + 1}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground mb-1">
                    {tpl.name}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {tpl.content}
                  </p>
                </div>
                <div className="flex flex-col gap-1 shrink-0">
                  <Button
                    data-ocid={`templates.secondary_button.${i + 1}`}
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      onUse(tpl.content);
                      toast.success("Template inserted into chat");
                    }}
                    className="h-6 w-6 text-primary hover:bg-primary/10"
                    title="Use in chat"
                  >
                    <Send className="w-3 h-3" />
                  </Button>
                  <Button
                    data-ocid={`templates.delete_button.${i + 1}`}
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(i)}
                    className="h-6 w-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AppInner() {
  const [chatInput, setChatInput] = useState("");

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen bg-background">
        <header className="flex items-center gap-3 px-5 py-3 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center overflow-hidden">
              <Suspense
                fallback={<MessageSquare className="w-4 h-4 text-primary" />}
              >
                <Canvas
                  camera={{ position: [0, 0.1, 2.4], fov: 45 }}
                  style={{ background: "transparent", width: 32, height: 32 }}
                  gl={{ alpha: true, antialias: true }}
                >
                  <ambientLight intensity={0.8} />
                  <directionalLight position={[2, 3, 2]} intensity={1.2} />
                  <BotMesh scale={0.85} />
                </Canvas>
              </Suspense>
            </div>
            <span
              className="text-lg font-bold text-foreground"
              style={{ fontFamily: "Bricolage Grotesque" }}
            >
              AutoChat Bot
            </span>
          </div>
          <Badge
            variant="secondary"
            className="text-[10px] bg-primary/15 text-primary border-primary/20"
          >
            WhatsApp Simulator
          </Badge>
          <div className="ml-auto">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  data-ocid="header.primary_button"
                  onClick={() =>
                    window.open(
                      "https://web.whatsapp.com",
                      "_blank",
                      "noopener,noreferrer",
                    )
                  }
                  className="flex items-center gap-2 bg-[#25D366] hover:bg-[#1da851] text-white font-semibold shadow-md"
                  size="sm"
                >
                  <SiWhatsapp className="w-4 h-4" />
                  Open WhatsApp
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Open WhatsApp Web</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden">
          <main className="flex-1 flex flex-col min-w-0 border-r border-border">
            <ChatWindow input={chatInput} setInput={setChatInput} />
          </main>

          <aside className="w-80 flex flex-col bg-card shrink-0">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
              <Settings className="w-4 h-4 text-primary" />
              <h2
                className="text-sm font-semibold text-foreground"
                style={{ fontFamily: "Bricolage Grotesque" }}
              >
                Bot Settings
              </h2>
            </div>
            <Tabs
              defaultValue="rules"
              className="flex-1 flex flex-col overflow-hidden"
            >
              <TabsList className="mx-3 mt-3 bg-secondary shrink-0">
                <TabsTrigger
                  data-ocid="settings.tab"
                  value="rules"
                  className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs"
                >
                  <Zap className="w-3 h-3 mr-1" /> Rules
                </TabsTrigger>
                <TabsTrigger
                  data-ocid="settings.tab"
                  value="templates"
                  className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs"
                >
                  <FileText className="w-3 h-3 mr-1" /> Templates
                </TabsTrigger>
              </TabsList>
              <ScrollArea className="flex-1">
                <div className="p-4">
                  <TabsContent value="rules" className="mt-0">
                    <RulesTab />
                  </TabsContent>
                  <TabsContent value="templates" className="mt-0">
                    <TemplatesTab onUse={(content) => setChatInput(content)} />
                  </TabsContent>
                </div>
              </ScrollArea>
            </Tabs>
          </aside>
        </div>

        <footer className="shrink-0 py-1.5 text-center text-[10px] text-muted-foreground border-t border-border bg-card">
          © {new Date().getFullYear()}. Built with ❤️ using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            className="text-primary hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            caffeine.ai
          </a>
        </footer>

        <Toaster position="top-right" />
      </div>
    </TooltipProvider>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  );
}
