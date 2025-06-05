import React from 'react';
import { motion } from 'framer-motion';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  interactive = false,
}) => {
  const baseStyles = 'bg-white rounded-xl shadow-soft overflow-hidden';
  const interactiveStyles = interactive
    ? 'cursor-pointer transition-all hover:shadow-soft-lg hover:-translate-y-1'
    : '';

  if (interactive) {
    return (
      <motion.div
        className={`${baseStyles} ${interactiveStyles} ${className}`}
        onClick={onClick}
        whileHover={{ y: -5 }}
        whileTap={{ y: 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 17 }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={`${baseStyles} ${className}`}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ className?: string; children: React.ReactNode }> = ({ 
  className = '', 
  children 
}) => (
  <div className={`p-4 border-b border-gray-100 ${className}`}>
    {children}
  </div>
);

export const CardContent: React.FC<{ className?: string; children: React.ReactNode }> = ({ 
  className = '', 
  children 
}) => (
  <div className={`p-4 ${className}`}>
    {children}
  </div>
);

export const CardFooter: React.FC<{ className?: string; children: React.ReactNode }> = ({ 
  className = '', 
  children 
}) => (
  <div className={`p-4 border-t border-gray-100 ${className}`}>
    {children}
  </div>
);

export default Card;