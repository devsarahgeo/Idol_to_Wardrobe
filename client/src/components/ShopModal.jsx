const RETAILERS = ['Zara', 'ASOS', 'Nordstrom', 'Revolve', 'H&M', 'Mango']

function hashSeed(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) hash = (hash * 31 + str.charCodeAt(i)) >>> 0
  return hash
}

function buildListings(product) {
  const seed = hashSeed(product.name)
  return [0, 1, 2].map((i) => {
    const retailer = RETAILERS[(seed + i * 7) % RETAILERS.length]
    const priceDelta = ((seed + i * 13) % 21) - 10
    const simDelta = ((seed + i * 5) % 9) - 4
    return {
      retailer,
      price: Math.max(9, product.price + priceDelta),
      similarity: Math.max(50, Math.min(99, product.similarity + simDelta)),
    }
  })
}

export default function ShopModal({ product, category, icon, onClose }) {
  if (!product) return null
  const listings = buildListings(product)

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6 z-50"
      onClick={onClose}
    >
      <div
        className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full p-6 flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-gray-500 uppercase tracking-wide">Found online</p>
            <h3 className="text-lg font-bold leading-tight">{product.name}</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white text-xl leading-none">
            ×
          </button>
        </div>

        <div className="flex flex-col gap-3">
          {listings.map((listing, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-gray-950 border border-gray-800 rounded-xl p-3"
            >
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-2xl shrink-0">
                {icon}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{product.name}</p>
                <p className="text-xs text-gray-500">{listing.retailer}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-accent font-bold text-sm">{listing.similarity}%</p>
                <p className="text-gray-400 text-xs">${listing.price}</p>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="bg-accent text-black font-bold py-2 rounded-full hover:bg-accent/90 transition"
        >
          Close
        </button>
      </div>
    </div>
  )
}
