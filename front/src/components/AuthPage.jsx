import { useState } from 'react';
import Grainient from './Grainient';
import './AuthPage.css';

export default function AuthPage({ onSignIn, onSignUp, onGuest, defaultMode = 'signin' }) {
  const [mode, setMode]      = useState(defaultMode);
  const [email, setEmail]      = useState('');
  const [password, setPassword]  = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading]   = useState(false);
  const [switching, setSwitching] = useState(false);

  const isSignUp = mode === 'signup';
  const switchMode = (next) => {
    setSwitching(true);
    setError('');
    setTimeout(() => {
      setMode(next);
      setEmail('');
      setPassword('');
      setSwitching(false);
    }, 150);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim()) { setError('Please enter your name.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }

    setLoading(true);
    try {
      if (isSignUp) {
        await onSignUp?.({ name: email.trim(), password });
      } else {
        await onSignIn?.({ name: email.trim(), password });
      }
    } catch (err) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      <div style={{ position:'fixed', inset:0, zIndex:0 }}>
        <Grainient
          color1 = "#A3B18A"
          color2 = "#7da871"
          color3 = "#588157"
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

      <div className={`auth-card ${switching ? 'switching' : ''}`} style={{ position:'relative', zIndex:1 }}>
        <p className="auth-eyebrow">my task board</p>
        <h1 className="auth-title">{isSignUp ? 'get started.' : 'welcome back.'}</h1>
        <p className="auth-subtitle">
          {isSignUp ? 'create an account to manage your tasks.' : 'sign in to pick up where you left off.'}
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {error && <div className="auth-error" role="alert">{error}</div>}

          <div className="auth-fields">
            <div className="auth-field">
              <label className="auth-label" htmlFor="auth-name">{isSignUp ? 'your email' : 'email'}</label>
              <input
                id="auth-name" className="auth-input" type="text"
                placeholder="johndoe@gmail.com"
                autoComplete={isSignUp ? 'email' : 'useremail'}
                value={email} onChange={e => setEmail(e.target.value)}
                disabled={loading} autoFocus
              />
            </div>

            <div className="auth-field">
              <label className="auth-label" htmlFor="auth-password">password</label>
              <input
                id="auth-password" className="auth-input" type="password"
                placeholder="••••••••"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                value={password} onChange={e => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading && <span className="auth-spinner" aria-hidden="true" />}
            {loading
              ? (isSignUp ? 'creating account…' : 'signing in…')
              : (isSignUp ? 'create account →'  : 'sign in →')}
          </button>
        </form>

        <div className="auth-divider">
          <span className="auth-divider-line" />
          <span className="auth-divider-text">or</span>
          <span className="auth-divider-line" />
        </div>

        {onGuest && (
          <button
            type="button"
            className="auth-guest"
            onClick={onGuest}
            disabled={loading}
          >
            continue as guest
          </button>
        )}

        <p className="auth-toggle">
          {isSignUp ? 'already have an account? ' : "don't have an account? "}
          <button type="button" className="auth-toggle-btn" onClick={() => switchMode(isSignUp ? 'signin' : 'signup')} disabled={loading}>
            {isSignUp ? 'sign in' : 'sign up'}
          </button>
        </p>


      </div>

      
    </div>
  );
}