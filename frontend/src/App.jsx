import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, lazy, Suspense } from 'react';
import { useAuth } from './store/auth';
import useChatStore from './store/chat';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
const ChatWindow = lazy(() => import('./components/ChatWindow'));
import SignUp from './pages/SignUp';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Feed from './pages/Feed';
import Connections from './pages/Connections';
import Explore from './pages/Explore';
import Settings from './pages/Settings';

function App() {
  const { user } = useAuth();
  const { initializeSocket } = useChatStore();
  const [isChatOpen, setIsChatOpen] = useState(false);

  const handleChatClick = () => {
    if (user) {
      initializeSocket(user.id);
      setIsChatOpen(true);
    }
  };

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar onChatClick={handleChatClick} />
          <main className="pt-16">
            <Routes>
              <Route 
                path="/" 
                element={user ? <Navigate to="/feed" /> : <Navigate to="/login" />} 
              />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/login" element={<Login />} />
              <Route path="/feed" element={user ? <Feed /> : <Navigate to="/login" />} />
              <Route path="/explore" element={user ? <Explore /> : <Navigate to="/login" />} />
              <Route path="/connections" element={user ? <Connections /> : <Navigate to="/login" />} />
              <Route path="/settings" element={user ? <Settings /> : <Navigate to="/login" />} />
              <Route path="/profile/:id" element={<Profile />} />
              <Route path="/profile" element={user ? <Navigate to={`/profile/${user.id}`} /> : <Navigate to="/login" />} />
            </Routes>
          </main>
          
          {/* Chat Window - Rendered at app level for proper modal overlay */}
          <Suspense fallback={null}>
            <ChatWindow
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
            />
          </Suspense>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
