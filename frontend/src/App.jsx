import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import Home from './pages/Home'
import Register from './pages/Register'
import Login from './pages/Login'
import Equipment from './pages/Equipment'
import Booking from './pages/Booking'
import Cart from './pages/Cart'
import Fertilizer from './pages/Fertilizer'
import Feedback from './pages/Feedback'
import Account from './pages/Account'
import AdminDashboard from './pages/AdminDashboard'
import { CartProvider } from './context/CartContext'

function App() {
  return (
    <CartProvider>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/"           element={<Home />} />
          <Route path="/register"   element={<Register />} />
          <Route path="/login"      element={<Login />} />
          <Route path="/equipment"  element={<Equipment />} />
          <Route path="/cart"       element={<Cart />} />
          <Route path="/booking"    element={<Booking />} />
          <Route path="/fertilizer" element={<Fertilizer />} />
          <Route path="/feedback"   element={<Feedback />} />
          <Route path="/account"    element={<Account />} />
          <Route path="/admin"      element={<AdminDashboard />} />
        </Routes>
      </main>
      <Footer />
    </div>
    </CartProvider>
  )
}

export default App
