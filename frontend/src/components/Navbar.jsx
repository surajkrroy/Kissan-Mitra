import { Link } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">

      <div className="max-w-7xl mx-auto px-6 py-4">

        <div className="flex items-center justify-between">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-3">

            <div className="w-11 h-11 rounded-full bg-green-600 flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-xl">
                K
              </span>
            </div>

            <div>
              <h1 className="text-xl font-bold text-green-700">
                Kissan Mitra
              </h1>

              <p className="text-xs text-gray-500">
                Farmers • Buyers • Direct
              </p>
            </div>

          </Link>


          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">

            <Link
              to="/"
              className="text-gray-700 hover:text-green-600 font-medium transition"
            >
              Home
            </Link>

            <Link
              to="/marketplace"
              className="text-gray-700 hover:text-green-600 font-medium transition"
            >
              Marketplace
            </Link>

            <Link
              to="/mandi-prices"
              className="text-gray-700 hover:text-green-600 font-medium transition"
            >
              Mandi Prices
            </Link>

            <Link
              to="/about"
              className="text-gray-700 hover:text-green-600 font-medium transition"
            >
              About
            </Link>

          </div>


          {/* Right Actions */}
          <div className="flex items-center gap-3">

            <Link
              to="/login"
              className="hidden sm:block px-4 py-2 text-green-700 font-semibold hover:bg-green-50 rounded-lg transition"
            >
              Login
            </Link>

            <Link
              to="/register"
              className="px-5 py-2.5 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition shadow-sm"
            >
              Register
            </Link>

          </div>

        </div>

      </div>

    </nav>
  )
}

export default Navbar