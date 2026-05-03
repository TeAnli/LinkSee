import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';

function PlaceholderCard({ title, icon, accent }: { title: string; icon: string; accent?: boolean }) {
  return (
    <motion.div
      className={`rounded-2xl border-[1.5px] p-4 ${accent ? '' : 'shadow-flat'}`}
      style={{
        backgroundColor: accent ? 'var(--primary)' : 'var(--card-bg)',
        borderColor: 'var(--border-color)',
        ...(accent ? {} : { boxShadow: 'var(--card-shadow)' }),
      }}
      whileHover={accent ? {} : { x: -2, y: -2, boxShadow: 'var(--shadow-flat-hover)' }}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Icon icon={icon} width={18} height={18} style={{ color: accent ? '#fff' : 'var(--primary)' }} />
        <span className={`text-sm font-bold ${accent ? 'text-white' : ''}`} style={!accent ? { color: 'var(--fg)' } : undefined}>
          {title}
        </span>
      </div>

      {title === 'Hot Topics' && (
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <span key={i} className="px-3 py-1 rounded-full text-xs font-bold border-[1.5px]" style={{
              backgroundColor: `hsl(${250 + i * 20}, 75%, ${accent ? 60 : 92}%)`,
              borderColor: accent ? 'rgba(255,255,255,0.3)' : 'transparent',
              color: accent ? '#fff' : 'var(--fg)',
            }}>
              Topic {i}
            </span>
          ))}
        </div>
      )}

      {title === 'Active Users' && (
        <div className="flex flex-col gap-2.5">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full border-[1.5px]" style={{
                backgroundColor: 'var(--muted)',
                borderColor: 'var(--border-color)',
              }} />
              <span className="text-xs font-semibold" style={{ color: accent ? 'rgba(255,255,255,0.8)' : 'var(--muted-fg)' }}>
                User {i}
              </span>
            </div>
          ))}
        </div>
      )}

      {title === 'AI Picks' && (
        <p className="text-xs font-medium" style={{ color: accent ? 'rgba(255,255,255,0.85)' : 'var(--muted-fg)' }}>
          AI recommended content will appear here.
        </p>
      )}
    </motion.div>
  );
}

export function RightPanel() {
  return (
    <aside className="hidden xl:flex flex-col w-[280px] fixed right-0 top-[60px] bottom-0 overflow-y-auto border-l-[1.5px] p-5 gap-4"
      style={{
        backgroundColor: 'var(--bg)',
        borderColor: 'var(--border-color)',
      }}
    >
      <PlaceholderCard title="Hot Topics" icon="mdi:fire" />
      <PlaceholderCard title="Active Users" icon="mdi:account-group-outline" />
      <PlaceholderCard title="AI Picks" icon="mdi:robot-happy" accent />
    </aside>
  );
}
