import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Icon } from '@iconify/react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface NavItem {
  label: string;
  icon: string;
  path: string;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', icon: 'mdi:home', path: '/' },
  { label: 'Forum', icon: 'mdi:text-box-multiple', path: '/forum' },
  { label: 'AI Assistant', icon: 'mdi:robot-happy', path: '/ai' },
  { label: 'Messages', icon: 'mdi:message-text-outline', path: '/messages' },
  { label: 'Profile', icon: 'mdi:account-circle-outline', path: '/profile' },
  { label: 'Settings', icon: 'mdi:cog-outline', path: '/settings' },
];

export function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        className="hidden lg:flex flex-col w-64 h-screen border-r-[1.5px] border-border fixed left-0 top-0 z-30"
        style={{ backgroundColor: 'var(--sidebar-bg)' }}
      >
        {/* Logo area */}
        <div className="flex items-center gap-3 px-5 pt-5 pb-4">
          <div
            className="flex items-center justify-center size-14 rounded-2xl border-[2px] border-border shadow-flat"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            <Icon icon="mdi:forum" width={28} height={28} color="#fff" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold leading-tight text-foreground">LinkSee</span>
            <span className="text-xs font-semibold text-muted-foreground">
              LingXi Forum
            </span>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1">
          <nav className="flex flex-col gap-1 px-3 py-2">
            {NAV_ITEMS.map((item, index) => {
              const isActive = location.pathname === item.path;
              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.06 }}
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={isActive ? 'secondary' : 'ghost'}
                        className={`relative w-full justify-start gap-3 px-4 h-11 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}
                        onClick={() => navigate(item.path)}
                      >
                        {isActive && (
                          <motion.div
                            className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-r-full bg-primary"
                            layoutId="sidebar-active-indicator"
                            transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                          />
                        )}
                        <Icon icon={item.icon} width={22} height={22} />
                        <span className="text-sm font-semibold">{item.label}</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">{item.label}</TooltipContent>
                  </Tooltip>
                </motion.div>
              );
            })}
          </nav>
        </ScrollArea>

        {/* Bottom user area */}
        <Separator />
        <div className="flex items-center gap-3 px-5 py-4">
          <Avatar>
            <AvatarFallback>
              <Icon icon="mdi:account" width={16} height={16} />
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-bold truncate text-foreground">User</span>
          <Button variant="ghost" size="icon" className="ml-auto" aria-label="Theme">
            <Icon icon="mdi:palette-outline" width={18} height={18} />
          </Button>
        </div>
      </aside>
    </TooltipProvider>
  );
}
