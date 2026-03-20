import Grainient from './components/Grainient';
import Navbar from './components/Navbar';
import KanbanBoard from './components/KanbanBoard';
import { useState, useEffect } from 'react';
import AuthPage from './components/AuthPage';
import AddNoteModal from './components/AddNoteModal';
import { supabase } from './supabase';

function App() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]); 
  const [modalOpen, setModalOpen] = useState(false);
  const [defaultCol, setDefaultCol] = useState('to-do');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      console.log('Checking session...');
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Session:', session);
      
      if (session?.user) {
        setUser(session.user);
      } else {
        try {
          const { data, error } = await supabase.auth.signInAnonymously();
          if (error) {
            console.error('Error creating anonymous session:', error);
          } else {
            console.log('Anonymous session created:', data.user);
            setUser(data.user);
          }
        } catch (err) {
          console.error('Failed to create anonymous session:', err);
        }
      }
      
      setLoading(false);
    };

    init();


    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, session);
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      console.log('No user yet');
      setTasks([]);
      return;
    }

    console.log('Loading tasks for user:', user.id);
    const loadTasks = async () => {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at');

      if (error) {
        console.error('Error loading tasks:', error);
      } else {
        console.log('Raw data from DB:', data);
        
        const mappedTasks = data.map(task => ({
          id: task.id,
          title: task.title,
          desc: task.description,
          priority: task.priority || 'medium',
          colId: task.status,
          due: task.due_date,
          user_id: task.user_id,
          created_at: task.created_at,
          colorIndex: task.colorIndex || Math.floor(Math.random() * 4),
          pinIndex: task.pinIndex || Math.floor(Math.random() * 5)
        }));
        
        console.log('Mapped tasks:', mappedTasks);
        setTasks(mappedTasks);
      }
    };

    loadTasks();
  }, [user]);
 
  const handleOpenModal = (col = 'to-do') => {
    setDefaultCol(col);
    setModalOpen(true);
  };
 
  const handleAddTask = async (task) => {
    console.log('Adding task:', task);
    
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title: task.title,
        status: task.colId,
        description: task.desc || null,
        priority: task.priority || 'medium',
        due_date: task.due || null,
        user_id: user.id //for rls
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding task:', error);
      return;
    }
    
    console.log('Task added to DB:', data);
    
    const newTask = {
      id: data.id,
      title: data.title,
      desc: data.description,
      priority: data.priority || 'medium',
      colId: data.status,
      due: data.due_date,
      user_id: data.user_id,
      created_at: data.created_at,
      colorIndex: task.colorIndex,
      pinIndex: task.pinIndex
    };
    
    setTasks(prev => [...prev, newTask]);
  };

  const handleCardMove = async (cardId, newColId, updatedCards) => {
    setTasks(updatedCards);
    
    const { error } = await supabase
      .from('tasks')
      .update({ status: newColId })
      .eq('id', cardId)
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error moving task:', error);
    }
  };
  
  const handleEditTask = async (updatedTask) => {
    console.log('Updating task:', updatedTask);
    
    setTasks(prev => prev.map(t => t.id === updatedTask.id ? updatedTask : t));
        const { error } = await supabase
      .from('tasks')
      .update({
        title: updatedTask.title,
        description: updatedTask.desc,
        priority: updatedTask.priority,
        status: updatedTask.colId,
        due_date: updatedTask.due
      })
      .eq('id', updatedTask.id)
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error updating task:', error);
    }
  };

  const handleDeleteTask = async (taskId) => {
    setTasks(prev => prev.filter(t => t.id !== taskId));
    
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('user_id', user.id);
    
    if (error) {
      console.error('Error deleting task:', error);
    }
  };
  
  const handleGuestSignIn = async () => {
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error) {
      console.error(error);
      return;
    }
    setUser(data.user);
  };

  const handleEmailSignUp = async ({ name, password }) => {
    const { data, error } = await supabase.auth.signUp({
      email: name,
      password
    });
  
    if (error) throw error;
    setUser(data.user);
  };
  
  const handleEmailSignIn = async ({ name, password }) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: name,
      password
    });
  
    if (error) throw error;
    setUser(data.user);
  };
  
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setTasks([]);
  };
  
  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh',
        background: '#588157',
        color: 'white',
        fontFamily: 'Playfair Display, serif'
      }}>
        Loading...
      </div>
    );
  }

  if (!user) {
    return (
      <AuthPage
        onSignIn={handleEmailSignIn}
        onSignUp={handleEmailSignUp}
        onGuest={handleGuestSignIn} 
      />
    );
  }

  return (
    <>
      <div style={{ width: '100vw', height: '100vh', position: 'fixed', top: 0, left: 0, inset: 0 }}>
        <Grainient
          color1="#A3B18A"
          color2="#7da871"
          color3="#588157"
          timeSpeed={0.25}
          colorBalance={0}
          warpStrength={1}
          warpFrequency={5}
          warpSpeed={2}
          warpAmplitude={50}
          blendAngle={0}
          blendSoftness={0.05}
          rotationAmount={500}
          noiseScale={2}
          grainAmount={0.1}
          grainScale={2}
          grainAnimated={false}
          contrast={1.5}
          gamma={1}
          saturation={1}
          centerX={0}
          centerY={0}
          zoom={0.9}
        />
      </div>

      <Navbar
        onAddNote={() => handleOpenModal('to-do')}
        onSignOut={handleSignOut}
        isGuest={user?.is_anonymous || false}
        taskCount={tasks.length}
        doneCount={tasks.filter(t => t.colId === 'done').length}
        overdueCount={tasks.filter(t => {
          if (!t.due || t.colId === 'done') return false;
          const today = new Date().toISOString().split('T')[0];
          return t.due < today;
        }).length}
      />

      <div style={{ position: 'relative', zIndex: 1, paddingTop: '5rem', minHeight: '100vh' }}>
        <KanbanBoard 
          externalCards={tasks}
          onCardsChange={setTasks}
          onAddCard={handleOpenModal}
          onCardMove={handleCardMove}
          onEditTask={handleEditTask}
          onDeleteTask={handleDeleteTask}
        />
      </div>

      <AddNoteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmit={handleAddTask}
        defaultCol={defaultCol}
      />
    </>
  );
}

export default App;