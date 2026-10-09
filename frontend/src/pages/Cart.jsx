import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

function Cart() {
  const [cartItems, setCartItems] = useState([])

  useEffect(() => {
    const savedCart =
      JSON.parse(localStorage.getItem('cart')) || []

    setCartItems(savedCart)
  }, [])

  const updateQuantity = (id, change) => {
    const updatedCart = cartItems
      .map((item) => {
        if (item.id === id) {
          return {
            ...item,
            quantity: item.quantity + change,
          }
        }

        return item
      })
      .filter((item) => item.quantity > 0)

    setCartItems(updatedCart)

    localStorage.setItem(
      'cart',
      JSON.stringify(updatedCart)
    )
  }

  const removeItem = (id) => {
    const updatedCart = cartItems.filter(
      (item) => item.id !== id
    )

    setCartItems(updatedCart)

    localStorage.setItem(
      'cart',
      JSON.stringify(updatedCart)
    )
  }

  const total = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  )

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ================= HEADER ================= */}
      <section className="bg-green-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">

          <h1 className="text-4xl font-bold">
            Shopping Cart
          </h1>

          <p className="mt-2 text-green-100">
            Review your selected crops before checkout.
          </p>

        </div>
      </section>


      {/* ================= EMPTY CART ================= */}
      {cartItems.length === 0 ? (

        <section className="max-w-4xl mx-auto px-6 py-20 text-center">

          <div className="text-7xl">
            🛒
          </div>

          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Your cart is empty
          </h2>

          <p className="mt-3 text-gray-500">
            Explore the marketplace and add some fresh crops.
          </p>

          <Link
            to="/marketplace"
            className="inline-block mt-6 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
          >
            Explore Marketplace
          </Link>

        </section>

      ) : (

        /* ================= CART ================= */
        <section className="max-w-7xl mx-auto px-6 py-10">

          <div className="grid lg:grid-cols-3 gap-8">

            {/* ================= CART ITEMS ================= */}
            <div className="lg:col-span-2 space-y-5">

              {cartItems.map((item) => (

                <div
                  key={item.id}
                  className="bg-white rounded-2xl shadow-sm p-6"
                >

                  <div className="flex flex-col sm:flex-row gap-5">

                    {/* Product Image */}
                    <div className="w-full sm:w-32 h-32 bg-green-50 rounded-xl flex items-center justify-center">

                      <span className="text-6xl">
                        {item.emoji}
                      </span>

                    </div>


                    {/* Product Details */}
                    <div className="flex-1">

                      <div className="flex justify-between gap-4">

                        <div>

                          <h2 className="text-xl font-bold text-gray-900">
                            {item.name}
                          </h2>

                          <p className="mt-1 text-sm text-gray-500">
                            👨‍🌾 {item.farmer}
                          </p>

                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-red-500 hover:text-red-700 font-semibold"
                        >
                          Remove
                        </button>

                      </div>


                      {/* Price */}
                      <p className="mt-4 text-lg font-bold text-green-700">
                        ₹{item.price} / kg
                      </p>


                      {/* Quantity */}
                      <div className="mt-4 flex items-center gap-3">

                        <span className="text-sm text-gray-500">
                          Quantity:
                        </span>

                        <button
                          onClick={() =>
                            updateQuantity(item.id, -1)
                          }
                          className="w-9 h-9 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          −
                        </button>

                        <span className="font-semibold">
                          {item.quantity} kg
                        </span>

                        <button
                          onClick={() =>
                            updateQuantity(item.id, 1)
                          }
                          className="w-9 h-9 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          +
                        </button>

                      </div>

                    </div>


                    {/* Item Total */}
                    <div className="sm:text-right">

                      <p className="text-sm text-gray-500">
                        Item Total
                      </p>

                      <p className="mt-1 text-xl font-bold text-gray-900">
                        ₹{item.price * item.quantity}
                      </p>

                    </div>

                  </div>

                </div>

              ))}

            </div>


            {/* ================= ORDER SUMMARY ================= */}
            <div>

              <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">

                <h2 className="text-xl font-bold text-gray-900">
                  Order Summary
                </h2>


                <div className="mt-6 space-y-4">

                  <div className="flex justify-between text-gray-600">

                    <span>
                      Subtotal
                    </span>

                    <span>
                      ₹{total}
                    </span>

                  </div>


                  <div className="flex justify-between text-gray-600">

                    <span>
                      Delivery
                    </span>

                    <span className="text-green-600 font-semibold">
                      Free
                    </span>

                  </div>


                  <div className="border-t border-gray-200 pt-4 flex justify-between">

                    <span className="font-bold text-gray-900">
                      Total
                    </span>

                    <span className="text-2xl font-bold text-green-700">
                      ₹{total}
                    </span>

                  </div>

                </div>


                {/* Checkout */}
                <Link
                  to="/checkout"
                  className="mt-6 block w-full px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition text-center"
                >
                  Proceed to Checkout
                </Link>


                {/* Continue Shopping */}
                <Link
                  to="/marketplace"
                  className="mt-3 block w-full px-6 py-3 border border-green-600 text-green-700 rounded-lg font-semibold text-center hover:bg-green-50 transition"
                >
                  Continue Shopping
                </Link>

              </div>

            </div>

          </div>

        </section>

      )}


      {/* ================= FOOTER ================= */}
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

export default Cart