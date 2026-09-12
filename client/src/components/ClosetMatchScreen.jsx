import { categoryIcon } from '../constants'

function ClosetThumb({ item }) {
  if (item.closetMatch?.image_url) {
    return (
      <img
        src={item.closetMatch.image_url}
        alt={item.closetMatch.name}
        className="w-12 h-12 rounded-lg object-cover shrink-0 border border-gray-800"
      />
    )
  }
  return (
    <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center text-xl shrink-0">
      {categoryIcon(item.detected.category)}
    </div>
  )
}

export default function ClosetMatchScreen({ result, onShop, onRecreate }) {
  const matchedCount = result.items.length - result.missingCount
  const hasPartialMatch = matchedCount > 0 && result.missingCount > 0
  const hasFullMatch = result.missingCount === 0

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-8 items-center">
      <div className="text-center">
        <p className="uppercase tracking-widest text-gray-400 text-sm mb-1">Your Look</p>
        <p className="text-7xl font-black text-accent leading-none">{result.overallMatch}%</p>
        <p className="text-xl font-semibold mt-2 tracking-wide">MATCH</p>
      </div>

      <div className="w-full flex flex-col gap-3">
        {result.items.map((item, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <ClosetThumb item={item} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium truncate">{item.detected.name}</span>
                  <span className={`font-bold shrink-0 ${item.missing ? 'text-red-400' : 'text-green-400'}`}>
                    {item.score}%
                  </span>
                </div>
                {item.closetMatch ? (
                  <p className="text-xs text-gray-500">Matched: {item.closetMatch.name}</p>
                ) : (
                  <p className="text-xs text-red-400">No close match in your closet</p>
                )}
              </div>
            </div>
            <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${
                  item.missing ? 'bg-red-500' : 'bg-accent'
                }`}
                style={{ width: `${item.score}%` }}
              />
            </div>
            {item.reasoning && <p className="text-xs text-gray-600 italic mt-1">"{item.reasoning}"</p>}
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center gap-3">
        {hasFullMatch && <p className="text-green-400 font-semibold text-lg">You already own the full look! 🎉</p>}

        <div className="flex gap-3 flex-wrap justify-center">
          {(hasPartialMatch || hasFullMatch) && (
            <button
              onClick={onRecreate}
              className="bg-gray-800 border border-gray-700 font-bold px-6 py-3 rounded-full hover:bg-gray-700 transition"
            >
              👗 Recreate with What I Have
            </button>
          )}
          {result.missingCount > 0 && (
            <button
              onClick={onShop}
              className="bg-accent text-black font-bold px-6 py-3 rounded-full hover:bg-accent/90 transition"
            >
              Missing {result.missingCount} piece{result.missingCount > 1 ? 's' : ''} — Shop the Gap →
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
