import { useMemo } from 'react';
import { Icon } from '@iconify/react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { useThemeStore } from '../../stores/useThemeStore';

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
    <div className="flex flex-col gap-3 p-1 min-w-[220px]">
      {/* Preview + Hue value */}
      <div className="flex items-center justify-between gap-3">
        <div
          className="size-10 rounded-full border-[2px] border-border shadow-flat shrink-0"
          style={{ backgroundColor: currentColor }}
        />
        <span className="text-sm font-semibold text-muted-foreground tabular-nums">
          {hue}°
        </span>
      </div>

      {/* Hue slider */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Hue
        </label>
        <Slider
          min={0}
          max={360}
          step={1}
          value={[hue]}
          onValueChange={([v]) => setHue(v)}
          className="[&_[role=slider]]:shadow-flat"
        />
      </div>

      {/* Preset palette */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Presets
        </label>
        <div className="grid grid-cols-6 gap-2">
          {PRESETS.map((p) => {
            const isActive = hue === p.hue;
            return (
              <Button
                key={p.hue}
                variant="outline"
                size="icon"
                className="size-7 rounded-lg p-0 hover:scale-105 active:scale-95 transition-transform duration-150"
                style={{
                  backgroundColor: p.color,
                  borderColor: isActive ? 'var(--fg)' : 'var(--border-color)',
                  boxShadow: isActive ? `0 0 0 2px var(--bg), 0 0 0 4px ${p.color}` : undefined,
                }}
                onClick={() => setHue(p.hue)}
                title={p.label}
                aria-label={`Select ${p.label} color`}
              >
                {isActive && (
                  <Icon icon="mdi:check" width={14} height={14} color="#fff" />
                )}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
