import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, LogIn, Home, UserPlus } from 'lucide-react';
import Card, { CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError('Invalid email or password. Please try again.');
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Management in Practice 2025</h1>
            <p className="text-gray-600">Sign in to continue your conference journey</p>
          </div>
          <Link to="/">
            <Button
              variant="ghost"
              icon={<Home size={20} />}
              className="text-gray-600 hover:text-gray-900"
            >
              Home
            </Button>
          </Link>
        </div>
        
        <Card>
          <CardContent className="p-6">
            {error && (
              <motion.div 
                className="bg-red-50 text-red-700 p-3 rounded-lg mb-4"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                {error}
              </motion.div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email"
                type="email"
                id="email"
                fullWidth
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                icon={<Mail size={18} />}
              />
              
              <Input
                label="Password"
                type="password"
                id="password"
                fullWidth
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                icon={<Lock size={18} />}
              />
              
              <div className="space-y-3">
                <Button
                  type="submit"
                  fullWidth
                  size="lg"
                  isLoading={loading}
                  icon={<LogIn size={20} />}
                >
                  Sign In
                </Button>

                <Link to="/signup" className="block">
                  <Button
                    type="button"
                    fullWidth
                    size="lg"
                    variant="outline"
                    icon={<UserPlus size={20} />}
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            </form>
            
            <div className="mt-6 text-center text-sm text-gray-600">
              <p>
                <a href="#" className="text-primary-600 hover:text-primary-800">
                  Forgot your password?
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;