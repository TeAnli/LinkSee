import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';

interface PagePlaceholderProps {
  label?: string;
  icon?: string;
}

export function PagePlaceholder({ label = 'Content Area', icon = 'mdi:shape-outline' }: PagePlaceholderProps) {
  return (
    <motion.div
      className="flex flex-col items-center justify-center w-full rounded-2xl border-2 border-dashed pattern-dots"
      style={{
        borderColor: 'var(--border-color)',
        minHeight: 'calc(100vh - 160px)',
        boxShadow: 'var(--card-shadow)',
        backgroundColor: 'var(--bg-secondary)',
      }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
    >
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Icon icon={icon} width={48} height={48} style={{ color: 'var(--muted-fg)', opacity: 0.5 }} />
      </motion.div>

      <p className="mt-4 text-sm font-semibold" style={{ color: 'var(--muted-fg)' }}>
        {label}
      </p>

      <p className="mt-1 text-xs font-medium" style={{ color: 'var(--border-color)' }}>
        Layout placeholder — content coming soon
      </p>
    </motion.div>
  );
}
