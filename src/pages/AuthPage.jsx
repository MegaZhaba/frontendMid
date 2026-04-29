import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiFetch from '../api';

export default function AuthPage() {
  const [mode, setMode] = useState('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  async function submit(e) {
    e.preventDefault();
    const data = await apiFetch(`/api/auth/${mode}`, {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });
    login(data.token, data.user);
  }

  return (
    <div>
      <h2>{mode}</h2>
      <form onSubmit={submit}>
        <input placeholder="username" onChange={e => setUsername(e.target.value)} />
        <input type="password" onChange={e => setPassword(e.target.value)} />
        <button>Submit</button>
      </form>
      <button onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
        switch
      </button>
    </div>
  );
}