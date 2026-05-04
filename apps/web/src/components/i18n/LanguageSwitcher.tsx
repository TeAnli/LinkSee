import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const languages = [
  { code: 'zh-CN', label: '简体中文', flag: '🇨🇳' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
] as const;

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label="Switch language"
          className="relative"
        >
          <Icon icon="mdi:translate" width={18} height={18} />
          <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 text-[9px] font-bold leading-none select-none text-muted-foreground">
            {i18n.language === 'zh-CN' ? '中' : 'EN'}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={8} className="lang-dropdown-content w-[156px] overflow-hidden rounded-lg p-1.5">
        <div className="px-2 py-1.5 mb-0.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Language
          </span>
        </div>
        <DropdownMenuRadioGroup
          value={i18n.language}
          onValueChange={(val) => i18n.changeLanguage(val)}
        >
          {languages.map((lang) => (
            <DropdownMenuRadioItem
              key={lang.code}
              value={lang.code}
              className="lang-dropdown-item flex items-center gap-2.5 rounded-md px-2.5 py-2 cursor-pointer text-[13px] font-semibold"
            >
              <span className="text-base leading-none">{lang.flag}</span>
              <span>{lang.label}</span>
              <Icon
                icon="mdi:check-bold"
                width={14}
                height={14}
                className="ml-auto opacity-0 lang-item-check transition-opacity duration-150"
              />
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
