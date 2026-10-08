import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './store/auth';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Feed from './pages/Feed';
import ResearchFeed from './pages/ResearchFeed';
import Profile from './pages/Profile';
import Explore from './pages/Explore';
import Connections from './pages/Connections';
import Settings from './pages/Settings';
import Messages from './pages/Messages';
import Groups from './pages/Groups';
import ErrorBoundary from './components/ErrorBoundary';
import { Toaster } from 'react-hot-toast';
import MobileNav from './components/MobileNav';
import GuestGate from './components/GuestGate';

function App() {
  const { user, token } = useAuth();

  useEffect(() => {
    console.log('App mounted, auth state:', { 
      hasUser: !!user, 
      hasToken: !!token,
      userDetails: user ? { id: user.id, email: user.email, username: user.username } : null,
      storedAuth: localStorage.getItem('auth')
    });
    
    // Additional debugging for auth state
    if (user && token) {
      console.log('User is authenticated, should show protected routes');
    } else {
      console.log('User is not authenticated, starting guest session');
    }
  }, [user, token]);

  // Add debugging for route changes
  useEffect(() => {
    const handleRouteChange = () => {
      console.log('Route changed to:', window.location.pathname, {
        hasUser: !!user,
        hasToken: !!token
      });
    };
    
    window.addEventListener('popstate', handleRouteChange);
    return () => window.removeEventListener('popstate', handleRouteChange);
  }, [user, token]);

  return (
    <ErrorBoundary>
      <Router>
        <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-primary-50 to-neutral-100">
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#ffffff',
                color: '#1e293b',
                boxShadow: '0 10px 15px -3px rgba(99, 102, 241, 0.1), 0 4px 6px -2px rgba(99, 102, 241, 0.05)',
                borderRadius: '0.75rem',
                border: '1px solid #e2e8f0',
                fontFamily: 'Inter, system-ui, sans-serif'
              }
            }}
          />
          
          {user && <Navbar />}
          {user && <MobileNav />}
          
          <main className={user ? 'pt-1 pb-20 md:pb-6' : 'min-h-screen'}>
            {user ? (
              <Routes>
                <Route path="/" element={<Feed />} />
                <Route path="/feed" element={<Navigate to="/" replace />} />
                <Route path="/research" element={<ResearchFeed />} />
                <Route path="/explore" element={<Explore />} />
                <Route path="/connections" element={<Connections />} />
                <Route path="/groups" element={<Groups />} />
                <Route path="/chat" element={<Messages />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/profile/:userId" element={<Profile />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            ) : (
              /* No login/sign-up: visitors are signed in as a guest automatically */
              <GuestGate />
            )}
          </main>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
