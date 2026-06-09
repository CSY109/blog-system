import { useState, FormEvent } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Navigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isAuthenticated } = useAuth();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await login({ username, password });
  };

  if (isAuthenticated) {
    return <Navigate to="/admin" />;
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>Login</h2>
      <div>
        <label htmlFor="username">Username</label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit">Login</button>
    </form>
  );
};

export default Login;