import React, { useEffect, useState } from 'react'
import Taskform from './Components/Taskform'
import TaskList from './Components/TaskList'
import ProgressTracker from './Components/ProgressTracker'
import { supabase } from "./lib/supabase";

/** Normalize Supabase/date values to `YYYY-MM-DD` for date inputs and comparisons. */
function normalizeDateString(value) {
  if (value == null || value === '') return '';
  const str = String(value);
  const isoDate = str.match(/^(\d{4}-\d{2}-\d{2})/);
  if (isoDate) return isoDate[1];
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** Form/UI shape (camelCase) → Supabase `tasks` row (snake_case). */
function mapTaskToDb(task) {
  return {
    title: task.text,
    email: task.userEmail || null,
    start_date: task.startDate || null,
    end_date: task.endDate || null,
    completed: task.completed ?? false,
    start_email_sent: task.startEmailSent ?? false,
    reminder_email_sent: task.endEmailSent ?? false,
  };
}

function deriveReminderEnabled(startDate, endDate) {
  if (!startDate || !endDate) return true;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays >= 2;
}

/** Supabase row → shape expected by TaskList / Taskform. */
function mapTaskFromDb(row) {
  const startDate = normalizeDateString(row.start_date);
  const endDate = normalizeDateString(row.end_date);
  const reminderEmailSent = row.reminder_email_sent ?? false;

  return {
    id: row.id,
    text: row.title ?? '',
    userEmail: row.email ?? '',
    startDate,
    endDate,
    completed: row.completed ?? false,
    startEmailSent: row.start_email_sent ?? false,
    endEmailSent: reminderEmailSent,
    emailSent: reminderEmailSent,
    priority: row.priority ?? 'medium',
    category: row.category ?? 'general',
    reminderEnabled: deriveReminderEnabled(startDate, endDate),
  };
}

async function loadTasksFromSupabase() {
  if (!supabase) {
    throw new Error('Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }

  const { data, error } = await supabase.from('tasks').select('*');

  if (error) throw error;

  return (Array.isArray(data) ? data : []).map(mapTaskFromDb);
}

export default function App() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    if (!supabase) return;

    let cancelled = false;

    (async () => {
      try {
        const loaded = await loadTasksFromSupabase();
        if (!cancelled) setTasks(loaded);
      } catch (err) {
        if (!cancelled) {
          console.error('Could not load tasks from Supabase:', err.message);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);


  const addTask = async (task) => {
    if (!supabase) {
      console.error('Could not add task: Supabase is not configured.');
      return;
    }

    try {
      const { error } = await supabase.from('tasks').insert([mapTaskToDb(task)]);

      if (error) throw error;

      const refreshed = await loadTasksFromSupabase();
      setTasks(refreshed);
    } catch (err) {
      console.error('Could not add task:', err.message);
    }
  }


  const updateTask = async (updatedTask, index) => {
    const previous = tasks[index];
    const newtask = [...tasks];
    newtask[index] = updatedTask;
    setTasks(newtask);

    if (!supabase || updatedTask.id == null) return;
    if (previous?.completed === updatedTask.completed) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: Boolean(updatedTask.completed) })
        .eq('id', updatedTask.id);

      if (error) throw error;
    } catch (err) {
      console.error('Could not update task completion in Supabase:', err.message);
      const reverted = [...tasks];
      reverted[index] = previous;
      setTasks(reverted);
    }
  }


  const deleteTask = (index) => {
    setTasks(tasks.filter((_, i) => i != index));
  }


  const clearTasks = () => {
    setTasks([]);
  }


  return (
    <div>
      <h1>WORKTRACK</h1>
      <p><i><center>Manage Tasks with Ease</center></i></p>
      <Taskform addTask={addTask} />
      <TaskList tasks={tasks}
        updateTask={updateTask}
        deleteTask={deleteTask} />
      <ProgressTracker tasks={tasks} />


      {tasks.length > 0 &&
        (<button onClick={clearTasks} className='clear-btn'> Clear All Tasks</button>)}

    </div>
  )
}
