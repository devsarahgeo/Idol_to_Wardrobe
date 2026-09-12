import { useState } from 'react'
import { categoryIcon } from '../constants'
import ShopModal from './ShopModal'

export default function MissingItemScreen({ shopResults, onRestart }) {
  const [activeShop, setActiveShop] = useState(null) // { product, category }

  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col gap-8">
      <h2 className="text-2xl font-bold text-center">Shop the Gap</h2>

      {shopResults.map(({ category, results }) => (
        <div key={category} className="flex flex-col gap-3">
          <p className="text-gray-400 text-sm uppercase tracking-wide">
            {categoryIcon(category)} Missing: {category}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {results.map((product, i) => (
              <div
                key={i}
                className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col"
              >
                <div className="aspect-square bg-gradient-to-br from-gray-800 to-gray-950 flex items-center justify-center text-5xl">
                  {categoryIcon(category)}
                </div>
                <div className="p-3 flex flex-col gap-1 flex-1">
                  <p className="font-medium text-sm leading-tight">{product.name}</p>
                  <p className="text-accent font-bold">{product.similarity}% match</p>
                  <p className="text-gray-400 text-sm">${product.price}</p>
                  <button
                    onClick={() => setActiveShop({ product, category })}
                    className="mt-auto bg-accent text-black text-center font-semibold text-sm py-2 rounded-full hover:bg-accent/90 transition"
                  >
                    SHOP
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <button
        onClick={onRestart}
        className="self-center text-gray-400 hover:text-white transition underline underline-offset-4"
      >
        ↺ Start Over
      </button>

      <ShopModal
        product={activeShop?.product}
        category={activeShop?.category}
        icon={activeShop ? categoryIcon(activeShop.category) : null}
        onClose={() => setActiveShop(null)}
      />
    </div>
  )
}
