import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, CheckCircle, AlertCircle, Home, Eye, EyeOff } from 'lucide-react';
import { useMutation } from '@apollo/client';
import Card, { CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { RESET_PASSWORD } from '../graphql/mutations';

const ResetPasswordPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [resetPassword, { loading }] = useMutation(RESET_PASSWORD, {
    onCompleted: (data) => {
      if (data.resetPassword.success) {
        setSuccess(true);
        setError('');
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      } else {
        setError(data.resetPassword.message || 'Failed to reset password');
      }
    },
    onError: (error) => {
      console.error('Password reset error:', error);
      if (error.graphQLErrors?.[0]?.message) {
        setError(error.graphQLErrors[0].message);
      } else {
        setError('Failed to reset password. Please try again or request a new reset link.');
      }
    }
  });

  // Redirect if no token
  useEffect(() => {
    if (!token) {
      navigate('/login', { replace: true });
    }
  }, [token, navigate]);

  const validatePassword = (password: string) => {
    return password.length >= 6;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password.trim()) {
      setError('Please enter a new password');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be at least 6 characters long');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (!token) {
      setError('Invalid reset token. Please request a new password reset.');
      return;
    }

    try {
      await resetPassword({
        variables: {
          input: {
            token,
            newPassword: password
          }
        }
      });
    } catch (err) {
      // Error handled by onError callback
    }
  };

  if (!token) {
    return null; // Will redirect in useEffect
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Password Reset Successful</h1>
              <p className="text-gray-600">Your password has been updated successfully</p>
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
            <CardContent className="p-6 text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">All Set!</h2>
              <p className="text-gray-600 mb-6">
                Your password has been successfully reset. You can now sign in with your new password.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <p className="text-blue-800 text-sm">
                  You will be automatically redirected to the sign-in page in a few seconds.
                </p>
              </div>
              <Link to="/login">
                <Button variant="primary" fullWidth size="lg">
                  Sign In Now
                </Button>
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Reset Your Password</h1>
            <p className="text-gray-600">Enter your new password below</p>
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
            <div className="text-center mb-6">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock size={24} className="text-primary-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Create New Password</h2>
              <p className="text-gray-600">
                Choose a strong password that you haven't used before
              </p>
            </div>

            {error && (
              <motion.div
                className="bg-red-50 text-red-700 p-3 rounded-lg mb-4 flex items-start"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.3 }}
              >
                <AlertCircle size={20} className="mr-2 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Password Reset Failed</p>
                  <p className="text-sm mt-1">{error}</p>
                </div>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Input
                  label="New Password"
                  type={showPassword ? "text" : "password"}
                  id="password"
                  fullWidth
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  icon={<Lock size={18} />}
                  autoFocus
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="Confirm New Password"
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirmPassword"
                  fullWidth
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  icon={<Lock size={18} />}
                />
                <button
                  type="button"
                  className="absolute right-3 top-9 text-gray-500 hover:text-gray-700"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Password Requirements:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li className={`flex items-center ${password.length >= 6 ? 'text-green-600' : ''}`}>
                    <span className="mr-2">{password.length >= 6 ? '✓' : '○'}</span>
                    At least 6 characters long
                  </li>
                  <li className={`flex items-center ${password === confirmPassword && confirmPassword ? 'text-green-600' : ''}`}>
                    <span className="mr-2">{password === confirmPassword && confirmPassword ? '✓' : '○'}</span>
                    Passwords match
                  </li>
                </ul>
              </div>

              <Button
                type="submit"
                fullWidth
                size="lg"
                isLoading={loading}
                icon={<Lock size={20} />}
                disabled={!password.trim() || !confirmPassword.trim() || password !== confirmPassword || !validatePassword(password)}
              >
                Reset Password
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-gray-200 text-center">
              <p className="text-sm text-gray-600 mb-4">
                Remember your password?
              </p>
              <Link to="/login">
                <Button
                  type="button"
                  fullWidth
                  size="lg"
                  variant="outline"
                >
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default ResetPasswordPage;