import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Mail, Lock, LogIn, Home, UserPlus, ArrowLeft, ArrowRight, KeyRound, CheckCircle } from 'lucide-react';
import { useMutation } from '@apollo/client';
import Card, { CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { FORGOT_PASSWORD } from '../graphql/mutations';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  
  const { login, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Get redirect URL from query params
  const redirectUrl = searchParams.get('redirect');

  const [forgotPassword, { loading: resetLoading }] = useMutation(FORGOT_PASSWORD, {
    onCompleted: (data) => {
      if (data.forgotPassword.success) {
        setResetSuccess(true);
        setError('');
      } else {
        setError(data.forgotPassword.message || 'Failed to send reset email');
      }
    },
    onError: (error) => {
      console.error('Password reset error:', error);
      setError('Failed to send reset email. Please try again.');
    }
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      if (redirectUrl) {
        // Redirect to the original URL they were trying to access
        navigate(redirectUrl, { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    }
  }, [isAuthenticated, navigate, redirectUrl]);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }
    
    setCurrentStep(2);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!password.trim()) {
      setError('Please enter your password');
      return;
    }
    
    try {
      await login(email, password);
      // Navigation will be handled by the useEffect above
    } catch (err: any) {
      // Check if it's a network error with status code 400
      if (err.networkError?.statusCode === 400 || err.message?.includes('400')) {
        setError('Invalid email or password. Please check your credentials.');
      } else if (err.networkError?.statusCode === 429) {
        setError('Too many login attempts. Please try again later.');
      } else if (!navigator.onLine) {
        setError('No internet connection. Please check your network and try again.');
      } else {
        setError('Unable to sign in. Please try again later.');
      }
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!resetEmail.trim()) {
      setError('Please enter your email address');
      return;
    }
    
    if (!validateEmail(resetEmail)) {
      setError('Please enter a valid email address');
      return;
    }

    try {
      await forgotPassword({
        variables: {
          input: {
            email: resetEmail.trim().toLowerCase()
          }
        }
      });
    } catch (err) {
      // Error handled by onError callback
    }
  };

  const handleBackToEmail = () => {
    setCurrentStep(1);
    setPassword('');
    setError('');
  };

  const handleBackToLogin = () => {
    setShowPasswordReset(false);
    setResetEmail('');
    setResetSuccess(false);
    setError('');
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {showPasswordReset ? 'Reset Password' : 'Welcome Back'}
            </h1>
            <p className="text-gray-600">
              {showPasswordReset 
                ? 'Enter your email to receive a password reset link'
                : redirectUrl 
                  ? 'Sign in to continue to your destination' 
                  : 'Sign in to continue your conference journey'
              }
            </p>
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

        {/* Show redirect notice if coming from QR code */}
        {redirectUrl && !showPasswordReset && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6"
          >
            <div className="flex items-center">
              <div className="bg-blue-100 p-2 rounded-full mr-3">
                <LogIn size={16} className="text-blue-600" />
              </div>
              <div>
                <p className="text-blue-800 text-sm">
                  You'll be redirected to your destination after signing in.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Progress Indicator - Only show for login flow */}
        {!showPasswordReset && (
          <div className="mb-6">
            <div className="flex items-center justify-center space-x-4">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${currentStep >= 1 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}
              `}>
                1
              </div>
              <div className={`
                h-1 w-12 rounded
                ${currentStep >= 2 ? 'bg-primary-600' : 'bg-gray-200'}
              `} />
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${currentStep >= 2 ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'}
              `}>
                2
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span className={currentStep >= 1 ? 'text-primary-600 font-medium' : ''}>Email</span>
              <span className={currentStep >= 2 ? 'text-primary-600 font-medium' : ''}>Password</span>
            </div>
          </div>
        )}
        
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

            <AnimatePresence mode="wait">
              {/* Password Reset Flow */}
              {showPasswordReset && (
                <motion.div
                  key="password-reset"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  {resetSuccess ? (
                    <div className="text-center">
                      <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CheckCircle size={24} className="text-green-600" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2">Check Your Email</h2>
                      <p className="text-gray-600 mb-6">
                        We've sent a password reset link to <strong>{resetEmail}</strong>. 
                        Please check your email and follow the instructions to reset your password.
                      </p>
                      <div className="space-y-3">
                        <Button
                          onClick={handleBackToLogin}
                          variant="primary"
                          fullWidth
                          icon={<ArrowLeft size={20} />}
                        >
                          Back to Sign In
                        </Button>
                        <p className="text-sm text-gray-500">
                          Didn't receive the email? Check your spam folder or try again.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="text-center mb-6">
                        <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                          <KeyRound size={24} className="text-primary-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Forgot Your Password?</h2>
                        <p className="text-gray-600">
                          No worries! Enter your email address and we'll send you a link to reset your password.
                        </p>
                      </div>

                      <form onSubmit={handlePasswordReset} className="space-y-4">
                        <Input
                          label="Email Address"
                          type="email"
                          id="reset-email"
                          fullWidth
                          placeholder="you@example.com"
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          required
                          icon={<Mail size={18} />}
                          autoFocus
                        />
                        
                        <div className="flex gap-3">
                          <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            onClick={handleBackToLogin}
                            icon={<ArrowLeft size={20} />}
                            className="flex-shrink-0"
                          >
                            Back
                          </Button>
                          <Button
                            type="submit"
                            fullWidth
                            size="lg"
                            isLoading={resetLoading}
                            icon={<Mail size={20} />}
                            disabled={!resetEmail.trim() || !validateEmail(resetEmail)}
                          >
                            Send Reset Link
                          </Button>
                        </div>
                      </form>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Step 1: Email - Only show if not in password reset mode */}
              {!showPasswordReset && currentStep === 1 && (
                <motion.div
                  key="email-step"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-center mb-6">
                    <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Mail size={24} className="text-primary-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Enter your email</h2>
                    <p className="text-gray-600">We'll use this to identify your account</p>
                  </div>

                  <form onSubmit={handleEmailSubmit} className="space-y-4">
                    <Input
                      label="Email Address"
                      type="email"
                      id="email"
                      fullWidth
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      icon={<Mail size={18} />}
                      autoFocus
                    />
                    
                    <Button
                      type="submit"
                      fullWidth
                      size="lg"
                      icon={<ArrowRight size={20} />}
                      iconPosition="right"
                      disabled={!email.trim() || !validateEmail(email)}
                    >
                      Continue
                    </Button>
                  </form>
                </motion.div>
              )}

              {/* Step 2: Password - Only show if not in password reset mode */}
              {!showPasswordReset && currentStep === 2 && (
                <motion.div
                  key="password-step"
                  variants={stepVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-center mb-6">
                    <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Lock size={24} className="text-primary-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Enter your password</h2>
                    <p className="text-gray-600 mb-2">Welcome back!</p>
                    <div className="bg-gray-50 px-3 py-2 rounded-lg inline-flex items-center">
                      <Mail size={16} className="text-gray-500 mr-2" />
                      <span className="text-sm text-gray-700">{email}</span>
                    </div>
                  </div>

                  <form onSubmit={handlePasswordSubmit} className="space-y-4">
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
                      autoFocus
                    />
                    
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={handleBackToEmail}
                        icon={<ArrowLeft size={20} />}
                        className="flex-shrink-0"
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        fullWidth
                        size="lg"
                        isLoading={loading}
                        icon={<LogIn size={20} />}
                        disabled={!password.trim()}
                      >
                        Sign In
                      </Button>
                    </div>
                  </form>

                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={handleBackToEmail}
                      className="text-sm text-primary-600 hover:text-primary-800 mr-4"
                    >
                      Not your email? Change it
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setResetEmail(email);
                        setShowPasswordReset(true);
                      }}
                      className="text-sm text-primary-600 hover:text-primary-800"
                    >
                      Forgot password?
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {!showPasswordReset && (
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-sm text-gray-600 mb-4">
                    Don't have an account yet?
                  </p>
                  <Link to={`/signup${redirectUrl ? `?redirect=${encodeURIComponent(redirectUrl)}` : ''}`} className="block">
                    <Button
                      type="button"
                      fullWidth
                      size="lg"
                      variant="outline"
                      icon={<UserPlus size={20} />}
                    >
                      Create Account
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;