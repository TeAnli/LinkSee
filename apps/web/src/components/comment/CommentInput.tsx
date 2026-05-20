import { useState, useRef, useCallback, type KeyboardEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { cn } from '@/lib/utils';

interface CommentInputProps {
  replyTo: { commentId: number; userId: number; nickname: string } | null;
  onCancelReply: () => void;
  onSubmit: (content: string) => void;
  submitting: boolean;
  disabled?: boolean;
}

export function CommentInput({ replyTo, onCancelReply, onSubmit, submitting, disabled }: CommentInputProps) {
  const { t } = useTranslation();
  const [value, setValue] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed || submitting) return;
    onSubmit(trimmed);
    setValue('');
  }, [value, submitting, onSubmit]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  if (disabled) {
    return (
      <div className="rounded-lg border border-border bg-muted/20 p-4 text-center text-sm text-muted-foreground">
        {t('post.loginToComment')}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {replyTo && (
        <div className="flex items-center justify-between text-xs text-muted-foreground bg-muted/30 rounded-md px-3 py-1.5">
          <span className="flex items-center gap-1">
            <Icon icon="mdi:reply" width={14} />
            {t('post.replyToSomeone', { name: replyTo.nickname })}
          </span>
          <button onClick={onCancelReply} className="hover:text-foreground transition-colors cursor-pointer">
            <Icon icon="mdi:close" width={14} />
          </button>
        </div>
      )}
      <div className="flex items-start gap-2">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={replyTo ? t('post.writeComment') : t('post.writeComment')}
          rows={2}
          maxLength={2000}
          className={cn(
            'flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors',
            'placeholder:text-muted-foreground/50 focus:border-primary focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background',
          )}
        />
        <button
          onClick={handleSubmit}
          disabled={!value.trim() || submitting}
          className={cn(
            'flex items-center gap-1 shrink-0 h-9 px-3 rounded-lg text-xs font-bold transition-colors cursor-pointer',
            value.trim() && !submitting
              ? 'bg-primary text-primary-foreground hover:bg-primary/90'
              : 'bg-muted text-muted-foreground',
          )}
        >
          {submitting ? (
            <Icon icon="mdi:loading" width={14} className="animate-spin" />
          ) : (
            <Icon icon="mdi:send" width={14} />
          )}
          <span className="hidden sm:inline">{t('post.submitComment')}</span>
        </button>
      </div>
    </div>
  );
}
