import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Icon } from '@iconify/react';
import { motion } from 'framer-motion';

export function NotFoundPage() {
  const { t } = useTranslation();

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-6 px-4">
      {/* 404 number */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative"
      >
        <span className="text-[120px] sm:text-[160px] font-extrabold leading-none select-none bg-gradient-to-br from-primary via-primary/60 to-primary/20 bg-clip-text text-transparent">
          404
        </span>
        {/* Floating decorative elements */}
        <motion.div
          animate={{ y: [0, -8, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-4 -right-6 size-10 rounded-full bg-accent flex items-center justify-center shadow-flat"
        >
          <Icon icon="mdi:help-circle-outline" width={22} height={22} className="text-accent-foreground" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 6, 0], rotate: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
          className="absolute -bottom-2 -left-8 size-8 rounded-full bg-primary/10 flex items-center justify-center"
        >
          <Icon icon="mdi:compass-off-outline" width={18} height={18} className="text-primary" />
        </motion.div>
      </motion.div>

      {/* Text */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        className="text-center max-w-sm"
      >
        <h1 className="text-xl font-extrabold text-foreground mb-2">
          {t('error.pageNotFound')}
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {t('error.pageNotFoundDesc')}
        </p>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="flex items-center gap-3"
      >
        <Link to="/">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-[var(--radius-md)] bg-primary text-primary-foreground text-sm font-bold shadow-flat hover:shadow-flat-hover transition-all duration-200 hover:-translate-y-0.5"
          >
            <Icon icon="mdi:home-outline" width={16} height={16} />
            {t('error.goHome')}
          </button>
        </Link>
        <button
          type="button"
          onClick={() => window.history.back()}
          className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-[var(--radius-md)] border-[1.5px] border-border text-foreground text-sm font-bold hover:bg-accent/50 transition-all duration-200"
        >
          <Icon icon="mdi:arrow-left" width={16} height={16} />
          {t('common.back')}
        </button>
      </motion.div>
    </div>
  );
}
