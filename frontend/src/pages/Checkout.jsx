import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

function Checkout() {
  const [cartItems, setCartItems] = useState([])
  const [paymentMethod, setPaymentMethod] = useState('cod')
  const navigate = useNavigate()

  useEffect(() => {
    const savedCart =
      JSON.parse(localStorage.getItem('cart')) || []

    setCartItems(savedCart)
  }, [])

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  const placeOrder = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty.')
      return
    }

    alert('Order placed successfully!')

    localStorage.removeItem('cart')

    navigate('/orders')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-green-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold">Checkout</h1>
          <p className="mt-2 text-green-100">
            Complete your order securely.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-6">

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900">
                1. Delivery Address
              </h2>

              <div className="mt-6 grid md:grid-cols-2 gap-4">

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Mobile Number
                  </label>
                  <input
                    type="tel"
                    placeholder="Enter mobile number"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Address
                  </label>
                  <textarea
                    rows="3"
                    placeholder="House no, street, village/city..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    placeholder="Enter city"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    placeholder="Enter PIN code"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>

              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900">
                2. Payment Method
              </h2>

              <div className="mt-6 space-y-4">

                <label
                  className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition ${
                    paymentMethod === 'cod'
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={paymentMethod === 'cod'}
                    onChange={(e) =>
                      setPaymentMethod(e.target.value)
                    }
                    className="w-5 h-5 accent-green-600"
                  />

                  <div>
                    <p className="font-semibold text-gray-900">
                      Cash on Delivery
                    </p>
                    <p className="text-sm text-gray-500">
                      Pay when your order arrives.
                    </p>
                  </div>
                </label>

                <label
                  className={`flex items-center gap-4 p-4 border rounded-xl cursor-pointer transition ${
                    paymentMethod === 'online'
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="online"
                    checked={paymentMethod === 'online'}
                    onChange={(e) =>
                      setPaymentMethod(e.target.value)
                    }
                    className="w-5 h-5 accent-green-600"
                  />

                  <div>
                    <p className="font-semibold text-gray-900">
                      Online Payment
                    </p>
                    <p className="text-sm text-gray-500">
                      UPI, Card or Net Banking.
                    </p>
                  </div>
                </label>

              </div>
            </div>

          </div>

          <div>
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">

              <h2 className="text-xl font-bold text-gray-900">
                Order Summary
              </h2>

              <div className="mt-6 space-y-5">

                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-4"
                  >
                    <div className="w-16 h-16 bg-green-50 rounded-lg flex items-center justify-center">
                      <span className="text-3xl">
                        {item.emoji}
                      </span>
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {item.name}
                      </h3>

                      <p className="text-sm text-gray-500">
                        {item.quantity} kg × ₹{item.price}
                      </p>
                    </div>

                    <p className="font-semibold">
                      ₹{item.price * item.quantity}
                    </p>
                  </div>
                ))}

              </div>

              <div className="mt-6 pt-5 border-t border-gray-200 space-y-4">

                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{total}</span>
                </div>

                <div className="flex justify-between text-gray-600">
                  <span>Delivery</span>
                  <span className="text-green-600 font-semibold">
                    Free
                  </span>
                </div>

                <div className="pt-4 border-t border-gray-200 flex justify-between">
                  <span className="font-bold text-gray-900">
                    Total
                  </span>

                  <span className="text-2xl font-bold text-green-700">
                    ₹{total}
                  </span>
                </div>

              </div>

              <button
                onClick={placeOrder}
                className="mt-6 w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
              >
                Place Order
              </button>

              <Link
                to="/cart"
                className="mt-3 block text-center text-green-700 font-semibold hover:text-green-800"
              >
                ← Back to Cart
              </Link>

            </div>
          </div>

        </div>
      </section>

      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-xl font-bold text-green-400">
            Kissan Mitra
          </h2>

          <p className="mt-2 text-gray-400">
            Connecting farmers directly with buyers.
          </p>

          <p className="mt-5 text-gray-500 text-sm">
            © 2026 Kissan Mitra. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Checkout