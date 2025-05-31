import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEvent } from '../contexts/EventContext';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, Clock, MapPin, Users, Plus, Check, MessageSquare, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SessionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    fetchSession,
    fetchSessionComments,
    addComment,
    addSessionToAgenda,
    removeSessionFromAgenda,
    isSessionInAgenda,
    isCheckedInToSession
  } = useEvent();

  const [session, setSession] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [isTogglingAgenda, setIsTogglingAgenda] = useState(false);

  useEffect(() => {
    const loadSessionData = async () => {
      if (!id) return;

      try {
        const sessionData = await fetchSession(id);
        setSession(sessionData);
        const sessionComments = await fetchSessionComments(id);
        setComments(sessionComments);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load session details');
      } finally {
        setIsLoading(false);
      }
    };

    loadSessionData();
  }, [id, fetchSession, fetchSessionComments]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isAddingComment) return;

    setIsAddingComment(true);
    try {
      await addComment(id!, newComment);
      const updatedComments = await fetchSessionComments(id!);
      setComments(updatedComments);
      setNewComment('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment');
    } finally {
      setIsAddingComment(false);
    }
  };

  const handleAgendaToggle = async () => {
    if (!session || isTogglingAgenda) return;

    setIsTogglingAgenda(true);
    try {
      if (isSessionInAgenda(session.id)) {
        await removeSessionFromAgenda(session.id);
      } else {
        await addSessionToAgenda(session.id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update agenda');
    } finally {
      setIsTogglingAgenda(false);
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    };
    return new Date(dateString).toLocaleString(undefined, options);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error || 'Session not found'}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to Sessions
        </button>

        <div className="bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{session.title}</h1>

            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex items-center text-gray-500">
                <Calendar className="h-5 w-5 mr-2" />
                <span>{formatDate(session.startTime)}</span>
              </div>
              <div className="flex items-center text-gray-500">
                <Clock className="h-5 w-5 mr-2" />
                <span>{formatDate(session.endTime).split(' at ')[1]}</span>
              </div>
              <div className="flex items-center text-gray-500">
                <MapPin className="h-5 w-5 mr-2" />
                <span>{session.location}</span>
              </div>
              <div className="flex items-center text-gray-500">
                <Users className="h-5 w-5 mr-2" />
                <span>{session.currentAttendees} / {session.maxAttendees} attending</span>
              </div>
            </div>

            <div className="prose max-w-none mb-6">
              <p className="text-gray-700">{session.description}</p>
            </div>

            <div className="flex items-center mb-6">
              <div className="flex-shrink-0">
                {session.speakerAvatarUrl ? (
                  <img
                    className="h-12 w-12 rounded-full"
                    src={session.speakerAvatarUrl}
                    alt={session.speakerName}
                  />
                ) : (
                  <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-700 font-medium">
                      {session.speakerName.charAt(0)}
                    </span>
                  </div>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900">{session.speakerName}</p>
                <p className="text-sm text-gray-500">{session.speakerTitle}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-6">
              {session.tags.map((tag: string) => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                >
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              {isAuthenticated ? (
                <>
                  <button
                    onClick={handleAgendaToggle}
                    disabled={isTogglingAgenda}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm ${
                      isSessionInAgenda(session.id)
                        ? 'text-green-700 bg-green-100 hover:bg-green-200'
                        : 'text-white bg-primary-600 hover:bg-primary-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
                  >
                    {isSessionInAgenda(session.id) ? (
                      <>
                        <Check className="h-5 w-5 mr-2" />
                        In Your Agenda
                      </>
                    ) : (
                      <>
                        <Plus className="h-5 w-5 mr-2" />
                        Add to Agenda
                      </>
                    )}
                  </button>
                  {isCheckedInToSession(session.id) && (
                    <span className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      <Check className="h-4 w-4 mr-1" />
                      Checked In
                    </span>
                  )}
                </>
              ) : (
                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Sign in to add to agenda
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Discussion Section */}
        <div className="mt-8 bg-white shadow-sm rounded-lg overflow-hidden">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <MessageSquare className="h-5 w-5 mr-2" />
              Discussion
            </h2>

            {isAuthenticated ? (
              <form onSubmit={handleAddComment} className="mb-6">
                <div className="mt-1">
                  <textarea
                    rows={3}
                    name="comment"
                    id="comment"
                    className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                    placeholder="Share your thoughts..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                  />
                </div>
                <div className="mt-3 flex justify-end">
                  <button
                    type="submit"
                    disabled={!newComment.trim() || isAddingComment}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAddingComment ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-gray-50 rounded-md p-4 mb-6">
                <p className="text-sm text-gray-700">
                  Please{' '}
                  <button
                    onClick={() => navigate('/login')}
                    className="text-primary-600 hover:text-primary-500 font-medium"
                  >
                    sign in
                  </button>{' '}
                  to join the discussion.
                </p>
              </div>
            )}

            <div className="space-y-4">
              <AnimatePresence>
                {comments.length > 0 ? (
                  comments.map((comment) => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="bg-gray-50 rounded-lg p-4"
                    >
                      <div className="flex space-x-3">
                        <div className="flex-shrink-0">
                          {comment.userAvatarUrl ? (
                            <img
                              className="h-10 w-10 rounded-full"
                              src={comment.userAvatarUrl}
                              alt={comment.userName}
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-primary-700 font-medium">
                                {comment.userName.charAt(0)}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-medium text-gray-900">
                              {comment.userName}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {new Date(comment.timestamp).toLocaleDateString(undefined, {
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit'
                              })}
                            </p>
                          </div>
                          <p className="text-sm text-gray-700">{comment.content}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    No comments yet. Be the first to share your thoughts!
                  </p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SessionDetailPage;