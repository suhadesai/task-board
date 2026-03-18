'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';
import './Navbar.css';

export default function Navbar({
  onAddNote,
  onSignOut,
  isGuest = false,
  taskCount = 0,
  doneCount = 0,
  className = '',
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileRef = useRef(null);

  useEffect(() => {
    if (!mobileOpen) return;
    const handler = (e) => {
      if (mobileRef.current && !mobileRef.current.contains(e.target)) {
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [mobileOpen]);

  return (
    <nav className={`navbar-root ${className}`} role="navigation" aria-label="Main navigation">
      <motion.div
        className="navbar-panel"
        style={{ minWidth: 480 }}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 24, delay: 0.1 }}
        ref={mobileRef}
      >
        <motion.div className="navbar-logo" whileTap={{ scale: 0.96 }}>
          <div className="navbar-logo-mark">📌</div>
          <span className="navbar-logo-text">My Task Board</span>
        </motion.div>

        <div className="navbar-divider" />

        <div style={{ flex: 1, display: 'flex', alignItems: 'center', padding: '0 0.75rem' }}>
          <span className="navbar-stats-text">
            {doneCount}/{taskCount} done
            {isGuest && <span style={{ marginLeft: '0.5rem', fontSize: '0.65rem', opacity: 0.6 }}>(Guest)</span>}
          </span>
        </div>

        <div className="navbar-divider" />

        <div className="navbar-actions">
          {!isGuest && (
            <motion.button
              className="navbar-btn-ghost"
              onClick={onSignOut}
              whileTap={{ scale: 0.95 }}
            >
              Sign out
            </motion.button>
          )}
          
          {isGuest && (
            <motion.button
              className="navbar-btn-ghost"
              onClick={() => {
                if (window.confirm('This will clear all your guest tasks. Continue?')) {
                  onSignOut();
                }
              }}
              whileTap={{ scale: 0.95 }}
              title="Clear all guest data and start fresh"
            >
              End session
            </motion.button>
          )}

          <motion.button
            className="navbar-btn-primary"
            onClick={onAddNote}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.02 }}
          >
            + Add note
          </motion.button>
        </div>

        <motion.button
          className="navbar-menu-btn"
          onClick={() => setMobileOpen(v => !v)}
          aria-label="Toggle menu"
          aria-expanded={mobileOpen}
          whileTap={{ scale: 0.9 }}
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
            <AnimatePresence mode="wait" initial={false}>
              {mobileOpen ? (
                <motion.g
                  key="close"
                  initial={{ opacity: 0, rotate: -45 }}
                  animate={{ opacity: 1, rotate: 0 }}
                  exit={{ opacity: 0, rotate: 45 }}
                  transition={{ duration: 0.15 }}
                >
                  <line x1="2" y1="2" x2="13" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="13" y1="2" x2="2" y2="13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </motion.g>
              ) : (
                <motion.g
                  key="open"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <line x1="2" y1="4" x2="13" y2="4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="2" y1="7.5" x2="13" y2="7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <line x1="2" y1="11" x2="13" y2="11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </motion.g>
              )}
            </AnimatePresence>
          </svg>
        </motion.button>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              className="navbar-mobile-menu"
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.97 }}
              transition={{ type: 'spring', stiffness: 300, damping: 28 }}
            >
              <div className="navbar-mobile-actions">
                {!isGuest && (
                  <motion.button
                    className="navbar-btn-ghost"
                    onClick={() => { setMobileOpen(false); onSignOut?.(); }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    Sign out
                  </motion.button>
                )}
                
                {isGuest && (
                  <motion.button
                    className="navbar-btn-ghost"
                    onClick={() => { 
                      setMobileOpen(false); 
                      if (window.confirm('This will clear all your guest tasks. Continue?')) {
                        onSignOut?.();
                      }
                    }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    End session
                  </motion.button>
                )}

                <motion.button
                  className="navbar-btn-primary"
                  onClick={() => { setMobileOpen(false); onAddNote?.(); }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  + Add note
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </nav>
  );
}