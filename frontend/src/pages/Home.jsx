import { Link } from 'react-router-dom'
function Home() {
  return (
    <div className="min-h-screen bg-green-50">

      {/* ================= HERO ================= */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">

          {/* Left */}
          <div>
            <span className="inline-block px-4 py-2 rounded-full bg-green-100 text-green-700 font-semibold text-sm">
              🌾 Farmers & Buyers Platform
            </span>

            <h1 className="mt-6 text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
              Farm Fresh.
              <span className="text-green-600">
                {" "}Direct to You.
              </span>
            </h1>

            <p className="mt-6 text-lg text-gray-600 leading-relaxed">
              Kissan Mitra connects farmers directly with buyers.
              Farmers can sell their crops and buyers can purchase
              fresh agricultural products directly from the source.
            </p>

            <div className="mt-8 flex gap-4 flex-wrap">

               <Link
                     to="/marketplace"
                     className="px-7 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                  >
                      Explore Marketplace
               </Link>

              <button className="px-7 py-3 bg-white text-green-700 border border-green-600 rounded-lg font-semibold hover:bg-green-50 transition">
                Sell Your Crops
              </button>

            </div>
          </div>

          {/* Right */}
          <div className="bg-white rounded-3xl shadow-lg p-8">

            <div className="h-80 rounded-2xl bg-green-100 flex items-center justify-center">

              <div className="text-center">

                <div className="text-7xl">
                  🌾
                </div>

                <h2 className="mt-5 text-2xl font-bold text-green-700">
                  From Farm
                </h2>

                <div className="text-3xl my-3">
                  ↓
                </div>

                <h2 className="text-2xl font-bold text-green-700">
                  Directly to Buyer
                </h2>

              </div>

            </div>

          </div>

        </div>
      </section>


      {/* ================= WHY KISSAN MITRA ================= */}
      <section className="bg-white py-16">

        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-12">

            <h2 className="text-3xl font-bold text-gray-900">
              Why Kissan Mitra?
            </h2>

            <p className="mt-3 text-gray-600">
              Simple, direct and transparent agricultural marketplace.
            </p>

          </div>


          <div className="grid md:grid-cols-3 gap-8">

            {/* Farmer */}
            <div className="p-6 rounded-2xl bg-green-50 shadow-sm">

              <div className="text-4xl">
                👨‍🌾
              </div>

              <h3 className="mt-4 text-xl font-bold text-gray-900">
                For Farmers
              </h3>

              <p className="mt-2 text-gray-600">
                Farmers can sell their crops directly to buyers.
              </p>

            </div>


            {/* Price */}
            <div className="p-6 rounded-2xl bg-yellow-50 shadow-sm">

              <div className="text-4xl">
                💰
              </div>

              <h3 className="mt-4 text-xl font-bold text-gray-900">
                Better Prices
              </h3>

              <p className="mt-2 text-gray-600">
                Transparent prices help farmers and buyers make better decisions.
              </p>

            </div>


            {/* Buyer */}
            <div className="p-6 rounded-2xl bg-blue-50 shadow-sm">

              <div className="text-4xl">
                🛒
              </div>

              <h3 className="mt-4 text-xl font-bold text-gray-900">
                For Buyers
              </h3>

              <p className="mt-2 text-gray-600">
                Buyers can find fresh crops directly from farmers.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ================= POPULAR CROPS ================= */}
      <section className="bg-green-50 py-16">

        <div className="max-w-7xl mx-auto px-6">

          <div className="flex items-center justify-between mb-10">

            <div>
              <h2 className="text-3xl font-bold text-gray-900">
                Popular Crops
              </h2>

              <p className="mt-2 text-gray-600">
                Fresh crops available from farmers.
              </p>
            </div>

            <button className="text-green-700 font-semibold hover:text-green-800">
              View All →
            </button>

          </div>


          <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">

            {/* Rice */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

              <div className="h-40 bg-yellow-100 flex items-center justify-center text-6xl">
                🌾
              </div>

              <div className="p-5">

                <h3 className="text-xl font-bold text-gray-900">
                  Rice
                </h3>

                <p className="mt-1 text-gray-500">
                  Fresh farm rice
                </p>

                <p className="mt-4 text-green-700 font-bold">
                  ₹45 / kg
                </p>

              </div>

            </div>


            {/* Wheat */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

              <div className="h-40 bg-orange-100 flex items-center justify-center text-6xl">
                🌾
              </div>

              <div className="p-5">

                <h3 className="text-xl font-bold text-gray-900">
                  Wheat
                </h3>

                <p className="mt-1 text-gray-500">
                  Quality wheat
                </p>

                <p className="mt-4 text-green-700 font-bold">
                  ₹32 / kg
                </p>

              </div>

            </div>


            {/* Potato */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

              <div className="h-40 bg-yellow-50 flex items-center justify-center text-6xl">
                🥔
              </div>

              <div className="p-5">

                <h3 className="text-xl font-bold text-gray-900">
                  Potato
                </h3>

                <p className="mt-1 text-gray-500">
                  Fresh potatoes
                </p>

                <p className="mt-4 text-green-700 font-bold">
                  ₹28 / kg
                </p>

              </div>

            </div>


            {/* Tomato */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">

              <div className="h-40 bg-red-50 flex items-center justify-center text-6xl">
                🍅
              </div>

              <div className="p-5">

                <h3 className="text-xl font-bold text-gray-900">
                  Tomato
                </h3>

                <p className="mt-1 text-gray-500">
                  Farm fresh tomatoes
                </p>

                <p className="mt-4 text-green-700 font-bold">
                  ₹35 / kg
                </p>

              </div>

            </div>

          </div>

        </div>

      </section>


      {/* ================= MANDI PRICE ================= */}
      <section className="bg-white py-16">

        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-10">

            <h2 className="text-3xl font-bold text-gray-900">
              Today's Mandi Prices
            </h2>

            <p className="mt-3 text-gray-600">
              Check the latest crop prices before buying or selling.
            </p>

          </div>


          <div className="bg-yellow-50 rounded-2xl p-6 overflow-x-auto">

            <table className="w-full text-left">

              <thead>

                <tr className="border-b border-yellow-200">

                  <th className="py-4 px-4">
                    Crop
                  </th>

                  <th className="py-4 px-4">
                    Market
                  </th>

                  <th className="py-4 px-4">
                    Price
                  </th>

                  <th className="py-4 px-4">
                    Change
                  </th>

                </tr>

              </thead>

              <tbody>

                <tr className="border-b border-yellow-100">

                  <td className="py-4 px-4 font-semibold">
                    Rice
                  </td>

                  <td className="py-4 px-4">
                    Ranchi
                  </td>

                  <td className="py-4 px-4 font-semibold">
                    ₹4,500 / Quintal
                  </td>

                  <td className="py-4 px-4 text-green-600">
                    ↑ 2.4%
                  </td>

                </tr>


                <tr className="border-b border-yellow-100">

                  <td className="py-4 px-4 font-semibold">
                    Wheat
                  </td>

                  <td className="py-4 px-4">
                    Ranchi
                  </td>

                  <td className="py-4 px-4 font-semibold">
                    ₹3,200 / Quintal
                  </td>

                  <td className="py-4 px-4 text-green-600">
                    ↑ 1.8%
                  </td>

                </tr>


                <tr>

                  <td className="py-4 px-4 font-semibold">
                    Potato
                  </td>

                  <td className="py-4 px-4">
                    Jamshedpur
                  </td>

                  <td className="py-4 px-4 font-semibold">
                    ₹2,800 / Quintal
                  </td>

                  <td className="py-4 px-4 text-red-500">
                    ↓ 0.7%
                  </td>

                </tr>

              </tbody>

            </table>

          </div>

        </div>

      </section>


      {/* ================= HOW IT WORKS ================= */}
      <section className="bg-green-50 py-16">

        <div className="max-w-7xl mx-auto px-6">

          <div className="text-center mb-12">

            <h2 className="text-3xl font-bold text-gray-900">
              How Kissan Mitra Works
            </h2>

            <p className="mt-3 text-gray-600">
              Three simple steps to connect farmers and buyers.
            </p>

          </div>


          <div className="grid md:grid-cols-3 gap-8">

            {/* Step 1 */}
            <div className="text-center">

              <div className="w-14 h-14 mx-auto rounded-full bg-green-600 text-white flex items-center justify-center text-xl font-bold">
                1
              </div>

              <h3 className="mt-4 text-xl font-bold">
                Farmers List Crops
              </h3>

              <p className="mt-2 text-gray-600">
                Farmers add their crops, quantity and price.
              </p>

            </div>


            {/* Step 2 */}
            <div className="text-center">

              <div className="w-14 h-14 mx-auto rounded-full bg-green-600 text-white flex items-center justify-center text-xl font-bold">
                2
              </div>

              <h3 className="mt-4 text-xl font-bold">
                Buyers Explore
              </h3>

              <p className="mt-2 text-gray-600">
                Buyers search and compare available crops.
              </p>

            </div>


            {/* Step 3 */}
            <div className="text-center">

              <div className="w-14 h-14 mx-auto rounded-full bg-green-600 text-white flex items-center justify-center text-xl font-bold">
                3
              </div>

              <h3 className="mt-4 text-xl font-bold">
                Direct Connection
              </h3>

              <p className="mt-2 text-gray-600">
                Farmers and buyers connect directly.
              </p>

            </div>

          </div>

        </div>

      </section>


      {/* ================= CTA ================= */}
      <section className="bg-green-700 py-16">

        <div className="max-w-4xl mx-auto px-6 text-center text-white">

          <h2 className="text-3xl md:text-4xl font-bold">
            Ready to Connect Directly?
          </h2>

          <p className="mt-4 text-green-100 text-lg">
            Join Kissan Mitra and make agricultural trading simpler.
          </p>

          <div className="mt-8 flex justify-center gap-4 flex-wrap">

            <button className="px-7 py-3 bg-white text-green-700 rounded-lg font-semibold hover:bg-green-50 transition">
              Start Buying
            </button>

            <button className="px-7 py-3 border border-white text-white rounded-lg font-semibold hover:bg-green-600 transition">
              Start Selling
            </button>

          </div>

        </div>

      </section>


      {/* ================= FOOTER ================= */}
      <footer className="bg-gray-900 text-white py-10">

        <div className="max-w-7xl mx-auto px-6">

          <div className="grid md:grid-cols-3 gap-8">

            <div>

              <h2 className="text-2xl font-bold text-green-400">
                Kissan Mitra
              </h2>

              <p className="mt-3 text-gray-400">
                Connecting farmers directly with buyers.
              </p>

            </div>


            <div>

              <h3 className="font-semibold">
                Quick Links
              </h3>

              <div className="mt-3 space-y-2 text-gray-400">

                <p className="hover:text-white cursor-pointer">
                  Home
                </p>

                <p className="hover:text-white cursor-pointer">
                  Marketplace
                </p>

                <p className="hover:text-white cursor-pointer">
                  Mandi Prices
                </p>

              </div>

            </div>


            <div>

              <h3 className="font-semibold">
                Contact
              </h3>

              <p className="mt-3 text-gray-400">
                Support for Farmers & Buyers
              </p>

              <p className="mt-2 text-gray-400">
                Email: support@kissanmitra.com
              </p>

            </div>

          </div>


          <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-500">
            © 2026 Kissan Mitra. All rights reserved.
          </div>

        </div>

      </footer>

    </div>
  )
}

export default Home