import { Link } from 'react-router-dom'

function OrderTracking() {
  const steps = [
    {
      title: 'Order Placed',
      description: 'Your order has been successfully placed.',
      done: true,
    },
    {
      title: 'Order Confirmed',
      description: 'Farmer has received your order.',
      done: true,
    },
    {
      title: 'Preparing Order',
      description: 'Your crops are being prepared for delivery.',
      done: false,
    },
    {
      title: 'Out for Delivery',
      description: 'Your order is on the way.',
      done: false,
    },
    {
      title: 'Delivered',
      description: 'Order delivered successfully.',
      done: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-green-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <h1 className="text-4xl font-bold">Order Tracking</h1>
          <p className="mt-2 text-green-100">
            Track your order from farmer to your doorstep.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl shadow-sm p-6">

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sm text-gray-500">Order ID</p>
              <h2 className="text-2xl font-bold text-gray-900">
                #KM1001
              </h2>
            </div>

            <div className="px-4 py-2 bg-green-100 text-green-700 rounded-full font-semibold">
              Order Confirmed
            </div>
          </div>

          <div className="mt-8 p-5 bg-green-50 rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center">
                <span className="text-4xl">🌾</span>
              </div>

              <div>
                <h3 className="text-xl font-bold text-gray-900">
                  Rice
                </h3>

                <p className="text-gray-600">
                  1 kg × ₹45
                </p>

                <p className="text-sm text-gray-500">
                  Farmer: Ramesh Kumar
                </p>
              </div>
            </div>
          </div>

          <div className="mt-10">
            <h2 className="text-xl font-bold text-gray-900">
              Delivery Status
            </h2>

            <div className="mt-8">
              {steps.map((step, index) => (
                <div
                  key={step.title}
                  className="flex gap-5"
                >
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                        step.done
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {step.done ? '✓' : index + 1}
                    </div>

                    {index !== steps.length - 1 && (
                      <div
                        className={`w-1 h-16 ${
                          step.done
                            ? 'bg-green-500'
                            : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>

                  <div className="pb-8">
                    <h3
                      className={`text-lg font-bold ${
                        step.done
                          ? 'text-green-700'
                          : 'text-gray-500'
                      }`}
                    >
                      {step.title}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 grid sm:grid-cols-2 gap-4">
            <div className="p-5 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500">
                Delivery Address
              </p>
              <p className="mt-2 font-semibold text-gray-900">
                Ranchi, Jharkhand
              </p>
            </div>

            <div className="p-5 bg-gray-50 rounded-xl">
              <p className="text-sm text-gray-500">
                Payment
              </p>
              <p className="mt-2 font-semibold text-gray-900">
                Cash on Delivery
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-4">
            <Link
              to="/orders"
              className="flex-1 px-6 py-3 border border-green-600 text-green-700 rounded-lg font-semibold hover:bg-green-50 text-center"
            >
              ← My Orders
            </Link>

            <Link
              to="/marketplace"
              className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 text-center"
            >
              Continue Shopping
            </Link>
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

export default OrderTracking