import { Link, useParams, useNavigate } from 'react-router-dom'

const products = {
  1: {
    name: 'Rice',
    emoji: '🌾',
    price: '₹45 / kg',
    quantity: '500 kg',
    farmer: 'Ramesh Kumar',
    location: 'Ranchi, Jharkhand',
    category: 'Grains',
    description:
      'Fresh quality rice directly supplied by the farmer. Suitable for household and bulk requirements.',
  },
  2: {
    name: 'Wheat',
    emoji: '🌾',
    price: '₹32 / kg',
    quantity: '800 kg',
    farmer: 'Suresh Kumar',
    location: 'Hazaribagh, Jharkhand',
    category: 'Grains',
    description:
      'Good quality wheat harvested from the farm and available for direct purchase.',
  },
  3: {
    name: 'Potato',
    emoji: '🥔',
    price: '₹28 / kg',
    quantity: '1000 kg',
    farmer: 'Mohan Singh',
    location: 'Jamshedpur, Jharkhand',
    category: 'Vegetables',
    description:
      'Fresh farm potatoes available for household and bulk buyers.',
  },
  4: {
    name: 'Tomato',
    emoji: '🍅',
    price: '₹35 / kg',
    quantity: '400 kg',
    farmer: 'Amit Kumar',
    location: 'Ranchi, Jharkhand',
    category: 'Vegetables',
    description:
      'Fresh tomatoes directly from the farm with good quality and freshness.',
  },
}

function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()

  const product = products[id]

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">

        <div className="max-w-4xl mx-auto px-6 py-20 text-center">

          <div className="text-7xl">
            🔍
          </div>

          <h1 className="mt-6 text-3xl font-bold text-gray-900">
            Product Not Found
          </h1>

          <p className="mt-3 text-gray-500">
            The product you are looking for does not exist.
          </p>

          <Link
            to="/marketplace"
            className="inline-block mt-6 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
          >
            Back to Marketplace
          </Link>

        </div>

      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ================= PRODUCT DETAILS ================= */}
      <section className="max-w-7xl mx-auto px-6 py-12">

        {/* Back Button */}
        <Link
          to="/marketplace"
          className="inline-flex items-center text-green-700 font-semibold hover:text-green-800"
        >
          ← Back to Marketplace
        </Link>


        <div className="mt-8 grid md:grid-cols-2 gap-10">

          {/* ================= PRODUCT IMAGE ================= */}
          <div className="bg-white rounded-3xl shadow-sm p-8">

            <div className="h-[450px] rounded-2xl bg-green-50 flex items-center justify-center">

              <span className="text-[150px]">
                {product.emoji}
              </span>

            </div>

          </div>


          {/* ================= PRODUCT INFORMATION ================= */}
          <div className="bg-white rounded-3xl shadow-sm p-8">

            <div className="flex items-center justify-between">

              <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-semibold">
                {product.category}
              </span>

              <span className="text-green-600 text-sm font-semibold">
                ✓ Available
              </span>

            </div>


            <h1 className="mt-5 text-4xl font-bold text-gray-900">
              {product.name}
            </h1>


            <p className="mt-4 text-3xl font-bold text-green-700">
              {product.price}
            </p>


            {/* Quantity */}
            <div className="mt-8 p-5 rounded-xl bg-gray-50">

              <p className="text-sm text-gray-500">
                Available Quantity
              </p>

              <p className="mt-1 text-xl font-bold text-gray-900">
                {product.quantity}
              </p>

            </div>


            {/* Farmer Information */}
            <div className="mt-6">

              <h2 className="text-lg font-bold text-gray-900">
                Farmer Information
              </h2>

              <div className="mt-4 space-y-3">

                <p className="text-gray-700">
                  👨‍🌾 <span className="font-semibold">
                    {product.farmer}
                  </span>
                </p>

                <p className="text-gray-600">
                  📍 {product.location}
                </p>

              </div>

            </div>


            {/* Description */}
            <div className="mt-6">

              <h2 className="text-lg font-bold text-gray-900">
                About This Product
              </h2>

              <p className="mt-2 text-gray-600 leading-relaxed">
                {product.description}
              </p>

            </div>


            {/* Quantity Selector */}
            <div className="mt-8">

              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Quantity
              </label>

              <div className="flex items-center gap-3">

                <button className="w-10 h-10 border border-gray-300 rounded-lg text-xl">
                  −
                </button>

                <div className="w-20 h-10 border border-gray-300 rounded-lg flex items-center justify-center font-semibold">
                  1 kg
                </div>

                <button className="w-10 h-10 border border-gray-300 rounded-lg text-xl">
                  +
                </button>

              </div>

            </div>


            {/* Action Buttons */}
            <div className="mt-8 grid sm:grid-cols-2 gap-4">

            <button
  onClick={() => {
    const existingCart =
      JSON.parse(localStorage.getItem('cart')) || []

    const existingProduct = existingCart.find(
      (item) => item.id === product.id
    )

    let updatedCart

    if (existingProduct) {
      updatedCart = existingCart.map((item) =>
        item.id === product.id
          ? {
              ...item,
              quantity: item.quantity + 1,
            }
          : item
      )
    } else {
      updatedCart = [
        ...existingCart,
        {
          ...product,
          id: Number(id),
          price: Number(product.price.replace('₹', '').replace(' / kg', '')),
          quantity: 1,
        },
      ]
    }

    localStorage.setItem('cart', JSON.stringify(updatedCart))

    navigate('/cart')
  }}
  className="px-6 py-3 border border-green-600 text-green-700 rounded-lg font-semibold hover:bg-green-50 transition"
>
  Add to Cart
</button>



              <button className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition">
                Buy Now
              </button>

            </div>

          </div>

        </div>

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

export default ProductDetails