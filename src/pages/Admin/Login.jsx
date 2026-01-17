import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useContent } from '../../contexts/ContentContext';
import './Login.css';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const { login, isAuthenticated } = useContent();
  const navigate = useNavigate();

  if (isAuthenticated) {
    navigate('/edit/home');
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (login(email, password)) {
      setShowSuccess(true);
      setTimeout(() => {
        navigate('/edit/home');
      }, 1500);
    } else {
      setError('Invalid email or password');
    }
  };

  return (
    <div className="login-page">
      <div className={`login-container ${showSuccess ? 'success' : ''}`}>
        {showSuccess ? (
          <div className="success-animation">
            <div className="success-checkmark">
              <div className="check-icon">
                <span className="icon-line line-tip"></span>
                <span className="icon-line line-long"></span>
              </div>
            </div>
            <p className="success-text">Login Successful</p>
          </div>
        ) : (
          <>
            <h1 className="login-title">Admin Login</h1>
            <form onSubmit={handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@artist.com"
                />
              </div>
              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
              </div>
              {error && <p className="error-message">{error}</p>}
              <button type="submit" className="login-button">
                Sign In
              </button>
            </form>
            <p className="login-hint">
              Default: admin@artist.com / admin123
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export default Login;
