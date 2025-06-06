import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Home, AtSign } from 'lucide-react';
import Card, { CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';

const RegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, loading } = useAuth();
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        username: formData.username,
        password: formData.password
      });
      navigate('/');
    } catch (err: any) {
      // Extract specific error message from GraphQL error if available
      const errorMessage = err.graphQLErrors?.[0]?.message || 
                         err.message || 
                         'Registration failed. Please try again.';
      setError(errorMessage);
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-600">Join the Project Management in Practice Conference</p>
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
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  type="text"
                  id="firstName"
                  fullWidth
                  placeholder="John"
                  value={formData.firstName}
                  onChange={handleChange}
                  required
                  icon={<User size={18} />}
                />
                
                <Input
                  label="Last Name"
                  type="text"
                  id="lastName"
                  fullWidth
                  placeholder="Doe"
                  value={formData.lastName}
                  onChange={handleChange}
                  required
                  icon={<User size={18} />}
                />
              </div>
              
              <Input
                label="Username"
                type="text"
                id="username"
                fullWidth
                placeholder="johndoe"
                value={formData.username}
                onChange={handleChange}
                required
                icon={<AtSign size={18} />}
              />
              
              <Input
                label="Email"
                type="email"
                id="email"
                fullWidth
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                icon={<Mail size={18} />}
              />
              
              <Input
                label="Password"
                type="password"
                id="password"
                fullWidth
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                icon={<Lock size={18} />}
              />
              
              <Input
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                fullWidth
                placeholder="••••••••"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                icon={<Lock size={18} />}
              />
              
              <Button
                type="submit"
                fullWidth
                size="lg"
                isLoading={loading}
                icon={<UserPlus size={20} />}
              >
                Create Account
              </Button>
            </form>
            
            <div className="mt-6 text-center text-sm text-gray-600">
              <p>
                Already have an account?{' '}
                <Link to="/login" className="text-primary-600 hover:text-primary-800 font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default RegistrationPage;