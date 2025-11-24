import React, { useState, useEffect, useRef } from 'react';
import styles from './MobileNavMenu.module.css';
import { X, Menu, Rocket, Star, Calendar, PlayCircle, Zap, Flame } from 'lucide-react';
import DevFlowHubLogo from '../ui/DevFlowHubLogo';

const MENU_ITEMS = [
  { label: 'Start Building Free', icon: <Rocket size={22} />, cta: true },
  { label: 'Features', icon: <Star size={22} /> },
  { label: 'Pricing', icon: <Zap size={22} /> },
  { label: 'Login', icon: <PlayCircle size={22} /> },
];
const SECONDARY_ITEMS = [
  { label: 'Book a Demo', icon: <Calendar size={22} /> },
  { label: 'Watch Demo', icon: <PlayCircle size={22} /> },
];

export default function MobileNavMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  // Lock scroll when menu is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open]);
  // ESC key to close
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    if (open) window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [open]);
  // Click outside to close
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (open && menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [open]);
  // Swipe to close
  useEffect(() => {
    let startX = 0;
    const onTouchStart = (e: TouchEvent) => { startX = e.touches[0].clientX; };
    const onTouchMove = (e: TouchEvent) => {
      if (open && startX && e.touches[0].clientX - startX > 60) setOpen(false);
    };
    if (open) {
      window.addEventListener('touchstart', onTouchStart);
      window.addEventListener('touchmove', onTouchMove);
    }
    return () => {
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
    };
  }, [open]);
  // Hamburger to X animation
  return (
    <>
      <button
        aria-label={open ? 'Close menu' : 'Open menu'}
        className={styles.hamburger}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-nav-menu"
      >
        {open ? <X size={32} /> : <Menu size={32} />}
      </button>
      <div
        className={styles.backdrop + (open ? ' ' + styles.open : '')}
        aria-hidden={!open}
        tabIndex={-1}
        onClick={() => setOpen(false)}
      />
      <nav
        id="mobile-nav-menu"
        className={styles.menu + (open ? ' ' + styles.open : '')}
        ref={menuRef}
        aria-modal="true"
        role="dialog"
        tabIndex={-1}
      >
        <div className={styles.header}>
          <DevFlowHubLogo className="h-9" />
          <button
            aria-label="Close menu"
            className={styles.closeBtn}
            onClick={() => setOpen(false)}
          >
            <X size={28} />
          </button>
        </div>
        <ul className={styles.menuList}>
          {MENU_ITEMS.map((item, i) => (
            <li
              key={item.label}
              className={
                styles.menuItem +
                (item.cta ? ' ' + styles.cta : '')
              }
              style={{ animationDelay: `${i * 50}ms` }}
              tabIndex={0}
              role="menuitem"
              aria-label={item.label}
            >
              <span className={styles.icon}>{item.icon}</span>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
        <div className={styles.divider} />
        <ul className={styles.menuList + ' ' + styles.secondary}>
          {SECONDARY_ITEMS.map((item, i) => (
            <li
              key={item.label}
              className={styles.menuItem + ' ' + styles.secondaryItem}
              style={{ animationDelay: `${(MENU_ITEMS.length + i) * 50}ms` }}
              tabIndex={0}
              role="menuitem"
              aria-label={item.label}
            >
              <span className={styles.icon}>{item.icon}</span>
              <span>{item.label}</span>
            </li>
          ))}
        </ul>
        <div className={styles.divider} />
        <div className={styles.brandInfo}>
          <div className={styles.betaBadge}><Flame size={16} /> Now in Beta - Free for Early Adopters</div>
          <div className={styles.powered}><Zap size={16} /> AI-Powered Development Platform</div>
        </div>
      </nav>
    </>
  );
} 