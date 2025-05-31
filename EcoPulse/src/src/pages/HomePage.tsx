import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Calendar, QrCode, BarChart3, Award, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <Calendar className="h-8 w-8 text-primary-600" />,
      title: 'Custom Agenda',
      description: 'Build your personalized schedule by adding sessions that interest you most.',
    },
    {
      icon: <QrCode className="h-8 w-8 text-primary-600" />,
      title: 'QR Check-in',
      description: 'Easily check in to sessions by scanning QR codes at the door.',
    },
    {
      icon: <Leaf className="h-8 w-8 text-primary-600" />,
      title: 'Sustainability Tracking',
      description: 'Log eco-friendly actions and track your environmental impact.',
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-primary-600" />,
      title: 'Session Discussions',
      description: 'Engage with speakers and other attendees through session-specific discussions.',
    },
    {
      icon: <Award className="h-8 w-8 text-primary-600" />,
      title: 'Bingo Challenge',
      description: 'Complete sustainability and networking challenges to win prizes.',
    },
    {
      icon: <BarChart3 className="h-8 w-8 text-primary-600" />,
      title: 'Real-time Insights',
      description: 'Track event sustainability metrics and your contribution in real time.',
    },
  ];

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="bg-gray-50">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-r from-primary-700 to-secondary-700 overflow-hidden">
        <div className="absolute inset-0">
          <svg
            className="absolute left-0 inset-y-0 h-full w-48 text-white transform -translate-x-1/2"
            fill="currentColor"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polygon points="50,0 100,0 50,100 0,100" />
          </svg>
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <motion.h1
            className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            EcoPulse
          </motion.h1>
          <motion.p
            className="mt-6 text-xl text-indigo-100 max-w-3xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Boost conference engagement with custom schedules, live discussions, and sustainability tracking for real-time insights and impact.
          </motion.p>
          <motion.div
            className="mt-10 max-w-sm sm:flex sm:max-w-none"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
          >
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
              >
                Go to Dashboard
              </Link>
            ) : (
              <div className="flex flex-col sm:flex-row">
                <Link
                  to="/register"
                  className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-accent-600 hover:bg-accent-700 md:py-4 md:text-lg md:px-10"
                >
                  Sign Up
                </Link>
                <Link
                  to="/login"
                  className="mt-3 sm:mt-0 sm:ml-3 flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-primary-700 bg-white hover:bg-gray-50 md:py-4 md:text-lg md:px-10"
                >
                  Sign In
                </Link>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Features */}
      <div className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <motion.h2
              className="text-base text-primary-600 font-semibold tracking-wide uppercase"
              {...fadeIn}
            >
              Features
            </motion.h2>
            <motion.p
              className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              A better way to experience conferences
            </motion.p>
            <motion.p
              className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              EcoPulse enhances your conference experience while helping reduce environmental impact.
            </motion.p>
          </div>

          <div className="mt-16">
            <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              {features.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  className="relative bg-white p-6 rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                >
                  <dt>
                    <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-primary-100 text-white">
                      {feature.icon}
                    </div>
                    <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.title}</p>
                  </dt>
                  <dd className="mt-2 ml-16 text-base text-gray-500">{feature.description}</dd>
                </motion.div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* Sustainability Impact */}
      <div className="bg-gradient-to-r from-green-50 to-teal-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-base text-primary-600 font-semibold tracking-wide uppercase">Impact</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Making conferences more sustainable
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              EcoPulse helps reduce waste and track environmental impact in real time.
            </p>
          </motion.div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <motion.div
              className="bg-white rounded-lg shadow-sm p-6 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <p className="text-5xl font-bold text-primary-600">90%</p>
              <p className="mt-2 text-gray-500">Reduction in paper usage</p>
            </motion.div>
            <motion.div
              className="bg-white rounded-lg shadow-sm p-6 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <p className="text-5xl font-bold text-primary-600">60%</p>
              <p className="mt-2 text-gray-500">Less plastic waste</p>
            </motion.div>
            <motion.div
              className="bg-white rounded-lg shadow-sm p-6 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <p className="text-5xl font-bold text-primary-600">50%</p>
              <p className="mt-2 text-gray-500">Increase in attendee engagement</p>
            </motion.div>
            <motion.div
              className="bg-white rounded-lg shadow-sm p-6 text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <p className="text-5xl font-bold text-primary-600">100+</p>
              <p className="mt-2 text-gray-500">Pounds of food waste saved</p>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="bg-white">
        <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:py-24 lg:px-8">
          <motion.div
            className="bg-primary-700 rounded-lg shadow-xl overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <div className="pt-10 pb-12 px-6 sm:pt-16 sm:px-16 lg:py-16 lg:pr-0 xl:py-20 xl:px-20">
              <div className="lg:self-center">
                <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                  <span className="block">Ready to get started?</span>
                  <span className="block">Join EcoPulse today.</span>
                </h2>
                <p className="mt-4 text-lg leading-6 text-indigo-100">
                  Create your account to start building your custom agenda and tracking your sustainability impact.
                </p>
                <div className="mt-8 flex">
                  {isAuthenticated ? (
                    <Link
                      to="/dashboard"
                      className="bg-white border border-transparent rounded-md shadow px-6 py-3 text-base font-medium text-primary-700 hover:bg-gray-50"
                    >
                      Go to Dashboard
                    </Link>
                  ) : (
                    <>
                      <Link
                        to="/register"
                        className="bg-white border border-transparent rounded-md shadow px-6 py-3 text-base font-medium text-primary-700 hover:bg-gray-50"
                      >
                        Sign Up
                      </Link>
                      <Link
                        to="/login"
                        className="ml-3 bg-primary-100 border border-transparent rounded-md px-6 py-3 text-base font-medium text-primary-700 hover:bg-primary-200"
                      >
                        Learn more
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;