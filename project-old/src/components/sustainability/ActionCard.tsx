import React from 'react';
import { motion } from 'framer-motion';
import { Check, Car, UtilityPole, Trash2, Apple, Leaf } from 'lucide-react';
import Card, { CardContent } from '../ui/Card';
import { SustainabilityAction } from '../../types';
import { useApp } from '../../context/AppContext';

interface ActionCardProps {
  action: SustainabilityAction;
}

const ActionCard: React.FC<ActionCardProps> = ({ action }) => {
  const { toggleSustainabilityAction } = useApp();

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'transport':
        return <Car size={18} />;
      case 'energy':
        return <UtilityPole size={18} />;
      case 'waste':
        return <Trash2 size={18} />;
      case 'food':
        return <Apple size={18} />;
      default:
        return <Leaf size={18} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card interactive className="overflow-visible">
        <CardContent className="p-0">
          <div 
            className={`
              p-4 flex items-start gap-3
              ${action.completed ? 'bg-primary-50' : 'bg-white'}
            `}
          >
            <motion.button
              className={`
                flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center
                ${action.completed 
                  ? 'bg-primary-500 text-white' 
                  : 'border-2 border-gray-300 hover:border-primary-500'}
              `}
              onClick={() => toggleSustainabilityAction(action.id)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              aria-label={action.completed ? "Mark as incomplete" : "Mark as complete"}
            >
              {action.completed && <Check size={14} />}
            </motion.button>
            
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-primary-600">
                  {getCategoryIcon(action.category)}
                </span>
                <h3 
                  className={`font-medium ${action.completed ? 'text-gray-600' : 'text-gray-900'}`}
                >
                  {action.title}
                </h3>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-primary-600">+{action.points} pts</span>
                  {action.date && (
                    <span className="text-xs text-gray-500 ml-2">Completed: {action.date}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ActionCard;