import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Home, Building } from 'lucide-react';
import Card, { CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';

const RegistrationPage: React.FC = () => {
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
            <form className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                id="name"
                fullWidth
                placeholder="John Doe"
                icon={<User size={18} />}
              />
              
              <Input
                label="Email"
                type="email"
                id="email"
                fullWidth
                placeholder="you@example.com"
                icon={<Mail size={18} />}
              />
              
              <Input
                label="Organization"
                type="text"
                id="organization"
                fullWidth
                placeholder="Company or Institution"
                icon={<Building size={18} />}
              />
              
              <Input
                label="Password"
                type="password"
                id="password"
                fullWidth
                placeholder="••••••••"
                icon={<Lock size={18} />}
              />
              
              <Input
                label="Confirm Password"
                type="password"
                id="confirmPassword"
                fullWidth
                placeholder="••••••••"
                icon={<Lock size={18} />}
              />
              
              <Button
                type="submit"
                fullWidth
                size="lg"
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