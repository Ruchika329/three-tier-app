import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../index.css';

const API = (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/api$/, '');

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [form, setForm] = useState({ title: '', description: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const token = localStorage.getItem('token');

  const headers = { Authorization: `Bearer ${token}` };

  const fetchTasks = async () => {
    try {
      const res = await axios.get(`${API}/api/tasks`, { headers });
      setTasks(res.data);
    } catch {
      setError('Do not load your tasks. Plz try again');
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  const handleAdd = async e => {
    e.preventDefault();
    if (!form.title.trim()) return;
    setLoading(true);
    try {
      await axios.post(`${API}/api/tasks`, form, { headers });
      setForm({ title: '', description: '' });
      fetchTasks();
    } catch {
      setError('Do not load your task.');
    }
    finally { setLoading(false); }
  };

  const handleStatus = async (id, status) => {
    await axios.put(`${API}/api/tasks/${id}`, { status }, { headers });
    fetchTasks();
  };

  const handleDelete = async (id) => {
    await axios.delete(`${API}/api/tasks/${id}`, { headers });
    fetchTasks();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const pending = tasks.filter(t => t.status === 'pending').length;
  const inProgress = tasks.filter(t => t.status === 'in-progress').length;
  const completed = tasks.filter(t => t.status === 'completed').length;

  const badgeClass = s => s === 'pending' ? 'badge-pending' : s === 'in-progress' ? 'badge-progress' : 'badge-done';
  const cardClass = s => s === 'completed' ? 'task-card completed' : s === 'in-progress' ? 'task-card in-progress' : 'task-card';

  return (
    <>
      <div className="navbar">
        <h1>📋 Task Manager</h1>
        <div className="user-info">
          <span>👤 {user.name}</span>
          <button className="btn btn-danger btn-sm" onClick={handleLogout}>Logout</button>
        </div>
      </div>

      <div className="dashboard-container">
        <div className="stats-bar">
          <div className="stat-card"><div className="number">{tasks.length}</div><div className="label">Total Tasks</div></div>
          <div className="stat-card"><div className="number" style={{ color: '#ed8936' }}>{pending}</div><div className="label">Pending</div></div>
          <div className="stat-card"><div className="number" style={{ color: '#667eea' }}>{inProgress}</div><div className="label">In Progress</div></div>
          <div className="stat-card"><div className="number" style={{ color: '#38a169' }}>{completed}</div><div className="label">Completed</div></div>
        </div>

        <div className="task-form">
          <h3>➕ Add New Task</h3>
          {error && <div className="error-msg">{error}</div>}
          <form onSubmit={handleAdd}>
            <input type="text" placeholder="Task title *" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })} required />
            <textarea rows="2" placeholder="Description (optional)"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} />
            <button className="btn btn-primary" type="submit" disabled={loading}
              style={{ width: 'auto', padding: '0.6rem 1.5rem' }}>
              {loading ? 'Adding...' : 'Add Task'}
            </button>
          </form>
        </div>

        {tasks.length === 0 ? (
          <div className="empty-state">
            <p style={{ fontSize: '3rem' }}>📭</p>
            <p>Add Your Tasks.</p>
          </div>
        ) : (
          <div className="tasks-grid">
            {tasks.map(task => (
              <div key={task.id} className={cardClass(task.status)}>
                <span className={`badge ${badgeClass(task.status)}`}>
                  {task.status === 'pending' ? '⏳ Pending' : task.status === 'in-progress' ? '🔄 In Progress' : '✅ Done'}
                </span>
                <h4>{task.title}</h4>
                {task.description && <p>{task.description}</p>}
                <div className="task-actions">
                  {task.status !== 'in-progress' && (
                    <button className="btn btn-sm" style={{ background: '#667eea', color: 'white' }}
                      onClick={() => handleStatus(task.id, 'in-progress')}>In Progress</button>
                  )}
                  {task.status !== 'completed' && (
                    <button className="btn btn-success btn-sm"
                      onClick={() => handleStatus(task.id, 'completed')}>Done</button>
                  )}
                  <button className="btn btn-danger btn-sm"
                    onClick={() => handleDelete(task.id)}>Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
