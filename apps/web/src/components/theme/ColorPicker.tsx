import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { useThemeStore } from '../../stores/useThemeStore';

/** Candy-colored preset palette */
const PRESETS = [
  { hue: 250, label: 'Blue Violet', color: '#6C63FF' },
  { hue: 330, label: 'Pink Rose', color: '#FF6B8B' },
  { hue: 15, label: 'Orange Soda', color: '#FF8A5B' },
  { hue: 45, label: 'Lemon Drop', color: '#FFD166' },
  { hue: 160, label: 'Mint Fresh', color: '#4ADE80' },
  { hue: 200, label: 'Sky Blue', color: '#38BDF8' },
];

export function ColorPicker() {
  const hue = useThemeStore((s) => s.hue);
  const setHue = useThemeStore((s) => s.setHue);

  const currentColor = useMemo(() => `hsl(${hue}, 75%, 55%)`, [hue]);

  return (
    <div className="flex flex-col gap-3 p-4 min-w-[220px]">
      {/* Preview ball */}
      <div className="flex items-center justify-center gap-3">
        <motion.span
          className="w-10 h-10 rounded-full border-[2px]"
          style={{ backgroundColor: currentColor, borderColor: 'var(--border-color)' }}
          layoutId="theme-color-preview"
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        />
        <span className="text-sm font-semibold" style={{ color: 'var(--muted-fg)' }}>
          {hue}°
        </span>
      </div>

      {/* Hue slider */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted-fg)' }}>
          Hue
        </label>
        <input
          type="range"
          min={0}
          max={360}
          value={hue}
          onChange={(e) => setHue(Number(e.target.value))}
          className="w-full h-3 rounded-full appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right,
              hsl(0,75%,55%), hsl(60,75%,55%), hsl(120,75%,55%),
              hsl(180,75%,55%), hsl(240,75%,55%), hsl(300,75%,55%), hsl(360,75%,55%))`,
          }}
        />
      </div>

      {/* Preset palette */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--muted-fg)' }}>
          Presets
        </label>
        <div className="grid grid-cols-6 gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.hue}
              onClick={() => setHue(p.hue)}
              className="relative w-7 h-7 rounded-lg border-[1.5px cursor-pointer hover:scale-110 transition-transform"
              style={{
                backgroundColor: p.color,
                borderColor: hue === p.hue ? 'var(--fg)' : 'var(--border-color)',
                boxShadow: hue === p.hue ? '0 0 0 2px var(--bg), 0 0 0 4px p.color' : undefined,
              }}
              title={p.label}
              aria-label={`Select ${p.label} color`}
            >
              {hue === p.hue && (
                <motion.div
                  className="absolute inset-0 flex items-center justify-center"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                >
                  <Icon icon="mdi:check" width={14} height={14} color="#fff" />
                </motion.div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
