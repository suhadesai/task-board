import { useEffect, useRef, useState, useCallback } from 'react';
import { gsap } from 'gsap';
import './KanbanBoard.css';
import EditNoteModal from './EditNoteModal';

const NOTE_COLORS = [
  { bg: '#fef08a', shadow: '#d4b800' },
  { bg: '#bfdbfe', shadow: '#3b82f6' },
  { bg: '#bbf7d0', shadow: '#22c55e' },
  { bg: '#f5d0fe', shadow: '#a855f7' },
  { bg: '#fed7aa', shadow: '#f97316' },
];
const PIN_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f39c12', '#9b59b6'];
const PRIORITY_COLORS = { urgent: '#e74c3c', high: '#f39c12', medium: '#3b82f6', low: '#22c55e' };
const PRIORITY_LABELS = { urgent: 'Urgent', high: 'High', medium: 'Medium', low: 'Low' };

const EMPTY_STATES = {
  'to-do': {text: 'Nothing queued up.', hint: 'Add a task to get started.' },
  'in-progress': {text: 'No work in flight.', hint: 'Drag a card here to start.' },
  'in-review':{text: 'Nothing to review.', hint: 'Move a card here when ready.' },
  'done':{text: 'No wins yet.', hint: 'Completed tasks appear here.' },
};

const HANDWRITTEN = "'Shadows Into Light', cursive";

function formatDate(dateStr) {
  if (!dateStr) return null;
  const [, m, d] = dateStr.split('-');
  return `${+m}/${+d}`;
}

function getDueUrgency(dateStr, colId) {
  if (!dateStr || colId === 'done') return null;
  const today = new Date().toISOString().split('T')[0];
  if (dateStr < today) return 'overdue';
  const diffDays = Math.round((new Date(dateStr) - new Date(today)) / (1000 * 60 * 60 * 24));
  if (diffDays <= 2) return 'soon';
  return 'upcoming';
}

function StickyNote({ task, isDragging, onDelete, onEdit, onDragStart, onDragEnd }) {
  const [hovered, setHovered] = useState(false);
  const rotationRef = useRef(parseFloat(((Math.random() - 0.5) * 6).toFixed(2)));

  const color = NOTE_COLORS[task.colorIndex % NOTE_COLORS.length];
  const pinColor = PIN_COLORS[task.pinIndex % PIN_COLORS.length];
  const urgency = getDueUrgency(task.due, task.colId);
  const formattedDue = formatDate(task.due);
  const rotation = rotationRef.current;

  const urgencyStyles = {
    overdue: { bg: '#fde8e8', color: '#c0392b', border: '#e74c3c', icon: '⚠', label: 'Overdue' },
    soon:    { bg: '#fef3cd', color: '#92400e', border: '#f39c12', icon: '◷', label: 'Due soon' },
    upcoming:{ bg: 'rgba(0,0,0,0.07)', color: '#444', border: 'transparent', icon: '', label: '' },
  };
  const us = urgency ? urgencyStyles[urgency] : null;

  const handleDragStart = useCallback((e) => {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', String(task.id));
    onDragStart?.(e, task.id);
  }, [task.id, onDragStart]);

  const noteStyle = {
    position: 'relative',
    padding: '12px 12px 26px',
    borderRadius: '2px',
    background: color.bg,
    cursor: isDragging ? 'grabbing' : 'pointer',
    userSelect: 'none',
    fontFamily: HANDWRITTEN,
    boxShadow: hovered && !isDragging
      ? '4px 8px 20px rgba(0,0,0,.30), 0 1px 3px rgba(0,0,0,.15)'
      : '2px 4px 12px rgba(0,0,0,.22), 0 1px 2px rgba(0,0,0,.12)',
    transform: isDragging
      ? 'rotate(4deg) scale(1.07)'
      : hovered
      ? 'rotate(0deg) scale(1.04)'
      : `rotate(${rotation}deg)`,
    opacity: isDragging ? 0.38 : 1,
    transition: isDragging
      ? 'none'
      : 'transform .18s ease, box-shadow .18s ease, opacity .15s ease',
    willChange: 'transform',
  };

  return (
    <div
      style={noteStyle}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onEdit?.(task)}
      aria-label={`Task: ${task.title}. Click to edit.`}
    >

      <div style={{
        position: 'absolute', top: -8, left: '50%', transform: 'translateX(-50%)',
        width: 16, height: 16, borderRadius: '50%',
        background: `radial-gradient(circle at 35% 35%, ${pinColor}dd, ${pinColor})`,
        boxShadow: '0 2px 5px rgba(0,0,0,.5), inset 0 1px 2px rgba(255,255,255,.45)',
        zIndex: 1,
      }} aria-hidden="true" />


      <button
        style={{
          position: 'absolute', top: 5, right: 6,
          background: 'none', border: 'none', fontSize: 16, lineHeight: 1,
          cursor: 'pointer', color: hovered ? 'rgba(0,0,0,.45)' : 'transparent',
          transition: 'color .15s, background .15s', padding: '1px 4px',
          borderRadius: 4, fontFamily: 'sans-serif',
        }}
        onClick={(e) => { 
          e.stopPropagation(); 
          onDelete?.(task.id); 
        }}
        onMouseEnter={(e) => { 
          e.currentTarget.style.background = 'rgba(231,76,60,.15)'; 
          e.currentTarget.style.color = '#e74c3c'; 
        }}
        onMouseLeave={(e) => { 
          e.currentTarget.style.background = 'none'; 
          e.currentTarget.style.color = hovered ? 'rgba(0,0,0,.45)' : 'transparent'; 
        }}
        aria-label="Delete task"
      >✕</button>

      <p style={{ 
        margin: '6px 0 4px', 
        fontSize: 17, 
        fontWeight: 700, 
        color: '#1a1a1a', 
        lineHeight: 1.3, 
        fontFamily: HANDWRITTEN 
      }}>
        {task.title}
      </p>
      {task.desc && (
        <p style={{
          margin: '0 0 4px', 
          fontSize: 13, 
          color: '#444', 
          lineHeight: 1.45,
          display: '-webkit-box', 
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical', 
          overflow: 'hidden',
          fontFamily: HANDWRITTEN,
        }}>{task.desc}</p>
      )}

      <div style={{
        position: 'absolute',
        bottom: 7,
        left: 10,
        right: 10,
        bottom: 7, 
        gap: 5,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span
          title={PRIORITY_LABELS[task.priority]}
          style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: PRIORITY_COLORS[task.priority] ?? '#888',
            border: '1.5px solid rgba(0,0,0,.18)',
            flexShrink: 0,
          }}
        />
        {formattedDue && (
          <span style={{
            fontSize: 15,
            fontFamily: HANDWRITTEN ,
            fontWeight: urgency === 'overdue' || urgency === 'soon' ? 2000 : 900,
            color: urgency === 'overdue' ? 'red' : urgency === 'soon' ? 'maroon' : '#666',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 3,
          }}>
            {urgency === 'overdue' && <span>⚠</span>}
            {urgency === 'soon' && <span>◷</span>}
            {formattedDue}
          </span>
        )}
      </div>


    </div>
  );
}

