import React from 'react';
import { motion } from 'framer-motion';
import { Leaf } from 'lucide-react';

interface ImpactAnimationProps {
  score: number;
  maxScore: number;
}

const ImpactAnimation: React.FC<ImpactAnimationProps> = ({ score, maxScore }) => {
  const percentage = Math.min((score / maxScore) * 100, 100);
  
  const treeVariants = {
    hidden: { scale: 0.8, opacity: 0 },
    visible: {
      scale: 1,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  const leafVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: (custom: number) => ({
      scale: 1,
      opacity: 1,
      transition: {
        delay: custom * 0.1,
        duration: 0.3,
        ease: "easeOut"
      }
    })
  };

  return (
    <div className="relative h-64">
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        initial="hidden"
        animate="visible"
        variants={treeVariants}
      >
        <div className="relative">
          {/* Tree trunk */}
          <motion.div
            className="w-4 h-32 bg-primary-800 rounded-full mx-auto"
            initial={{ height: 0 }}
            animate={{ height: 128 }}
            transition={{ duration: 1 }}
          />
          
          {/* Leaves */}
          <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2">
            {[...Array(Math.ceil(percentage / 10))].map((_, i) => (
              <motion.div
                key={i}
                className="absolute"
                custom={i}
                variants={leafVariants}
                style={{
                  transform: `rotate(${i * 45}deg) translateY(-${i * 10}px)`,
                }}
              >
                <Leaf
                  size={24}
                  className="text-primary-500"
                  style={{
                    transform: `rotate(-${i * 45}deg)`,
                  }}
                />
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>
      
      <motion.div
        className="absolute bottom-4 left-0 right-0 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <span className="text-2xl font-bold text-primary-700">{score}</span>
        <span className="text-gray-600"> impact points</span>
      </motion.div>
    </div>
  );
};

export default ImpactAnimation;