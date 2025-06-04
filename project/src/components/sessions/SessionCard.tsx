import React from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, User, Bookmark, BookmarkCheck } from 'lucide-react';
import Card, { CardContent, CardFooter } from '../ui/Card';
import Badge from '../ui/Badge';
import { Session } from '../../types';
import { useApp } from '../../context/AppContext';

interface SessionCardProps {
  session: Session;
}

const SessionCard: React.FC<SessionCardProps> = ({ session }) => {
  const { isSessionBookmarked, toggleSessionBookmark } = useApp();
  const bookmarked = isSessionBookmarked(session.id);

  const handleBookmarkToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleSessionBookmark(session.id);
  };

  const getCategoryColor = (category: string): string => {
    const categories: Record<string, string> = {
      'Energy': 'primary',
      'Urban': 'secondary',
      'Lifestyle': 'success',
      'Business': 'info',
      'Food': 'warning',
      'Technology': 'danger'
    };
    
    return categories[category] || 'default';
  };

  return (
    <Card interactive className="h-full">
      <div className="relative">
        <img 
          src={session.imageUrl || 'https://images.pexels.com/photos/957024/forest-trees-perspective-bright-957024.jpeg'} 
          alt={session.title} 
          className="w-full h-48 object-cover"
        />
        <motion.button
          className="absolute top-3 right-3 bg-white rounded-full p-2 shadow-md"
          onClick={handleBookmarkToggle}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          aria-label={bookmarked ? "Remove bookmark" : "Add bookmark"}
        >
          {bookmarked ? (
            <BookmarkCheck size={20} className="text-primary-600" />
          ) : (
            <Bookmark size={20} className="text-gray-500" />
          )}
        </motion.button>
        <div className="absolute bottom-0 left-0 w-full p-2 bg-gradient-to-t from-black/70 to-transparent">
          <Badge 
            variant={getCategoryColor(session.category) as any} 
            size="md"
            animated
          >
            {session.category}
          </Badge>
        </div>
      </div>
      
      <CardContent>
        <h3 className="text-lg font-bold text-gray-900 mb-2">{session.title}</h3>
        <p className="text-gray-600 text-sm line-clamp-3 mb-4">
          {session.description}
        </p>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <User size={16} className="mr-2 text-primary-600" />
            <span>{session.speaker}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <Clock size={16} className="mr-2 text-primary-600" />
            <span>{session.time}</span>
          </div>
          
          <div className="flex items-center text-sm text-gray-600">
            <MapPin size={16} className="mr-2 text-primary-600" />
            <span>{session.location}</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="bg-gray-50">
        <motion.button
          className="w-full py-2 text-center text-primary-600 font-medium hover:text-primary-800 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          View Details
        </motion.button>
      </CardFooter>
    </Card>
  );
};

export default SessionCard;