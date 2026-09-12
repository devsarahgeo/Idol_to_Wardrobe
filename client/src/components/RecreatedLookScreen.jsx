import { categoryIcon } from '../constants'

export default function RecreatedLookScreen({ result, onRestart }) {
  const owned = result.items.filter((item) => !item.missing && item.closetMatch)
  const skipped = result.items.filter((item) => item.missing)

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-8 items-center">
      <div className="text-center">
        <p className="uppercase tracking-widest text-gray-400 text-sm mb-1">Your Recreated Look</p>
        <p className="text-2xl font-bold">Using what's already in your closet</p>
      </div>

      <div className="w-full grid grid-cols-2 sm:grid-cols-3 gap-4">
        {owned.map((item, i) => (
          <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden flex flex-col">
            {item.closetMatch.image_url ? (
              <img
                src={item.closetMatch.image_url}
                alt={item.closetMatch.name}
                className="aspect-square object-cover w-full"
              />
            ) : (
              <div className="aspect-square bg-gray-800 flex items-center justify-center text-4xl">
                {categoryIcon(item.detected.category)}
              </div>
            )}
            <div className="p-3">
              <p className="font-medium text-sm leading-tight">{item.closetMatch.name}</p>
              <p className="text-accent text-xs font-bold mt-1">{item.score}% match</p>
            </div>
          </div>
        ))}
      </div>

      {skipped.length > 0 && (
        <p className="text-gray-500 text-sm text-center max-w-md">
          Skipped {skipped.length} piece{skipped.length > 1 ? 's' : ''} you don't own yet:{' '}
          {skipped.map((item) => item.detected.name).join(', ')}
        </p>
      )}

      <button
        onClick={onRestart}
        className="text-gray-400 hover:text-white transition underline underline-offset-4"
      >
        ↺ Start Over
      </button>
    </div>
  )
}
