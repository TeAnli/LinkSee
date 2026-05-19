import { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAiChatStore } from '@/stores/useAiChatStore';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

const MOCK_RESPONSES = [
  `## 技术方案

### 1. 数据库优化
- 使用复合索引覆盖常用查询条件
- 考虑使用游标分页替代 OFFSET 分页
- 对于热点数据可以使用 Redis 缓存

### 2. 接口设计
\`\`\`java
@GetMapping("/posts")
public PageResult<PostVO> listPosts(
    @RequestParam(required = false) Long categoryId,
    @RequestParam(defaultValue = "1") Integer page,
    @RequestParam(defaultValue = "20") Integer size
) {
    // 实现逻辑...
}
\`\`\`

### 3. 性能考量
- 响应时间目标：< 200ms (P99)
- 并发量预估：支持 1000 QPS
- 使用 CDN 缓存静态资源`,

  `\`\`\`tsx
function useForm<T extends Record<string, unknown>>(initialValues: T) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof T, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const register = (name: keyof T) => ({
    value: values[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setValues(prev => ({ ...prev, [name]: e.target.value })),
  });

  const handleSubmit = async (onSubmit: (values: T) => Promise<void>) => {
    setIsSubmitting(true);
    try { await onSubmit(values); }
    finally { setIsSubmitting(false); }
  };

  return { values, errors, register, handleSubmit };
}
\`\`\`
这个 Hook 支持类型安全的表单管理，包含错误状态和提交状态。`,

  `| 特性 | PostgreSQL | MySQL |
|------|-----------|-------|
| ACID 合规性 | 完全合规 | 部分场景有差异 |
| JSON 支持 | JSONB（二进制存储，支持索引） | JSON（文本存储） |
| 扩展性 | 丰富的扩展生态 | 相对较少 |
| 全文搜索 | 内置支持 | 需要 MyISAM 或外部引擎 |
| 并发控制 | MVCC（更精细） | MVCC（表级锁较多） |

**推荐：PostgreSQL** 用于复杂查询；**MySQL** 用于高并发 OLTP。`,
];

export function AiChatPage() {
  const { t } = useTranslation();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const responseIndexRef = useRef(0);

  const conversations = useAiChatStore((s) => s.conversations);
  const activeId = useAiChatStore((s) => s.activeConversationId);
  const isTyping = useAiChatStore((s) => s.isTyping);
  const inputText = useAiChatStore((s) => s.inputText);
  const addMessage = useAiChatStore((s) => s.addMessage);
  const newConversation = useAiChatStore((s) => s.newConversation);
  const setIsTyping = useAiChatStore((s) => s.setIsTyping);
  const setInputText = useAiChatStore((s) => s.setInputText);

  const messages: Message[] = useMemo(() => {
    if (!activeId) return [];
    const conv = conversations.find((c) => c.id === activeId);
    return conv?.messages ?? [];
  }, [conversations, activeId]);

  // Ensure active conversation exists
  useEffect(() => {
    if (!activeId) {
      newConversation();
    }
  }, [activeId, newConversation]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = () => {
    if (!inputText.trim() || isTyping) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user' as const,
      content: inputText.trim(),
      timestamp: new Date().toISOString(),
    };

    addMessage(userMsg);
    setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      const aiMsg = {
        id: `ai-${Date.now()}`,
        role: 'assistant' as const,
        content: MOCK_RESPONSES[responseIndexRef.current % MOCK_RESPONSES.length],
        timestamp: new Date().toISOString(),
      };
      responseIndexRef.current++;
      addMessage(aiMsg);
      setIsTyping(false);
    }, 1500 + Math.random() * 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleCopy = (msgId: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedId(msgId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleNewChat = () => {
    newConversation();
    inputRef.current?.focus();
  };

  const suggestions = [t('ai.sq1'), t('ai.sq2'), t('ai.sq3'), t('ai.sq4')];

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      {/* Header */}
      <div className="flex items-center justify-between shrink-0 pb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon icon="mdi:robot-outline" className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-bold">灵犀 AI</h2>
            <p className="text-[10px] text-muted-foreground">
              {messages.length > 0 ? `${messages.length} 条消息` : '准备就绪'}
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleNewChat}>
          <Icon icon="mdi:plus" className="h-3.5 w-3.5 mr-1" />
          {t('ai.newChat')}
        </Button>
      </div>

      {/* Chat Area */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto rounded-xl border border-border bg-card/50 p-4"
      >
        {messages.length === 0 ? (
          <WelcomeScreen onSuggestion={setInputText} />
        ) : (
          <div className="flex flex-col gap-4">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <ChatBubble
                  key={msg.id}
                  message={msg}
                  copiedId={copiedId}
                  onCopy={handleCopy}
                />
              ))}
            </AnimatePresence>
            {isTyping && <TypingIndicator />}
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="shrink-0 pt-3">
        <div className="flex items-end gap-2 rounded-xl border border-border bg-background p-2 shadow-flat focus-within:shadow-flat-hover focus-within:border-primary/30 transition-all">
          <textarea
            ref={inputRef}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('ai.inputPlaceholder')}
            rows={1}
            className="flex-1 resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground min-h-[36px] max-h-32 py-2 px-2"
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.min(target.scrollHeight, 128) + 'px';
            }}
          />
          <Button
            size="icon"
            className="shrink-0 h-9 w-9 rounded-lg"
            disabled={!inputText.trim() || isTyping}
            onClick={isTyping ? undefined : handleSend}
          >
            {isTyping ? (
              <Icon icon="mdi:stop" className="h-3.5 w-3.5" />
            ) : (
              <Icon icon="mdi:send" className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground text-center mt-1.5">
          AI 生成的内容仅供参考，请注意甄别
        </p>
      </div>
    </div>
  );
}

