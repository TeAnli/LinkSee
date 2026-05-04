import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggle = () => {
    const next = i18n.language === 'zh-CN' ? 'en' : 'zh-CN';
    i18n.changeLanguage(next);
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" onClick={toggle} aria-label="Switch language">
            <Icon
              icon={i18n.language === 'zh-CN' ? 'mdi:translate' : 'mdi:translate-off'}
              width={18}
              height={18}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom">
          {i18n.language === 'zh-CN' ? 'English' : '中文'}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
