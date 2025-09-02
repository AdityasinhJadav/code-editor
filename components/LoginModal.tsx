import React, { useState } from 'react';
import { useUiStore } from '../hooks/useUiStore';
import { CloseIcon } from './icons';

const LoginModal: React.FC = () => {
  const { isLoginModalOpen, closeLoginModal, login } = useUiStore();
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  if (!isLoginModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login/register
    const userToLogin = isRegistering ? username : (username || 'Guest');
    if(userToLogin) {
      login(userToLogin);
    }
  };

  return (
    <div 
        className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 transition-opacity duration-300"
        onClick={closeLoginModal}
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-modal-title"
    >
      <div 
        className="bg-[#252526] text-white rounded-lg shadow-xl w-full max-w-md p-8 relative"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={closeLoginModal} 
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
          aria-label="Close modal"
        >
          <CloseIcon className="w-6 h-6" />
        </button>

        <h2 id="auth-modal-title" className="text-2xl font-bold text-center mb-6">{isRegistering ? 'Create Account' : 'Welcome Back'}</h2>
        
        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <div className="mb-4">
              <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="username">
                Username
              </label>
              <input 
                className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-700 border-gray-600 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500" 
                id="username" 
                type="text" 
                placeholder="Username" 
                value={username}
                onChange={e => setUsername(e.target.value)}
                required 
              />
            </div>
          )}
          <div className="mb-4">
            <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="email">
              Email
            </label>
            <input 
              className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-700 border-gray-600 text-white leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500" 
              id="email" 
              type="email" 
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-400 text-sm font-bold mb-2" htmlFor="password">
              Password
            </label>
            <input 
              className="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-700 border-gray-600 text-white mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500" 
              id="password" 
              type="password" 
              placeholder="******************" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center justify-between">
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full" type="submit">
              {isRegistering ? 'Sign Up' : 'Sign In'}
            </button>
          </div>
        </form>
        <p className="text-center text-gray-500 text-sm mt-6">
          {isRegistering ? 'Already have an account?' : "Don't have an account?"}
          <button onClick={() => setIsRegistering(!isRegistering)} className="inline-block align-baseline font-bold text-blue-500 hover:text-blue-700 ml-2">
            {isRegistering ? 'Sign In' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginModal;
