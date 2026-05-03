import React, { useState } from 'react'

export default function Taskform({addTask}) {
    const[task, setTask] = useState('');
    const[priority, setPriority] = useState('medium');
    const[category, setCategory] = useState('general');
    const[startDate, setStartDate] = useState('');
    const[endDate, setEndDate] = useState('');
    const[userEmail, setUserEmail] = useState('');

    const handlesubmit = (e) => {
        e.preventDefault();  
        let reminderEnabled = true;

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            const diffTime = end.getTime() - start.getTime();
            const diffDays = diffTime / (1000 * 60 * 60 * 24);
            if (diffDays < 2) {
                reminderEnabled = false;
                alert("Reminder disabled because task duration is less than 2 days.");
            }
        }

        addTask({text: task, priority, category, completed: false, startDate, endDate, reminderEnabled, userEmail, startEmailSent: false, endEmailSent: false});
        setTask('');
        setPriority('medium');
        setCategory('general');
        setStartDate('');
        setEndDate('');
        setUserEmail('');
    }
  return (
    <div>
      
      <form onSubmit={handlesubmit}className='task-form'>
        <div id = 'inp'>
            <input type="text" placeholder='Enter the task' onChange={(e) => setTask(e.target.value)} value={task}/>
            <button type='submit'>Add Task</button>
            {/* <h1>{task} {priority} {category}</h1> */}
        </div>

        <div id='btn' style={{marginBottom: '20px'}}>
            <select value={priority} onChange={(e) => setPriority(e.target.value)}>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
            </select>

            <select value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="general">General</option>
                <option value="work">Work</option>
                <option value="personal">Personal</option>
            </select>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <input type="email" placeholder='Enter your email for reminders (optional)' onChange={(e) => setUserEmail(e.target.value)} value={userEmail} style={{ padding: '10px 20px', borderRadius: '10px', background: '#1e293b', color: 'white', border: '1px solid #334155', outline: 'none', width: '60%' }} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', color: 'white' }}>
                <label style={{marginBottom: '5px'}}>Start Date</label>
                <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} style={{ padding: '10px', borderRadius: '10px', background: '#1e293b', color: 'white', border: '1px solid #334155', outline: 'none' }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', color: 'white' }}>
                <label style={{marginBottom: '5px'}}>End Date</label>
                <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} style={{ padding: '10px', borderRadius: '10px', background: '#1e293b', color: 'white', border: '1px solid #334155', outline: 'none' }} />
            </div>
        </div>
      </form>
    </div>
  )
}
