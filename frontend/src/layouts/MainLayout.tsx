import { Outlet, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { 
  Menu, X, LogOut, Plus, MessageSquare, 
  Moon, Sun, Trash2, ArrowLeftRight 
} from 'lucide-react';
import { useAuthStore } from '../store/auth.store';
import { useChatStore } from '../store/chat.store';

/**
 * Main layout component for authenticated pages (chat)
 */
const MainLayout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();
  
  const { user, logout } = useAuthStore();
  const { 
    conversations, 
    fetchConversations, 
    createConversation, 
    fetchConversation,
    deleteConversation,
    currentConversation,
    isLoading 
  } = useChatStore();

  // Toggle dark mode
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Fetch conversations when component mounts
  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  // Handle new conversation
  const handleNewConversation = async () => {
    try {
      const newConversation = await createConversation({ title: 'New Conversation' });
      navigate(`/chat/${newConversation.id}`);
      // Close mobile menu after creating a new conversation
      setIsMobileMenuOpen(false);
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
    navigate(`/chat/${conversationId}`);
    // Close mobile menu after selecting a conversation
    setIsMobileMenuOpen(false);
  };
  
  // Handle conversation deletion
  const handleDeleteConversation = (e: React.MouseEvent, conversationId: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this conversation?')) {
      deleteConversation(conversationId);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-white dark:bg-gray-900">
      {/* Mobile sidebar backdrop */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-20 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div 
        className={`${
          isMobileMenuOpen ? 'fixed inset-y-0 left-0 z-30' : 'hidden'
        } md:flex md:flex-shrink-0 md:static md:z-auto transition-all duration-300 ease-in-out`}
      >
        <div className="flex flex-col w-72">
          {/* Sidebar header */}
          <div className="flex flex-col h-0 flex-1 bg-gray-800 dark:bg-gray-900 border-r border-gray-700">
            <div className="flex justify-between items-center h-16 px-4 border-b border-gray-700">
              <h1 className="text-white text-xl font-bold flex items-center">
                <ArrowLeftRight className="mr-2 text-indigo-400" />
                Multi-RoleAI
              </h1>
              <button 
                className="md:hidden text-gray-400 hover:text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* User info and actions */}
              <div className="p-4 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="w-8 h-8 flex-shrink-0 bg-indigo-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user?.username?.charAt(0).toUpperCase() || 'U'}
                      </span>
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-white">{user?.username}</p>
                      <p className="text-xs font-medium text-gray-400 truncate max-w-[160px]">{user?.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex">
                    <button 
                      onClick={() => setIsDarkMode(!isDarkMode)}
                      className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700"
                      aria-label="Toggle dark mode"
                    >
                      {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 ml-1"
                      aria-label="Sign out"
                    >
                      <LogOut size={18} />
                    </button>
                  </div>
                </div>
              </div>
              
              {/* New chat button */}
              <div className="p-4">
                <button
                  onClick={handleNewConversation}
                  disabled={isLoading}
                  className="flex items-center justify-center w-full px-4 py-2.5 
                             bg-indigo-600 hover:bg-indigo-700 
                             disabled:opacity-50 disabled:cursor-not-allowed
                             text-white font-medium rounded-lg shadow-sm
                             transition-colors duration-150"
                >
                  <Plus size={18} className="mr-2" />
                  New Conversation
                </button>
              </div>
              
              {/* Conversations list */}
              <div className="flex-1 overflow-y-auto p-2 thin-scrollbar">
                <h2 className="px-2 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Conversations
                </h2>
                <div className="space-y-1">
                  {isLoading && !conversations.length ? (
                    <div className="flex items-center justify-center h-24 text-gray-400">
                      <div className="w-5 h-5 border-2 border-t-indigo-500 rounded-full animate-spin mr-2"></div>
                      Loading...
                    </div>
                  ) : conversations.length > 0 ? (
                    conversations.map((conversation) => {
                      const isActive = currentConversation?.id === conversation.id;
                      return (
                        <button
                          key={conversation.id}
                          onClick={() => handleSelectConversation(conversation.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors group
                            ${isActive 
                              ? 'bg-gray-700 text-white' 
                              : 'text-gray-300 hover:bg-gray-700 hover:text-white'}`}
                        >
                          <div className="flex items-center overflow-hidden">
                            <MessageSquare size={16} className="flex-shrink-0 mr-2 text-gray-400" />
                            <span className="truncate">{conversation.title || 'New Conversation'}</span>
                          </div>
                          
                          <div className="flex ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                              onClick={(e) => handleDeleteConversation(e, conversation.id)}
                              className="p-1 rounded-md text-gray-400 hover:text-white hover:bg-gray-600"
                              aria-label="Delete conversation"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </button>
                      );
                    })
                  ) : (
                    <div className="px-3 py-6 text-center text-sm text-gray-400">
                      <MessageSquare size={24} className="mx-auto mb-2 opacity-50" />
                      No conversations yet
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-col w-0 flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
        {/* Mobile header */}
        <div className="sticky top-0 z-10 md:hidden flex items-center justify-between h-16 px-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <button 
            onClick={() => setIsMobileMenuOpen(true)}
            className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <span className="sr-only">Open sidebar</span>
            <Menu size={24} />
          </button>
          
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            Multi-RoleAI
          </h1>
          
          <div className="flex items-center">
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 rounded-md text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            <div className="ml-1 w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Content area */}
        <main className="flex-1 relative z-0 overflow-y-auto focus:outline-none h-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;