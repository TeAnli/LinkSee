import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { Card } from '@/components/ui/card';

interface PagePlaceholderProps {
  label?: string;
  icon?: string;
}

export function PagePlaceholder({
  label = 'Content Area',
  icon = 'mdi:shape-outline',
}: PagePlaceholderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      <Card
        className="flex flex-col items-center justify-center w-full border-2 border-dashed pattern-dots"
        style={{
          minHeight: 'calc(100vh - 160px)',
          backgroundColor: 'var(--bg-secondary)',
        }}
      >
        <motion.div
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon
            icon={icon}
            width={48}
            height={48}
            className="text-muted-foreground opacity-50"
          />
        </motion.div>

        <p className="mt-4 text-sm font-semibold text-muted-foreground">
          {label}
        </p>

        <p className="mt-1 text-xs font-medium text-border">
          Layout placeholder — content coming soon
        </p>
      </Card>
    </motion.div>
  );
}
