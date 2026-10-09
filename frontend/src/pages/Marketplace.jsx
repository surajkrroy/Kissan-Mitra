import { useState } from 'react'
import { Link } from 'react-router-dom'

const crops = [
  {
    id: 1,
    name: 'Rice',
    emoji: '🌾',
    price: '₹45 / kg',
    quantity: '500 kg',
    farmer: 'Ramesh Kumar',
    location: 'Ranchi, Jharkhand',
    category: 'Grains',
  },
  {
    id: 2,
    name: 'Wheat',
    emoji: '🌾',
    price: '₹32 / kg',
    quantity: '800 kg',
    farmer: 'Suresh Kumar',
    location: 'Hazaribagh, Jharkhand',
    category: 'Grains',
  },
  {
    id: 3,
    name: 'Potato',
    emoji: '🥔',
    price: '₹28 / kg',
    quantity: '1000 kg',
    farmer: 'Mohan Singh',
    location: 'Jamshedpur, Jharkhand',
    category: 'Vegetables',
  },
  {
    id: 4,
    name: 'Tomato',
    emoji: '🍅',
    price: '₹35 / kg',
    quantity: '400 kg',
    farmer: 'Amit Kumar',
    location: 'Ranchi, Jharkhand',
    category: 'Vegetables',
  },
  {
    id: 5,
    name: 'Onion',
    emoji: '🧅',
    price: '₹30 / kg',
    quantity: '700 kg',
    farmer: 'Rajesh Kumar',
    location: 'Bokaro, Jharkhand',
    category: 'Vegetables',
  },
  {
    id: 6,
    name: 'Maize',
    emoji: '🌽',
    price: '₹25 / kg',
    quantity: '600 kg',
    farmer: 'Vijay Kumar',
    location: 'Dumka, Jharkhand',
    category: 'Grains',
  },
  {
    id: 7,
    name: 'Mango',
    emoji: '🥭',
    price: '₹60 / kg',
    quantity: '300 kg',
    farmer: 'Arun Kumar',
    location: 'Deoghar, Jharkhand',
    category: 'Fruits',
  },
  {
    id: 8,
    name: 'Cabbage',
    emoji: '🥬',
    price: '₹22 / kg',
    quantity: '450 kg',
    farmer: 'Deepak Kumar',
    location: 'Giridih, Jharkhand',
    category: 'Vegetables',
  },
]

function Marketplace() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')

  const filteredCrops = crops.filter((crop) => {
    const matchesSearch =
      crop.name.toLowerCase().includes(search.toLowerCase()) ||
      crop.location.toLowerCase().includes(search.toLowerCase())

    const matchesCategory =
      category === 'All' || crop.category === category

    return matchesSearch && matchesCategory
  })

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ================= HEADER ================= */}
      <section className="bg-green-700 text-white">
        <div className="max-w-7xl mx-auto px-6 py-14">

          <h1 className="text-4xl md:text-5xl font-bold">
            Marketplace
          </h1>

          <p className="mt-3 text-green-100 text-lg">
            Buy fresh crops directly from farmers.
          </p>

        </div>
      </section>


      {/* ================= SEARCH & FILTER ================= */}
      <section className="max-w-7xl mx-auto px-6 py-8">

        <div className="bg-white rounded-2xl shadow-sm p-6">

          <div className="grid md:grid-cols-3 gap-4">

            {/* Search */}
            <div className="md:col-span-2">

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search Crops
              </label>

              <div className="relative">

                <input
                  type="text"
                  placeholder="Search rice, wheat, potato..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />

              </div>

            </div>


            {/* Category */}
            <div>

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Category
              </label>

              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="All">All Categories</option>
                <option value="Grains">Grains</option>
                <option value="Vegetables">Vegetables</option>
                <option value="Fruits">Fruits</option>
              </select>

            </div>

          </div>

        </div>

      </section>


      {/* ================= MARKETPLACE CONTENT ================= */}
      <section className="max-w-7xl mx-auto px-6 pb-16">

        {/* Result Header */}
        <div className="flex items-center justify-between mb-6">

          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Available Crops
            </h2>

            <p className="mt-1 text-gray-500">
              {filteredCrops.length} crops available
            </p>
          </div>

          <select className="hidden sm:block px-4 py-2 border border-gray-300 rounded-lg bg-white text-gray-700">
            <option>Sort: Latest</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
          </select>

        </div>


        {/* Crop Cards */}
        {filteredCrops.length > 0 ? (

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">

            {filteredCrops.map((crop) => (

              <div
                key={crop.id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition"
              >

                {/* Crop Image */}
                <div className="h-44 bg-green-50 flex items-center justify-center">

                  <span className="text-7xl">
                    {crop.emoji}
                  </span>

                </div>


                {/* Card Content */}
                <div className="p-5">

                  <div className="flex items-start justify-between gap-2">

                    <h3 className="text-xl font-bold text-gray-900">
                      {crop.name}
                    </h3>

                    <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700 font-semibold">
                      {crop.category}
                    </span>

                  </div>


                  {/* Price */}
                  <p className="mt-4 text-2xl font-bold text-green-700">
                    {crop.price}
                  </p>


                  {/* Quantity */}
                  <div className="mt-3 flex items-center justify-between text-sm">

                    <span className="text-gray-500">
                      Available
                    </span>

                    <span className="font-semibold text-gray-700">
                      {crop.quantity}
                    </span>

                  </div>


                  {/* Farmer */}
                  <div className="mt-4 pt-4 border-t border-gray-100">

                    <p className="text-sm font-semibold text-gray-800">
                      👨‍🌾 {crop.farmer}
                    </p>

                    <p className="mt-1 text-sm text-gray-500">
                      📍 {crop.location}
                    </p>

                  </div>


                  {/* Buttons */}
                  <div className="mt-5 flex gap-2">

                    <Link
                       to={`/product/${crop.id}`}
                       className="flex-1 px-3 py-2 border border-green-600 text-green-700 rounded-lg font-semibold hover:bg-green-50 transition text-center"
                    >
                       Details
                    </Link>

                    <button
                      className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition"
                    >
                      Buy Now
                    </button>

                  </div>

                </div>

              </div>

            ))}

          </div>

        ) : (

          /* No Results */
          <div className="bg-white rounded-2xl p-12 text-center">

            <div className="text-6xl">
              🔍
            </div>

            <h3 className="mt-4 text-2xl font-bold text-gray-900">
              No crops found
            </h3>

            <p className="mt-2 text-gray-500">
              Try searching for another crop.
            </p>

          </div>

        )}

      </section>


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

export default Marketplace