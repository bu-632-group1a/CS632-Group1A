import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-12rem)] flex items-center justify-center px-4 sm:px-6 lg:px-8">
      <div className="max-w-max mx-auto text-center">
        <div className="flex justify-center">
          <div className="text-6xl font-extrabold text-primary-600">404</div>
        </div>
        <h1 className="mt-4 text-3xl font-bold text-gray-900 tracking-tight sm:text-4xl">
          Page not found
        </h1>
        <p className="mt-4 text-lg text-gray-500">
          Sorry, we couldn't find the page you're looking for.
        </p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;