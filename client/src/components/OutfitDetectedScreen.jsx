import { categoryIcon } from '../constants'

export default function OutfitDetectedScreen({ items, onContinue }) {
  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6 animate-[fadein_0.4s_ease]">
      <h2 className="text-2xl font-bold text-center">Outfit Detected</h2>

      {items.length === 0 ? (
        <p className="text-center text-gray-400">
          No clothing items were confidently detected in that frame. Try again with a clearer shot.
        </p>
      ) : (
        <div className="grid gap-3">
          {items.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-xl p-4"
            >
              <span className="text-3xl shrink-0">{categoryIcon(item.category)}</span>
              <div className="flex-1 min-w-0">
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-gray-400">
                  {[item.color, item.material, item.silhouette, item.pattern].filter(Boolean).join(' · ')}
                </p>
                {item.style_tags?.length > 0 && (
                  <p className="text-xs text-accent mt-1">{item.style_tags.join(' · ')}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={onContinue}
        disabled={items.length === 0}
        className="self-center bg-accent disabled:opacity-40 text-black font-bold px-8 py-3 rounded-full hover:bg-accent/90 transition"
      >
        Match My Closet →
      </button>
    </div>
  )
}