function Toast({ message, type = 'success' }) {
  return <div className={`kanban-toast ${type}`}>{message}</div>;
}

const DEFAULT_COLUMNS = [
  { id: 'to-do', label: 'to-do', rotation: 0, pillBg: '#ffffff', pillColor: '#111111', hoverBg: '#fef3c7', hoverColor: '#92400e' },
  { id: 'in-progress', label: 'in-progress', rotation: 0, pillBg: '#ffffff', pillColor: '#111111', hoverBg: '#dbeafe', hoverColor: '#1e40af' },
  { id: 'in-review', label: 'in-review', rotation: 0, pillBg: '#ffffff', pillColor: '#111111', hoverBg: '#f3e8ff', hoverColor: '#6b21a8' },
  { id: 'done', label: 'done', rotation: 0, pillBg: '#ffffff', pillColor: '#111111', hoverBg: '#dcfce7', hoverColor: '#14532d' },
];

const DEFAULT_CARDS = [];

function KanbanColHeader({ col, count, headerRef }) {
  return (
    <div
      ref={headerRef}
      className="kanban-col-header"
      style={{
        '--pill-bg': col.pillBg || '#ffffff',
        '--pill-color': col.pillColor || '#111111',
        '--hover-bg': col.hoverBg || '#f3f4f6',
        '--hover-color': col.hoverColor || '#111111',
        '--item-rot': `${col.rotation ?? 0}deg`,
      }}
    >
      <span className="kanban-col-header-label">{col.label}</span>
      <span className="kanban-col-header-count">{count}</span>
    </div>
  );
}


