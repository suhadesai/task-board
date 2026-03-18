import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NOTE_COLORS = ['#fef08a', '#bfdbfe', '#bbf7d0', '#f5d0fe', '#fed7aa'];

const COLUMNS = [
  { id: 'to-do', label: 'To Do'},
  { id: 'in-progress', label: 'In Progress'},
  { id: 'in-review', label: 'In Review'},
  { id: 'done', label: 'Done'},
];

export default function AddNoteModal({ isOpen, onClose, onSubmit, defaultCol = 'to-do' }) {
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [priority, setPriority] = useState('medium');
  const [col, setCol] = useState(defaultCol);
  const [due, setDue] = useState('');
  const [shake, setShake] = useState(false);
  const [colorIndex, setColorIndex] = useState(0);

  const titleRef = useRef(null);

  useEffect(() => { setCol(defaultCol); }, [defaultCol]);

  useEffect(() => {
    if (isOpen) {
      setColorIndex(Math.floor(Math.random() * NOTE_COLORS.length));
      setTimeout(() => titleRef.current?.focus(), 80);
    } else {
      setTitle(''); setDesc(''); setPriority('medium'); setDue('');
      setShake(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  const handleSubmit = () => {
    if (!title.trim()) {
      setShake(true);
      setTimeout(() => setShake(false), 500);
      titleRef.current?.focus();
      return;
    }
    onSubmit({
      colId: col,
      title: title.trim(),
      desc: desc.trim() || null,
      priority,
      due: due || null,
      colorIndex,
      pinIndex: Math.floor(Math.random() * 5),
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        //backdrop
        <motion.div
          key="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={onClose}
          style={{
            position: 'fixed', inset: 0, zIndex: 200,
            background: 'rgba(61,43,31,0.55)',
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <motion.div
            key="modal-card"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.92, rotate: -1.5, y: 24 }}
            animate={{
              opacity: 1, scale: 1,
              rotate: shake ? [0, -2, 2, -2, 2, 0] : -0.5,
              y: 0,
            }}
            exit={{ opacity: 0, scale: 0.92, rotate: 1, y: 16 }}
            transition={
              shake
                ? { rotate: { duration: 0.4, ease: 'easeInOut' } }
                : { type: 'spring', stiffness: 320, damping: 28 }
            }
            style={{
              width: '100%', maxWidth: 380,
              background: NOTE_COLORS[colorIndex],
              borderRadius: 3,
              padding: '24px 24px 20px',
              boxShadow: '4px 8px 32px rgba(0,0,0,0.35), 0 2px 6px rgba(0,0,0,0.2)',
              fontFamily: "'Shadows Into Light', cursive",
              position: 'relative',
            }}
          >
            <div style={{
              position: 'absolute', top: -9, left: '50%', transform: 'translateX(-50%)',
              width: 18, height: 18, borderRadius: '50%',
              background: 'radial-gradient(circle at 35% 35%, #e74c3cdd, #c0392b)',
              boxShadow: '0 2px 6px rgba(0,0,0,0.5), inset 0 1px 2px rgba(255,255,255,0.4)',
              zIndex: 1,
            }} />

            {/* Tape strip */}
            <div style={{
              position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)',
              width: 44, height: 20, background: 'rgba(255,255,255,0.4)',
              borderRadius: 2, pointerEvents: 'none',
            }} />

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 18 }}>
              <span style={{ fontSize: 24, fontWeight: 700, color: '#1a1a1a', fontFamily: "'Shadows Into Light', cursive" }}>
                New item
              </span>
              <button
                onClick={onClose}
                style={{
                  background: 'none', border: 'none', fontSize: 22,
                  cursor: 'pointer', color: 'rgba(0,0,0,0.35)',
                  lineHeight: 1, padding: '0 2px', borderRadius: 4,
                  fontFamily: "'Shadows Into Light', cursive", transition: 'color .15s',
                }}
                onMouseEnter={e => e.currentTarget.style.color = '#c0392b'}
                onMouseLeave={e => e.currentTarget.style.color = 'rgba(0,0,0,0.35)'}
                aria-label="Close modal"
              >×</button>
            </div>

            <Field label="What's the task?">
              <input
                ref={titleRef}
                value={title}
                onChange={e => setTitle(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleSubmit(); }}
                placeholder="Write something…"
                maxLength={80}
                style={{
                  ...inputBase,
                  borderBottomColor: shake ? '#e74c3c' : 'rgba(0,0,0,0.2)',
                }}
              />
            </Field>

            <Field label="Details (optional)">
              <textarea
                value={desc}
                onChange={e => setDesc(e.target.value)}
                placeholder="Any extra notes…"
                rows={3}
                style={{ ...inputBase, resize: 'none' }}
              />
            </Field>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label="Priority">
                <select value={priority} onChange={e => setPriority(e.target.value)} style={inputBase}>
                  <option value="urgent">Urgent!</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </Field>
              <Field label="Column">
                <select value={col} onChange={e => setCol(e.target.value)} style={inputBase}>
                  {COLUMNS.map(c => (
                    <option key={c.id} value={c.id}>{c.label}</option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label="Due date">
              <input
                type="date"
                value={due}
                onChange={e => setDue(e.target.value)}
                style={inputBase}
              />
            </Field>

            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 18 }}>
              <Btn onClick={onClose} style={cancelStyle}>Cancel</Btn>
              <Btn onClick={handleSubmit} style={submitStyle}>Pin it!</Btn>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 13 }}>
      <label style={{
        display: 'block', fontFamily: "'Shadows Into Light', cursive",
        fontSize: 15, fontWeight: 700, color: '#333', marginBottom: 3,
      }}>
        {label}
      </label>
      {children}
    </div>
  );
}

function Btn({ onClick, style, children }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        ...btnBase,
        ...style,
        opacity: hovered ? 0.88 : 1,
        transform: hovered ? 'scale(1.03)' : 'scale(1)',
      }}
    >
      {children}
    </button>
  );
}

const inputBase = {
  width: '100%',
  border: 'none',
  borderBottom: '2px solid rgba(0,0,0,0.2)',
  background: 'transparent',
  fontFamily: "'Shadows Into Light', cursive",
  fontSize: 15,
  color: '#1a1a1a',
  padding: '4px 0',
  outline: 'none',
  transition: 'border-color .15s',
};

const btnBase = {
  fontFamily: "'Shadows Into Light', cursive",
  fontSize: 17,
  fontWeight: 700,
  padding: '8px 22px',
  borderRadius: 6,
  cursor: 'pointer',
  border: 'none',
  boxShadow: '2px 3px 6px rgba(0,0,0,0.2)',
  transition: 'opacity .15s, transform .15s',
};

const cancelStyle = { background: '#ddd', color: '#333' };
const submitStyle = { background: '#e74c3c', color: 'white' };