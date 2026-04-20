import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import SmoothScroll from './components/SmoothScroll';

function App() {
  return (
    <Router>
      <SmoothScroll>
        <div className="min-h-screen bg-[#0f0f0f] text-white">
          <Routes>
            {/* User Portfolio Routes */}
            <Route path="/" element={<Home />} />
            
            {/* Admin Dashboard Routes (Fully Separate) */}
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </div>
      </SmoothScroll>
    </Router>
  );
}

export default App;
