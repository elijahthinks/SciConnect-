import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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

function App() {
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
          
          <Navbar />
          <MobileNav />
          
          <main className="pt-1 pb-20 md:pb-6">
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
          </main>
        </div>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
