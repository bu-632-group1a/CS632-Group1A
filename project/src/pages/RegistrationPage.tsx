import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Mail, Lock, User, Home, AtSign, MapPin, Building, ArrowRight, ArrowLeft } from 'lucide-react';
import Card, { CardContent } from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import Modal from '../components/ui/Modal'; // Make sure you have a Modal component

const RegistrationPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, loading, isAuthenticated } = useAuth();
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  const [isPageReady, setIsPageReady] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: '',
    city: '',
    state: '',
    company: ''
  });
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !showVerifyModal) {
      navigate('/', { replace: true });
      return;
    }
    
    // Add a small delay to ensure the page is fully loaded
    const timer = setTimeout(() => {
      setIsPageReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [isAuthenticated, showVerifyModal, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.id]: e.target.value
    }));
    // Clear errors when user starts typing
    if (error) setError('');
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateStep1 = () => {
    const { firstName, lastName, username, email } = formData;
    return firstName.trim() && 
           lastName.trim() && 
           username.trim() && 
           email.trim() && 
           validateEmail(email);
  };

  const validateStep2 = () => {
    const { password, confirmPassword } = formData;
    return password.length >= 6 && password === confirmPassword;
  };

  const handleNextStep = () => {
    setError('');
    
    if (currentStep === 1) {
      if (!validateStep1()) {
        if (!formData.firstName.trim() || !formData.lastName.trim()) {
          setError('Please enter your first and last name');
        } else if (!formData.username.trim()) {
          setError('Please enter a username');
        } else if (!formData.email.trim()) {
          setError('Please enter your email address');
        } else if (!validateEmail(formData.email)) {
          setError('Please enter a valid email address');
        }
        return;
      }
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!validateStep2()) {
        if (formData.password.length < 6) {
          setError('Password must be at least 6 characters long');
        } else if (formData.password !== formData.confirmPassword) {
          setError('Passwords do not match');
        }
        return;
      }
      setCurrentStep(3);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Final validation
    if (!validateStep1()) {
      setError('Please complete all required fields in step 1');
      setCurrentStep(1);
      return;
    }

    if (!validateStep2()) {
      setError('Please check your password requirements');
      setCurrentStep(2);
      return;
    }

    try {
      await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim().toLowerCase(),
        username: formData.username.trim().toLowerCase(),
        password: formData.password,
        city: formData.city.trim() || undefined,
        state: formData.state.trim() || undefined,
        company: formData.company.trim() || undefined
      });

      // Show verify email modal instead of redirecting immediately
      setShowVerifyModal(true);
    } catch (err: any) {
      console.error('Registration error:', err);
      
      // Extract specific error message
      let errorMessage = 'Registration failed. Please try again.';
      
      if (err.graphQLErrors?.[0]?.message) {
        errorMessage = err.graphQLErrors[0].message;
      } else if (err.networkError?.statusCode === 400) {
        errorMessage = 'Invalid registration data. Please check your information.';
      } else if (err.networkError?.statusCode === 409) {
        errorMessage = 'An account with this email or username already exists.';
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
      
      // If it's a duplicate email/username error, go back to step 1
      if (errorMessage.toLowerCase().includes('email') || errorMessage.toLowerCase().includes('username')) {
        setCurrentStep(1);
      }
    }
  };

  const stepVariants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 }
  };

  const progressPercentage = (currentStep / 3) * 100;

  // Show loading state while page is initializing
  if (!isPageReady) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
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

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-gray-700">Step {currentStep} of 3</span>
            <span className="text-sm text-gray-500">{Math.round(progressPercentage)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div 
              className="bg-primary-600 h-2 rounded-full" 
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span className={currentStep >= 1 ? 'text-primary-600 font-medium' : ''}>Basic Info</span>
            <span className={currentStep >= 2 ? 'text-primary-600 font-medium' : ''}>Security</span>
            <span className={currentStep >= 3 ? 'text-primary-600 font-medium' : ''}>Optional Details</span>
          </div>
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

            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <motion.div
                    key="step1"
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="text-center mb-6">
                      <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User size={24} className="text-primary-600" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2">Basic Information</h2>
                      <p className="text-gray-600">Let's start with your basic details</p>
                    </div>

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
                        autoFocus
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
                      label="Email Address"
                      type="email"
                      id="email"
                      fullWidth
                      placeholder="john.doe@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      icon={<Mail size={18} />}
                    />

                    <Button
                      type="button"
                      fullWidth
                      size="lg"
                      onClick={handleNextStep}
                      disabled={!validateStep1()}
                      icon={<ArrowRight size={20} />}
                      iconPosition="right"
                    >
                      Continue to Security
                    </Button>
                  </motion.div>
                )}

                {/* Step 2: Security */}
                {currentStep === 2 && (
                  <motion.div
                    key="step2"
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="text-center mb-6">
                      <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Lock size={24} className="text-primary-600" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2">Account Security</h2>
                      <p className="text-gray-600">Create a secure password for your account</p>
                    </div>
                    
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
                      autoFocus
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

                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Password Requirements:</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        <li className={`flex items-center ${formData.password.length >= 6 ? 'text-green-600' : ''}`}>
                          <span className="mr-2">{formData.password.length >= 6 ? '✓' : '○'}</span>
                          At least 6 characters long
                        </li>
                        <li className={`flex items-center ${formData.password === formData.confirmPassword && formData.confirmPassword ? 'text-green-600' : ''}`}>
                          <span className="mr-2">{formData.password === formData.confirmPassword && formData.confirmPassword ? '✓' : '○'}</span>
                          Passwords match
                        </li>
                      </ul>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={handlePrevStep}
                        icon={<ArrowLeft size={20} />}
                        className="flex-shrink-0"
                      >
                        Back
                      </Button>
                      <Button
                        type="button"
                        fullWidth
                        size="lg"
                        onClick={handleNextStep}
                        disabled={!validateStep2()}
                        icon={<ArrowRight size={20} />}
                        iconPosition="right"
                      >
                        Continue to Details
                      </Button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Optional Details */}
                {currentStep === 3 && (
                  <motion.div
                    key="step3"
                    variants={stepVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div className="text-center mb-6">
                      <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Building size={24} className="text-primary-600" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900 mb-2">Additional Details</h2>
                      <p className="text-gray-600">Help us personalize your experience (optional)</p>
                    </div>

                    <Input
                      label="Company / Organization"
                      type="text"
                      id="company"
                      fullWidth
                      placeholder="Acme Corporation"
                      value={formData.company}
                      onChange={handleChange}
                      icon={<Building size={18} />}
                      autoFocus
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="City"
                        type="text"
                        id="city"
                        fullWidth
                        placeholder="Boston"
                        value={formData.city}
                        onChange={handleChange}
                        icon={<MapPin size={18} />}
                      />
                      
                      <Input
                        label="State"
                        type="text"
                        id="state"
                        fullWidth
                        placeholder="MA"
                        value={formData.state}
                        onChange={handleChange}
                        icon={<MapPin size={18} />}
                      />
                    </div>

                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 mb-2">Why we ask for this information:</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Connect you with other attendees in your area</li>
                        <li>• Provide relevant networking opportunities</li>
                        <li>• Customize content based on your industry</li>
                      </ul>
                    </div>

                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={handlePrevStep}
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
                        icon={<UserPlus size={20} />}
                      >
                        Create Account
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
            
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-4">
                  Already have an account?
                </p>
                <Link to="/login" className="block">
                  <Button
                    type="button"
                    fullWidth
                    size="lg"
                    variant="outline"
                    icon={<Mail size={20} />}
                  >
                    Sign In Instead
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {showVerifyModal && (
        <Modal onClose={() => {
          setShowVerifyModal(false);
          navigate('/login', { replace: true });
        }}>
          <div className="p-6 text-center">
            <Mail size={48} className="mx-auto text-primary-600 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Verify Your Email</h2>
            <p className="mb-4 text-gray-700">
              Registration successful! Please check your email and click the verification link to activate your account before signing in.
            </p>
            <Button
              fullWidth
              size="lg"
              onClick={() => {
                setShowVerifyModal(false);
                navigate('/login', { replace: true });
              }}
            >
              Go to Sign In
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default RegistrationPage;