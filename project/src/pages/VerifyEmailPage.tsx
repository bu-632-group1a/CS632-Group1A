import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Mail, CheckCircle, AlertCircle, Home, RefreshCw } from 'lucide-react';
import { useMutation } from '@apollo/client';
import Card, { CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { VERIFY_EMAIL } from '../graphql/mutations';

const VerifyEmailPage: React.FC = () => {
  const [verificationStatus, setVerificationStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [verifyEmail, { loading }] = useMutation(VERIFY_EMAIL, {
    onCompleted: (data) => {
      if (data.verifyEmail) {
        setVerificationStatus('success');
        setError('');
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', { replace: true });
        }, 3000);
      } else {
        setVerificationStatus('error');
        setError('Email verification failed. The link may be invalid or expired.');
      }
    },
    onError: (error) => {
      console.error('Email verification error:', error);
      setVerificationStatus('error');
      if (error.graphQLErrors?.[0]?.message) {
        setError(error.graphQLErrors[0].message);
      } else {
        setError('Email verification failed. Please try again or contact support.');
      }
    }
  });

  // Verify email on component mount
  useEffect(() => {
    if (!token) {
      setVerificationStatus('error');
      setError('Invalid verification token. Please check your email link.');
      return;
    }

    const performVerification = async () => {
      try {
        await verifyEmail({
          variables: { token }
        });
      } catch (err) {
        // Error handled by onError callback
      }
    };

    performVerification();
  }, [token, verifyEmail]);

  const handleRetryVerification = async () => {
    if (!token) return;
    
    setVerificationStatus('loading');
    setError('');
    
    try {
      await verifyEmail({
        variables: { token }
      });
    } catch (err) {
      // Error handled by onError callback
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Verification</h1>
            <p className="text-gray-600">
              {verificationStatus === 'loading' ? 'Verifying your email address...' :
               verificationStatus === 'success' ? 'Email verified successfully!' :
               'Email verification failed'}
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

        <Card>
          <CardContent className="p-6 text-center">
            {verificationStatus === 'loading' && (
              <div>
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Verifying Email</h2>
                <p className="text-gray-600 mb-6">
                  Please wait while we verify your email address...
                </p>
              </div>
            )}

            {verificationStatus === 'success' && (
              <div>
                <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle size={32} className="text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Email Verified!</h2>
                <p className="text-gray-600 mb-6">
                  Your email address has been successfully verified. You can now access all features of your account.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                  <p className="text-blue-800 text-sm">
                    You will be automatically redirected to the sign-in page in a few seconds.
                  </p>
                </div>
                <Link to="/login">
                  <Button variant="primary" fullWidth size="lg">
                    Continue to Sign In
                  </Button>
                </Link>
              </div>
            )}

            {verificationStatus === 'error' && (
              <div>
                <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={32} className="text-red-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Verification Failed</h2>
                <p className="text-gray-600 mb-4">
                  We couldn't verify your email address.
                </p>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                    <p className="text-red-800 text-sm">{error}</p>
                  </div>
                )}

                <div className="space-y-3">
                  {token && (
                    <Button
                      onClick={handleRetryVerification}
                      isLoading={loading}
                      icon={<RefreshCw size={20} />}
                      fullWidth
                    >
                      Try Again
                    </Button>
                  )}
                  
                  <Link to="/login">
                    <Button
                      variant="outline"
                      fullWidth
                      size="lg"
                    >
                      Back to Sign In
                    </Button>
                  </Link>
                </div>

                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600 mb-2">
                    Need help?
                  </p>
                  <p className="text-xs text-gray-500">
                    If you continue to have issues, please contact support or try requesting a new verification email.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;