import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Github, Twitter, Linkedin } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <div className="flex items-center">
              <Leaf className="h-8 w-8 text-primary-600" />
              <span className="ml-2 text-xl font-semibold text-gray-900">EcoPulse</span>
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Enhancing conference engagement with digital tools for sustainability tracking.
            </p>
            <div className="mt-4 flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">App</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <Link to="/" className="text-sm text-gray-500 hover:text-gray-900">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/sessions" className="text-sm text-gray-500 hover:text-gray-900">
                  Sessions
                </Link>
              </li>
              <li>
                <Link to="/sustainability" className="text-sm text-gray-500 hover:text-gray-900">
                  Sustainability
                </Link>
              </li>
              <li>
                <Link to="/leaderboard" className="text-sm text-gray-500 hover:text-gray-900">
                  Leaderboard
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">
              Resources
            </h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                  About
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                  FAQ
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-900 tracking-wider uppercase">Contact</h3>
            <ul className="mt-4 space-y-2">
              <li>
                <a href="mailto:info@ecopulse.io" className="text-sm text-gray-500 hover:text-gray-900">
                  info@ecopulse.io
                </a>
              </li>
              <li className="text-sm text-gray-500">Boston University</li>
              <li className="text-sm text-gray-500">Boston, MA 02215</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between">
          <p className="text-sm text-gray-500">
            &copy; {currentYear} EcoPulse. All rights reserved.
          </p>
          <p className="text-sm text-gray-500 mt-2 md:mt-0">
            Made with sustainability in mind.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;