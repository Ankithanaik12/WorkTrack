import React, { useEffect, useRef } from "react";
import emailjs from '@emailjs/browser';

export default function TaskList({ tasks, updateTask, deleteTask }) {
  const processingEmails = useRef(new Set());

  const toggleComplete = (index) => {
    const updatedTask = { ...tasks[index], completed: !tasks[index].completed };
    updateTask(updatedTask, index);
  }

  const isStartActive = (task) => {
    if (!task.startDate || task.completed || task.startEmailSent) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(task.startDate);
    start.setHours(0, 0, 0, 0);
    return today.getTime() >= start.getTime();
  };

  const isReminderActive = (task) => {
    if (task.completed || task.reminderEnabled === false || !task.endDate) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(task.endDate);
    end.setHours(0, 0, 0, 0);

    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    return diffDays <= 2 && diffDays >= 0;
  };

  useEffect(() => {
    tasks.forEach((task, index) => {
      const startActive = isStartActive(task);
      const reminderActive = isReminderActive(task);

      console.log(`[Diagnostic] Task '${task.text}': startActive=${startActive}, userEmail='${task.userEmail}', startEmailSent=${task.startEmailSent}`);

      // We process only one email type at a time per render cycle to avoid rewriting task state simultaneously
      if (startActive && task.userEmail && !processingEmails.current.has(`${index}-start`)) {
        processingEmails.current.add(`${index}-start`);
        emailjs.send(
          "service_w6644z9",
          "template_qx80dsr",
          {
            task_name: task.text,
            due_date: task.startDate,
            priority: task.priority,
            to_email: task.userEmail,
            email_type: "Task Started Notification"
          },
          "BGhsWS9vYr7fRY3EO"
        ).then((result) => {
          console.log("Start Email successfully sent!", result.text);
          const updatedTask = { ...task, startEmailSent: true };
          updateTask(updatedTask, index);
        }, (error) => {
          processingEmails.current.delete(`${index}-start`);
          console.log("Failed to send start email.", error.text);
        });

      } else if (reminderActive && !task.completed && task.userEmail && !task.endEmailSent && !task.emailSent && !processingEmails.current.has(`${index}-end`)) {
        processingEmails.current.add(`${index}-end`);
        emailjs.send(
          "service_w6644z9",
          "template_qx80dsr",
          {
            task_name: task.text,
            due_date: task.endDate,
            priority: task.priority,
            to_email: task.userEmail,
            email_type: "Deadline Reminder Notification"
          },
          "BGhsWS9vYr7fRY3EO"
        ).then((result) => {
          console.log("Reminder Email successfully sent!", result.text);
          const updatedTask = { ...task, endEmailSent: true, emailSent: true };
          updateTask(updatedTask, index);
        }, (error) => {
          processingEmails.current.delete(`${index}-end`);
          console.log("Failed to send reminder email.", error.text);
        });
      }
    });
  }, [tasks, updateTask]);

  return (
    <ul className='task-list'>
      {tasks.map((task, index) => {
        const reminderActive = isReminderActive(task);
        let liClassName = "";
        if (task.completed) liClassName = "completed";
        if (reminderActive) liClassName = liClassName ? `${liClassName} reminder-active` : "reminder-active";

        return (
          <li key={index} className={liClassName}>
            <div>
              <span>{task.text}</span>
              {task.startEmailSent && <span style={{ marginLeft: '10px' }}>🚀 Start Msg Sent</span>}
              {reminderActive && !task.endEmailSent && !task.emailSent && <span style={{ marginLeft: '10px', fontWeight: 'bold' }}>⚠️ 2 DAYS LEFT!</span>}
              {(task.endEmailSent || task.emailSent) && <span style={{ marginLeft: '10px' }}>📧 Reminder Email Sent</span>}
              <small>({task.priority} , {task.category})</small>
            </div>


            <div>
              <button onClick={() => toggleComplete(index)}>
                {task.completed ? "Undo" : "Complete"}</button>
              <button onClick={() => deleteTask(index)}>Delete</button>
            </div>


          </li>
        )
      })}
    </ul>
  )
}