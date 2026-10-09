import { Link } from 'react-router-dom'

function Orders() {
  const orders = [
    {
      id: 'KM1001',
      product: 'Rice',
      quantity: '1 kg',
      price: '₹45',
      farmer: 'Ramesh Kumar',
      location: 'Ranchi, Jharkhand',
      status: 'Order Placed',
      emoji: '🌾',
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-green-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold">My Orders</h1>
          <p className="mt-2 text-green-100">
            Track and manage your Kissan Mitra orders.
          </p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-10">
        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="text-7xl">📦</div>

            <h2 className="mt-6 text-3xl font-bold text-gray-900">
              No Orders Yet
            </h2>

            <p className="mt-3 text-gray-500">
              Your placed orders will appear here.
            </p>

            <Link
              to="/marketplace"
              className="inline-block mt-6 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
            >
              Explore Marketplace
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl shadow-sm p-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-6">

                  <div className="w-24 h-24 bg-green-50 rounded-xl flex items-center justify-center">
                    <span className="text-5xl">
                      {order.emoji}
                    </span>
                  </div>

                  <div className="flex-1">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div>
                        <p className="text-sm text-gray-500">
                          Order ID
                        </p>

                        <h2 className="text-xl font-bold text-gray-900">
                          #{order.id}
                        </h2>
                      </div>

                      <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold w-fit">
                        ✓ {order.status}
                      </span>
                    </div>

                    <div className="mt-5 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">

                      <div>
                        <p className="text-sm text-gray-500">
                          Product
                        </p>
                        <p className="mt-1 font-semibold text-gray-900">
                          {order.product}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">
                          Quantity
                        </p>
                        <p className="mt-1 font-semibold text-gray-900">
                          {order.quantity}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">
                          Total
                        </p>
                        <p className="mt-1 font-semibold text-green-700">
                          {order.price}
                        </p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">
                          Farmer
                        </p>
                        <p className="mt-1 font-semibold text-gray-900">
                          {order.farmer}
                        </p>
                      </div>

                    </div>

                    <p className="mt-4 text-sm text-gray-500">
                      📍 {order.location}
                    </p>
                  </div>

                  <Link
                    to="/order-tracking"
                    className="px-5 py-3 border border-green-600 text-green-700 rounded-lg font-semibold hover:bg-green-50 transition text-center"
                  >
                    Track Order
                  </Link>

                </div>
              </div>
            ))}
          </div>
        )}
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

export default Orders