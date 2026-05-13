import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  User,
  Palette,
  Bell,
  Shield,
  Info,
  Save,
  Check,
  ChevronRight,
  Camera,
  Loader2,
} from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { AvatarUpload } from '@/components/avatar/AvatarUpload';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useThemeStore } from '@/stores/useThemeStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { userApi } from '@linksee/api-client/user';
import { ColorPicker } from '@/components/theme/ColorPicker';
import { DarkModeToggle } from '@/components/theme/DarkModeToggle';
import { toast } from 'sonner';

type SettingsTab = 'account' | 'appearance' | 'notifications' | 'about';

export function SettingsPage() {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');

  const tabs: { key: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { key: 'account', label: t('settings.account'), icon: <User className="h-4 w-4" /> },
    { key: 'appearance', label: t('settings.appearance'), icon: <Palette className="h-4 w-4" /> },
    { key: 'notifications', label: t('settings.notifications'), icon: <Bell className="h-4 w-4" /> },
    { key: 'about', label: t('settings.about'), icon: <Info className="h-4 w-4" /> },
  ];

  return (
    <div className="flex flex-col gap-5">
      <h1 className="text-xl font-bold">{t('settings.title')}</h1>

      <div className="flex flex-col md:flex-row gap-5">
        {/* Tab Navigation — horizontal scroll on mobile, vertical sidebar on desktop */}
        <nav className="md:w-48 shrink-0">
          {/* Mobile: horizontal pills */}
          <div className="flex md:hidden gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex items-center gap-1.5 shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-colors',
                  activeTab === tab.key
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
          {/* Desktop: vertical card */}
          <Card className="hidden md:block">
            <CardContent className="p-2">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'flex items-center gap-2.5 w-full px-3 py-2 rounded-lg text-sm transition-colors',
                    activeTab === tab.key
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground'
                  )}
                >
                  {tab.icon}
                  {tab.label}
                  <ChevronRight className="h-3 w-3 ml-auto opacity-50" />
                </button>
              ))}
            </CardContent>
          </Card>
        </nav>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 'account' && <AccountSettings />}
            {activeTab === 'appearance' && <AppearanceSettings />}
            {activeTab === 'notifications' && <NotificationSettings />}
            {activeTab === 'about' && <AboutSection />}
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// === Account Settings ===

