import { Routes, Route, Navigate } from 'react-router-dom'
import { isLoggedIn } from './auth'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Attractions from './pages/Attractions.jsx'
import Food from './pages/Food.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Bookings from './pages/Bookings.jsx'
import Revenue from './pages/Revenue.jsx'
import Discounts from './pages/Discounts.jsx'
import Events from './pages/Events.jsx'
import Corporates from './pages/Corporates.jsx'
import Communications from './pages/Communications.jsx'
import Settings from './pages/Settings.jsx'

function Protected({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Protected><Layout /></Protected>}>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/bookings" element={<Bookings />} />
        <Route path="/attractions" element={<Attractions />} />
        <Route path="/food" element={<Food />} />
        <Route path="/corporates" element={<Corporates />} />
        <Route path="/revenue" element={<Revenue />} />
        <Route path="/discounts" element={<Discounts />} />
        <Route path="/communications" element={<Communications />} />
        <Route path="/events" element={<Events />} />
        <Route path="/settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
