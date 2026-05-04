import { useMemo } from 'react';
import { Icon } from '@iconify/react';
import { useTranslation } from 'react-i18next';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { useThemeStore } from '../../stores/useThemeStore';

const PRESETS = [
  { hue: 250, labelKey: 'colorPicker.blueViolet', color: '#6C63FF' },
  { hue: 330, labelKey: 'colorPicker.pinkRose', color: '#FF6B8B' },
  { hue: 15, labelKey: 'colorPicker.orangeSoda', color: '#FF8A5B' },
  { hue: 45, labelKey: 'colorPicker.lemonDrop', color: '#FFD166' },
  { hue: 160, labelKey: 'colorPicker.mintFresh', color: '#4ADE80' },
  { hue: 200, labelKey: 'colorPicker.skyBlue', color: '#38BDF8' },
];

export function ColorPicker() {
  const { t } = useTranslation();
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
          {t('theme.hue')}
        </label>
        <Slider
          min={0}
          max={360}
          step={1}
          value={[hue]}
          onValueChange={([v]) => setHue(v ?? 0)}
          className="[&_[role=slider]]:shadow-flat"
        />
      </div>

      {/* Preset palette */}
      <div className="flex flex-col gap-1.5">
        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
          {t('theme.presets')}
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
                title={t(p.labelKey)}
                aria-label={t(p.labelKey)}
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
