import { useState, useCallback, useRef, type ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import Cropper, { type Area } from 'react-easy-crop';
import { Icon } from '@iconify/react';
import { toast } from 'sonner';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { useAuthStore } from '@/stores/useAuthStore';
import { userApi } from '@linksee/api-client/user';
import { getCroppedImg, readFileAsDataURL } from './cropUtils';

interface AvatarUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AvatarUpload({ open, onOpenChange }: AvatarUploadProps) {
  const { t } = useTranslation();
  const updateUser = useAuthStore((s) => s.updateUser);

  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const originalFileName = useRef<string>('avatar.png');

  const resetState = useCallback(() => {
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    setUploading(false);
  }, []);

  const handleFileChange = useCallback(async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error(t('settings.invalidImageType'));
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('settings.imageTooLarge'));
      return;
    }

    originalFileName.current = file.name;
    try {
      const dataUrl = await readFileAsDataURL(file);
      setImageSrc(dataUrl);
    } catch {
      toast.error(t('settings.imageLoadFailed'));
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [t]);

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleSave = useCallback(async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    setUploading(true);
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels, rotation);
      const file = new File([croppedBlob], originalFileName.current, {
        type: 'image/png',
      });

      const res = await userApi.uploadAvatar(file);
      const avatarUrl = (res.data.data as unknown as { avatarUrl: string })?.avatarUrl;

      if (avatarUrl) {
        updateUser({ avatarUrl });
      }

      toast.success(t('settings.avatarUpdated'));
      onOpenChange(false);
      resetState();
    } catch {
      toast.error(t('settings.avatarUploadFailed'));
    } finally {
      setUploading(false);
    }
  }, [imageSrc, croppedAreaPixels, rotation, t, updateUser, onOpenChange, resetState]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) resetState();
      onOpenChange(open);
    },
    [onOpenChange, resetState],
  );

  const triggerFileInput = () => fileInputRef.current?.click();

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>{t('settings.changeAvatar')}</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {imageSrc ? (
            <>
              {/* Cropper area */}
              <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-black/5">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  cropShape="round"
                  showGrid={false}
                  onCropChange={setCrop}
                  onCropComplete={onCropComplete}
                  onZoomChange={setZoom}
                />
              </div>

              {/* Zoom slider */}
              <div className="flex items-center gap-3 px-1">
                <Icon icon="mdi:magnify-minus" width={16} height={16} className="text-muted-foreground shrink-0" />
                <Slider
                  value={[zoom]}
                  min={1}
                  max={3}
                  step={0.1}
                  onValueChange={([v]) => { if (v !== undefined) setZoom(v); }}
                  className="flex-1"
                />
                <Icon icon="mdi:magnify-plus" width={16} height={16} className="text-muted-foreground shrink-0" />
              </div>

              {/* Re-select button */}
              <Button variant="outline" size="sm" className="w-full" onClick={triggerFileInput}>
                <Icon icon="mdi:image-outline" width={16} height={16} className="mr-1.5" />
                {t('settings.chooseAnotherImage')}
              </Button>
            </>
          ) : (
            /* Drop zone */
            <button
              type="button"
              onClick={triggerFileInput}
              className="flex flex-col items-center justify-center gap-3 w-full aspect-square rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-muted/30 transition-colors cursor-pointer"
            >
              <Icon icon="mdi:image-plus-outline" width={48} height={48} className="text-muted-foreground/50" />
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  {t('settings.clickToSelectImage')}
                </p>
                <p className="text-xs text-muted-foreground/60 mt-1">
                  JPG, PNG, GIF &middot; {t('settings.maxFileSize')} 5MB
                </p>
              </div>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={uploading}>
            {t('settings.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={!imageSrc || uploading}>
            {uploading ? (
              <>
                <Icon icon="mdi:loading" width={16} height={16} className="mr-1.5 animate-spin" />
                {t('settings.uploading')}
              </>
            ) : (
              t('settings.save')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
