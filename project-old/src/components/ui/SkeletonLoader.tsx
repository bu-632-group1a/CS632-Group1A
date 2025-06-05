import React from 'react';

interface SkeletonProps {
  className?: string;
  height?: string;
  width?: string;
  circle?: boolean;
  variant?: 'line' | 'rectangle' | 'circle';
}

const SkeletonLoader: React.FC<SkeletonProps> = ({
  className = '',
  height,
  width,
  circle = false,
  variant = 'rectangle',
}) => {
  const baseStyles = 'animate-pulse bg-gray-300 rounded';
  
  const variantStyles = {
    line: 'h-4 w-full rounded',
    rectangle: 'rounded',
    circle: 'rounded-full',
  };
  
  const styles = {
    height: height || (variant === 'line' ? '1rem' : '100%'),
    width: width || '100%',
  };
  
  return (
    <div 
      className={`
        ${baseStyles} 
        ${variantStyles[circle ? 'circle' : variant]}
        ${className}
      `}
      style={styles}
      aria-hidden="true"
    />
  );
};

export const CardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl shadow-soft p-4 overflow-hidden">
      <div className="space-y-3">
        <SkeletonLoader height="200px\" className="mb-4" />
        <SkeletonLoader variant="line\" className="w-3/4" />
        <SkeletonLoader variant="line\" className="w-1/2" />
        <div className="pt-2">
          <SkeletonLoader variant="line\" className="w-1/4" />
        </div>
      </div>
    </div>
  );
};

export const SessionSkeleton: React.FC = () => (
  <div className="space-y-6">
    {[1, 2, 3].map((i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);

export default SkeletonLoader;