export default function KanbanBoard({
  columns = DEFAULT_COLUMNS,
  initialCards = DEFAULT_CARDS,
  externalCards,
  onCardsChange,
  onAddCard,
  onCardMove,
  onEditTask,
  onDeleteTask,
  animationEase = 'back.out(1.5)',
  animationDuration = 0.55,
  staggerDelay = 0.1,
  className = '',
}) {
  const isControlled = externalCards !== undefined;
  const [internalCards, setInternalCards] = useState(initialCards);
  const cards = isControlled ? externalCards : internalCards;
  const setCards = isControlled ? onCardsChange : setInternalCards;

  const [draggingId, setDraggingId] = useState(null);
  const [dragOverCol, setDragOverCol] = useState(null);
  const [toast, setToast] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const headerRefs = useRef({});
  const cardRefs = useRef({});

  const showToast = useCallback((message, type = 'success', ms = 2200) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), ms);
  }, []);


  useEffect(() => {
    const timer = setTimeout(() => {
      const headers = columns.map(c => headerRefs.current[c.id]).filter(Boolean);
      if (headers.length > 0) {
        gsap.set(headers, { scale: 0, transformOrigin: '50% 50%' });
        headers.forEach((el, i) => {
          gsap.to(el, {
            scale: 1,
            duration: animationDuration,
            ease: animationEase,
            delay: i * staggerDelay,
          });
        });
      }
    }, 100);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);



  const handleDragStart = useCallback((e, cardId) => {
    setDraggingId(cardId);
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggingId(null);
    setDragOverCol(null);
  }, []);

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCol(colId);
  };

  const handleDrop = (e, colId) => {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('text/plain');
    if (!cardId) return;
    
    const updated = cards.map(c => c.id === cardId ? { ...c, colId } : c);
    setCards(updated);
    
    if (onCardMove) {
      onCardMove(cardId, colId, updated);
    }
    
    setDraggingId(null);
    setDragOverCol(null);
    
    const col = columns.find(c => c.id === colId);
    if (col) showToast(`Moved to ${col.label} ✓`);
  };

  const handleDelete = useCallback((id) => {
    const updated = cards.filter(c => c.id !== id);
    setCards(updated);
    
    if (onDeleteTask) {
      onDeleteTask(id);
    }
    
    showToast('Card deleted', 'error');
  }, [cards, setCards, onDeleteTask, showToast]);

  const handleEditOpen = useCallback((task) => {
    setEditingTask(task);
    setEditModalOpen(true);
  }, []);

  const handleEditClose = useCallback(() => {
    setEditModalOpen(false);
    setEditingTask(null);
  }, []);

  const handleEditSubmit = useCallback((updatedTask) => {
    const updated = cards.map(c => c.id === updatedTask.id ? updatedTask : c);
    setCards(updated);
    
    if (onEditTask) {
      onEditTask(updatedTask);
    }
    
    showToast('Note updated ✓');
  }, [cards, setCards, onEditTask, showToast]);

  const handleAddCard = (colId) => {
    onAddCard?.(colId);
  };

  return (
    <>
      <div className={`kanban-board ${className}`} role="region" aria-label="Kanban board">
        {columns.map(col => {
          const colCards = cards.filter(c => c.colId === col.id);
          const empty = EMPTY_STATES[col.id] ?? { icon: '📌', text: 'Nothing here.', hint: 'Add a card below.' };

          return (
            <div key={col.id} className="kanban-col">
              <KanbanColHeader
                col={col}
                count={colCards.length}
                headerRef={el => { headerRefs.current[col.id] = el; }}
              />

              <div
                className={`kanban-col-lane ${dragOverCol === col.id ? 'drag-over' : ''}`}
                onDragOver={e => handleDragOver(e, col.id)}
                onDragLeave={() => setDragOverCol(null)}
                onDrop={e => handleDrop(e, col.id)}
                role="list"
                aria-label={`${col.label} column`}
              >
                {colCards.length === 0 && (
                  <div className="kanban-empty">
                    <span className="kanban-empty-icon">{empty.icon}</span>
                    <span className="kanban-empty-text">{empty.text}</span>
                    <span className="kanban-empty-hint">{empty.hint}</span>
                  </div>
                )}

                {colCards.map(card => (
                  <div
                    key={card.id}
                    ref={el => { cardRefs.current[card.id] = el; }}
                    role="listitem"
                    style={{ paddingTop: '12px' }}
                  >
                    <StickyNote
                      task={card}
                      isDragging={draggingId === card.id}
                      onDelete={handleDelete}
                      onEdit={handleEditOpen}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                    />
                  </div>
                ))}
              </div>

              <button
                className="kanban-add-btn"
                onClick={() => handleAddCard(col.id)}
                aria-label={`Add note to ${col.label}`}
              >
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <line x1="5.5" y1="1" x2="5.5" y2="10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <line x1="1" y1="5.5" x2="10" y2="5.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                add note
              </button>
            </div>
          );
        })}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} />}

      <EditNoteModal
        isOpen={editModalOpen}
        onClose={handleEditClose}
        onSubmit={handleEditSubmit}
        task={editingTask}
      />
    </>
  );
}