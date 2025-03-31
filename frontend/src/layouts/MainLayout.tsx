import { Outlet } from 'react-router-dom';
import { useEffect } from 'react';
import { Menu, LogOut, Plus } from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { useChatStore } from '../store/chat.store';

/**
 * Main layout component for authenticated pages (chat)
 */
const MainLayout = () => {
  const { user, logout } = useAuthStore();
  const { 
    conversations, 
    fetchConversations, 
    createConversation, 
    fetchConversation,
    setCurrentConversation,
    isLoading 
  } = useChatStore();

  // Fetch conversations when component mounts
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Handle new conversation
  const handleNewConversation = async () => {
    try {
      await createConversation({ title: 'New Conversation' });
    } catch (error) {
      console.error('Failed to create new conversation', error);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
  };

  // Handle conversation selection
  const handleSelectConversation = (conversationId: string) => {
    fetchConversation(conversationId);
  };

  return (
    <div className="h-screen flex overflow-hidden bg-white">
      {/* Sidebar */}
      <div className="hidden md:flex md:flex-shrink-0">
        <div className="flex flex-col w-64">
          {/* Sidebar header */}
          <div className="flex flex-col h-0 flex-1 bg-gray-800">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              <div className="flex items-center flex-shrink-0 px-4">
                <h1 className="text-white text-xl font-semibold">Gemini Chat</h1>
              </div>
              
              {/* User info */}
              <div className="mt-5 px-4">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-500 rounded-full p-1">
                    <span className="text-white text-sm font-medium">
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-white">{user?.username}</p>
                    <p className="text-xs font-medium text-gray-300">{user?.email}</p>
                  </div>
                </div>
              </div>
              
              {/* New chat button */}
              <div className="px-4 mt-5 mb-2">
                <button
                  onClick={handleNewConversation}
                  disabled={isLoading}
                  className="flex items-center justify-center w-full px-4 py-2 border border-transparent 
                            rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 
                            hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                            focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={16} className="mr-2" />
                  New Chat
                </button>
              </div>
              
              {/* Conversations list */}
              <div className="mt-2">
                <h2 className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Conversations
                </h2>
                <div className="mt-2 space-y-1">
                  {isLoading && !conversations.length ? (
                    <div className="px-4 py-2 text-sm text-gray-300">Loading...</div>
                  ) : conversations.length > 0 ? (
                    conversations.map((conversation) => (
                      <button
                        key={conversation.id}
                        onClick={() => handleSelectConversation(conversation.id)}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-300 
                                   hover:bg-gray-700 hover:text-white transition-colors 
                                   group rounded-md"
                      >
                        <span className="truncate">{conversation.title}</span>
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-2 text-sm text-gray-300">
                      No conversations yet
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Sidebar footer */}
            <div className="flex-shrink-0 flex border-t border-gray-700 p-4">
              <button
                onClick={handleLogout}
                className="flex-shrink-0 group block focus:outline-none"
              >
                <div className="flex items-center">
                  <div>
                    <LogOut size={16} className="text-gray-300" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-300 group-hover:text-white">
                      Sign out
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        {/* Mobile header */}
        <div className="md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3">
          <button className="h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900">
            <span className="sr-only">Open sidebar</span>
            <Menu size={24} />
          </button>
        </div>
        
        {/* Content area */}
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;