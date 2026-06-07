'use client';

import { useState } from 'react';
import { API_BASE_URL } from '@/lib/endpoints';

export default function AuthForm({ mode }) {
  const isSignup = mode === 'signup';
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');

  async function submit(event) {
    event.preventDefault();
    setStatus('loading');
    setMessage('');

    const form = new FormData(event.currentTarget);
    const payload = {
      email: form.get('email'),
      password: form.get('password')
    };

    if (isSignup) {
      payload.name = form.get('name');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/${isSignup ? 'register' : 'login'}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Authentication failed');
      }

      if (data.accessToken) {
        window.localStorage.setItem('dira-access-token', data.accessToken);
      }

      setStatus('success');
      setMessage(isSignup ? 'Account created. Your personalized feed is ready to grow.' : 'Welcome back. Your token is saved for this browser.');
    } catch (error) {
      setStatus('error');
      setMessage(error.message);
    }
  }

  return (
    <form className="auth-form" onSubmit={submit}>
      {isSignup ? (
        <label>
          Full name
          <input name="name" type="text" autoComplete="name" required />
        </label>
      ) : null}
      <label>
        Email
        <input name="email" type="email" autoComplete="email" required />
      </label>
      <label>
        Password
        <input name="password" type="password" autoComplete={isSignup ? 'new-password' : 'current-password'} required minLength={8} />
      </label>
      <button className="primary-button" type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Working...' : isSignup ? 'Create account' : 'Login'}
      </button>
      {message ? <p className={`form-message ${status}`}>{message}</p> : null}
    </form>
  );
}
