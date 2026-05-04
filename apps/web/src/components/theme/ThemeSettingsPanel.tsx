import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { ColorPicker } from './ColorPicker';
import { DarkModeToggle } from './DarkModeToggle';

export function ThemeSettingsPanel() {
  const { t } = useTranslation();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" aria-label={t('theme.settings')}>
          <Icon icon="mdi:palette-outline" width={20} height={20} />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="min-w-[260px] p-4" align="end" sideOffset={8}>
        <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
          {t('theme.settings')}
        </h3>
        <ColorPicker />

        <Separator className="my-3" />

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground">{t('theme.mode')}</span>
          <div className="ml-auto">
            <DarkModeToggle />
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