function AccountSettings() {
  const { t } = useTranslation();
  const user = useAuthStore((s) => s.user);
  const updateUser = useAuthStore((s) => s.updateUser);

  const [nickname, setNickname] = useState(user?.nickname ?? '');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [occupation, setOccupation] = useState('');
  const [education, setEducation] = useState('');
  const [personalWebsite, setPersonalWebsite] = useState('');
  const [skillsTags, setSkillsTags] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);

  // Load profile data on mount
  const loadedRef = useRef(false);
  useEffect(() => {
    if (loadedRef.current) return;
    loadedRef.current = true;
    (async () => {
      try {
        const res = await userApi.getProfile();
        const body = res.data.data as { user?: Record<string, unknown>; profile?: Record<string, unknown> };
        const userData = body?.user;
        const profileData = body?.profile;
        if (userData?.nickname) setNickname(String(userData.nickname));
        if (profileData?.bio) setBio(String(profileData.bio));
        if (profileData?.location) setLocation(String(profileData.location));
        if (profileData?.occupation) setOccupation(String(profileData.occupation));
        if (profileData?.education) setEducation(String(profileData.education));
        if (profileData?.personalWebsite) setPersonalWebsite(String(profileData.personalWebsite));
        if (Array.isArray(profileData?.skillsTags)) setSkillsTags((profileData.skillsTags as string[]).join(', '));
      } catch { /* use defaults */ }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        nickname: nickname || undefined,
        bio: bio || undefined,
        location: location || undefined,
        occupation: occupation || undefined,
        education: education || undefined,
        personalWebsite: personalWebsite || undefined,
        skillsTags: skillsTags
          ? skillsTags.split(',').map((s) => s.trim()).filter(Boolean)
          : undefined,
      };
      await userApi.updateProfile(payload);
      updateUser({ nickname });
      setSaved(true);
      toast.success(t('settings.profileUpdated'));
      setTimeout(() => setSaved(false), 2000);
    } catch {
      toast.error(t('settings.profileUpdateFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.account')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="group relative shrink-0 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={() => setAvatarOpen(true)}
              title={t('settings.changeAvatar')}
            >
              <Avatar className="h-16 w-16">
                {user?.avatarUrl ? (
                  <AvatarImage src={user.avatarUrl} alt={user.nickname} />
                ) : null}
                <AvatarFallback className="text-lg font-bold bg-primary/10 text-primary">
                  {(user?.nickname ?? 'U').slice(0, 1)}
                </AvatarFallback>
              </Avatar>
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera className="h-5 w-5 text-white" />
              </div>
            </button>
            <div className="flex flex-col gap-1">
              <span className="text-sm font-medium">{user?.nickname ?? 'User'}</span>
              <span className="text-xs text-muted-foreground">@{user?.username ?? 'user'}</span>
              <Button
                variant="outline"
                size="sm"
                className="w-fit mt-1"
                onClick={() => setAvatarOpen(true)}
              >
                {t('settings.changeAvatar')}
              </Button>
            </div>
          </div>

          <Separator />

          {/* Fields */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {t('settings.username')}
              </label>
              <Input value={user?.nickname ?? ''} disabled className="bg-muted/50" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {t('settings.email')}
              </label>
              <Input value="user@example.com" disabled className="bg-muted/50" />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              {t('settings.nickname')}
            </label>
            <Input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder={t('settings.nickname')}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              {t('settings.bio')}
            </label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder={t('profile.noBioYet')}
              rows={3}
              className="resize-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {t('profile.location')}
              </label>
              <Input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder={t('profile.location')}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {t('profile.occupation')}
              </label>
              <Input
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder={t('profile.occupation')}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {t('profile.education')}
              </label>
              <Input
                value={education}
                onChange={(e) => setEducation(e.target.value)}
                placeholder={t('profile.education')}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {t('profile.personalWebsite')}
              </label>
              <Input
                value={personalWebsite}
                onChange={(e) => setPersonalWebsite(e.target.value)}
                placeholder="https://"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              {t('profile.skills')}
            </label>
            <Input
              value={skillsTags}
              onChange={(e) => setSkillsTags(e.target.value)}
              placeholder="React, TypeScript, Node.js"
            />
            <span className="text-[10px] text-muted-foreground">
              {t('settings.skillsHint')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
              ) : saved ? (
                <Check className="h-3.5 w-3.5 mr-1" />
              ) : (
                <Save className="h-3.5 w-3.5 mr-1" />
              )}
              {saving ? t('settings.saving') : t('settings.updateProfile')}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Password Card */}
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.changePassword')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              {t('settings.currentPassword')}
            </label>
            <Input type="password" placeholder="********" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {t('settings.newPassword')}
              </label>
              <Input type="password" placeholder="********" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-muted-foreground">
                {t('settings.confirmPassword')}
              </label>
              <Input type="password" placeholder="********" />
            </div>
          </div>
          <Button size="sm">{t('auth.signInToAccount')}</Button>
        </CardContent>
      </Card>

      <AvatarUpload open={avatarOpen} onOpenChange={setAvatarOpen} />
    </div>
  );
}

// === Appearance Settings ===

function AppearanceSettings() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.appearance')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {/* Theme Mode */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <span className="text-sm font-medium">{t('settings.themeMode')}</span>
              <span className="text-xs text-muted-foreground">
                {t('theme.settings')}
              </span>
            </div>
            <DarkModeToggle />
          </div>

          <Separator />

          {/* Color */}
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium">{t('settings.accentColor')}</span>
            <ColorPicker />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// === Notification Settings ===

function NotificationSettings() {
  const { t } = useTranslation();
  const [prefs, setPrefs] = useState({
    email: true,
    push: true,
    mention: true,
    reply: true,
    like: false,
    system: true,
  });

  const toggle = (key: keyof typeof prefs) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const items: { key: keyof typeof prefs; label: string }[] = [
    { key: 'email', label: t('settings.emailNotifications') },
    { key: 'push', label: t('settings.pushNotifications') },
    { key: 'mention', label: t('settings.mentionNotifications') },
    { key: 'reply', label: t('settings.replyNotifications') },
    { key: 'like', label: t('settings.likeNotifications') },
    { key: 'system', label: t('settings.systemNotifications') },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('settings.notifications')}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col divide-y divide-border">
          {items.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between py-3 first:pt-0 last:pb-0"
            >
              <span className="text-sm">{item.label}</span>
              <Checkbox
                checked={prefs[item.key]}
                onCheckedChange={() => toggle(item.key)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// === About Section ===

function AboutSection() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.about')}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center">
              <span className="text-xl font-bold text-primary-foreground">L</span>
            </div>
            <div>
              <h3 className="text-base font-bold">{t('common.appName')}</h3>
              <p className="text-xs text-muted-foreground">
                {t('common.appDescription')}
              </p>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">{t('settings.version')}</span>
              <span className="font-medium">v0.1.0</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="text-xs text-muted-foreground">Stack</span>
              <span className="font-medium">React 19 + Spring Boot 3</span>
            </div>
          </div>

          <Separator />

          <div className="flex flex-col gap-2">
            <Button variant="outline" size="sm" className="w-fit">
              <Info className="h-3.5 w-3.5 mr-1.5" />
              {t('settings.openSource')}
            </Button>
            <Button variant="outline" size="sm" className="w-fit">
              {t('settings.feedback')}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
