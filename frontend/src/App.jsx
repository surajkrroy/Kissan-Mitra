
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Marketplace from './pages/Marketplace'
import ProductDetails from './pages/ProductDetails'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import OrderTracking from './pages/OrderTracking'

function MandiPrices() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-green-700">
          Mandi Prices
        </h1>

        <p className="mt-3 text-gray-600">
          Check current mandi prices.
        </p>
      </div>
    </div>
  )
}

function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold text-green-700">
          About Kissan Mitra
        </h1>

        <p className="mt-3 text-gray-600">
          Connecting farmers and buyers directly.
        </p>
      </div>
    </div>
  )
}

function Login() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-md mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-green-700 text-center">
          Login
        </h1>
      </div>
    </div>
  )
}

function Register() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-md mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-green-700 text-center">
          Create Account
        </h1>
      </div>
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <Routes>

        <Route path="/" element={<Home />} />

        <Route
          path="/marketplace"
          element={
            <>
              <Navbar />
              <Marketplace />
            </>
          }
        />

        <Route
          path="/product/:id"
          element={
            <>
              <Navbar />
              <ProductDetails />
            </>
          }
        />

        <Route
          path="/cart"
          element={
            <>
              <Navbar />
              <Cart />
            </>
          }
        />

        <Route
            path="/orders"
           element={
              <>
                  <Navbar />
                  <Orders />
              </>
           }
        />

        <Route
            path="/order-tracking"
            element={
              <>
                 <Navbar />
                 <OrderTracking />
              </>
           }
         />

        <Route
           path="/checkout"
           element={
             <>
                <Navbar />
                <Checkout />
             </>
            }
          />

        <Route path="/mandi-prices" element={<MandiPrices />} />

        <Route path="/about" element={<About />} />

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

      </Routes>
    </BrowserRouter>
  )
}

export default App