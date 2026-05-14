import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import { Icon } from '@iconify/react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { TocItem, tocFadeIn } from '@/lib/toc';

function TocNav({ toc, activeId, onItemClick }: { toc: TocItem[]; activeId: string | null; onItemClick?: () => void }) {
  const scrollTo = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    onItemClick?.();
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, [onItemClick]);

  return (
    <nav className="flex flex-col gap-0.5">
      <AnimatePresence>
        {toc.map((item, i) => (
          <motion.a
            key={item.id}
            custom={i}
            initial="hidden"
            animate="visible"
            variants={tocFadeIn}
            href={`#${item.id}`}
            onClick={(e) => scrollTo(e, item.id)}
            className={cn(
              'block text-[12px] leading-relaxed py-1 rounded-md transition-all duration-200',
              item.level === 3 ? 'pl-4' : 'pl-2',
              activeId === item.id
                ? 'text-primary font-bold bg-primary/8 border-l-2 border-primary'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted/50 border-l-2 border-transparent',
            )}
          >
            {item.text}
          </motion.a>
        ))}
      </AnimatePresence>
    </nav>
  );
}

export function TableOfContents({ toc, activeId }: { toc: TocItem[]; activeId: string | null }) {
  const { t } = useTranslation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sheetAnim = {
    overlay: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
    sheet: {
      hidden: { y: '100%' },
      visible: { y: 0, transition: { type: 'spring' as const, damping: 25, stiffness: 300 } },
    },
  };

  return (
    <>
      <aside className="hidden lg:flex flex-col fixed right-0 border-l-[1.5px] border-border bg-background z-10"
        style={{ width: '240px', top: '76px', bottom: 0 }}
      >
        <div className="flex items-center justify-between px-4 py-3 border-b-[1.5px] border-border">
          <div className="flex items-center gap-1.5">
            <Icon icon="mdi:format-list-bulleted" width={16} className="text-primary" />
            <span className="text-xs font-bold text-foreground">{t('post.toc')}</span>
            <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full font-medium">
              {toc.length}
            </span>
          </div>
        </div>
        <ScrollArea className="flex-1 px-4 py-3">
          <TocNav toc={toc} activeId={activeId} />
        </ScrollArea>
      </aside>

      <div className="lg:hidden fixed bottom-24 right-4 z-50">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setMobileOpen(true)}
          className="flex items-center justify-center size-11 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25"
        >
          <Icon icon="mdi:format-list-bulleted" width={20} />
        </motion.button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              variants={sheetAnim.overlay}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 z-[60]"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              variants={sheetAnim.sheet}
              initial="hidden"
              animate="visible"
              exit="hidden"
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.4 }}
              onDragEnd={(_e, info) => {
                if (info.offset.y > 120 || info.velocity.y > 500) {
                  setMobileOpen(false);
                }
              }}
              className="fixed bottom-0 left-0 right-0 z-[70] bg-background rounded-t-2xl border-t-[1.5px] border-border flex flex-col"
              style={{
                maxHeight: 'calc(80vh + env(safe-area-inset-bottom, 0px))',
                paddingBottom: 'calc(60px + env(safe-area-inset-bottom, 0px))',
              }}
            >
              <div className="flex justify-center pt-2.5 pb-1 cursor-grab active:cursor-grabbing">
                <div className="w-8 h-1 rounded-full bg-muted-foreground/30" />
              </div>
              <div className="flex items-center justify-between px-4 py-2 border-b-[1.5px] border-border">
                <div className="flex items-center gap-1.5">
                  <Icon icon="mdi:format-list-bulleted" width={16} className="text-primary" />
                  <span className="text-xs font-bold text-foreground">{t('post.toc')}</span>
                  <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full font-medium">
                    {toc.length}
                  </span>
                </div>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="size-7 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
                >
                  <Icon icon="mdi:close" width={16} />
                </button>
              </div>
              <ScrollArea className="flex-1 px-4 py-3">
                <TocNav toc={toc} activeId={activeId} onItemClick={() => setMobileOpen(false)} />
              </ScrollArea>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