// === Welcome Screen ===

function WelcomeScreen({ onSuggestion }: { onSuggestion: (text: string) => void }) {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center h-full text-center py-8"
    >
      <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-4">
        <Icon icon="mdi:sparkles" className="h-7 w-7 text-primary" />
      </div>
      <h3 className="text-base font-bold">{t('ai.welcome')}</h3>
      <p className="text-xs text-muted-foreground mt-1 max-w-xs">{t('ai.welcomeDesc')}</p>

      <div className="mt-6 w-full max-w-md">
        <p className="text-[10px] text-muted-foreground mb-2 font-medium">
          {t('ai.suggestedQuestions')}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[t('ai.sq1'), t('ai.sq2'), t('ai.sq3'), t('ai.sq4')].map((q, i) => (
            <button
              key={i}
              onClick={() => onSuggestion(q)}
              className="text-left text-xs p-3 rounded-xl border border-border bg-background hover:border-primary/30 hover:bg-muted/50 transition-all shadow-flat hover:shadow-flat-hover active:shadow-none active:translate-x-[1px] active:translate-y-[1px]"
            >
              {q}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// === Chat Bubble ===

function ChatBubble({
  message,
  copiedId,
  onCopy,
}: {
  message: Message;
  copiedId: string | null;
  onCopy: (id: string, content: string) => void;
}) {
  const isUser = message.role === 'user';

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className={cn('flex gap-2.5', isUser && 'flex-row-reverse')}
    >
      <Avatar className="h-7 w-7 shrink-0 mt-1">
        <AvatarFallback
          className={cn(
            'text-[10px] font-semibold',
            isUser ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary',
          )}
        >
          {isUser ? <Icon icon="mdi:account-outline" className="h-3 w-3" /> : <Icon icon="mdi:robot-outline" className="h-3 w-3" />}
        </AvatarFallback>
      </Avatar>

      <div className={cn('flex flex-col gap-1.5 max-w-[85%]', isUser && 'items-end')}>
        <div
          className={cn(
            'rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
            isUser
              ? 'bg-primary text-primary-foreground rounded-tr-md'
              : 'bg-muted/80 text-foreground rounded-tl-md',
          )}
        >
          {message.content.split('\n').map((line, i) => (
            <span key={i}>
              {line.startsWith('## ') ? (
                <strong className="block mt-2 mb-1 text-[13px]">{line.slice(3)}</strong>
              ) : line.startsWith('### ') ? (
                <strong className="block mt-1.5 mb-0.5 text-xs">{line.slice(4)}</strong>
              ) : line.startsWith('```') ? null : line.startsWith('| ') ? (
                <span className="font-mono text-xs">{line}</span>
              ) : line.startsWith('- ') || line.startsWith('> ') ? (
                <span className="block pl-2">{line}</span>
              ) : (
                line
              )}
              {line && !line.startsWith('```') && '\n'}
            </span>
          ))}
        </div>

        {!isUser && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => onCopy(message.id, message.content)}
              className="p-1 rounded-md hover:bg-muted/60 transition-colors"
              title="Copy"
            >
              {copiedId === message.id ? (
                <Icon icon="mdi:check" className="h-3 w-3 text-green-500" />
              ) : (
                <Icon icon="mdi:content-copy" className="h-3 w-3 text-muted-foreground" />
              )}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

// === Typing Indicator ===

function TypingIndicator() {
  const { t } = useTranslation();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex gap-2.5"
    >
      <Avatar className="h-7 w-7 shrink-0 mt-1">
        <AvatarFallback className="text-[10px] font-semibold bg-primary/10 text-primary">
          <Icon icon="mdi:robot-outline" className="h-3 w-3" />
        </AvatarFallback>
      </Avatar>
      <div className="bg-muted/80 rounded-2xl rounded-tl-md px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-muted-foreground mr-1">{t('ai.thinking')}</span>
          <div className="flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="h-1.5 w-1.5 rounded-full bg-primary/40"
                animate={{ y: [0, -4, 0] }}
                transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
              />
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
