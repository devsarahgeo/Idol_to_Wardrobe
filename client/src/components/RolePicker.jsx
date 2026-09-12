export default function RolePicker({ onPick }) {
  return (
    <div className="flex flex-col items-center gap-8">
      <p className="text-gray-400 text-center max-w-sm">
        Start a real 2-person Vonage video call, or skip straight to the demo pipeline.
      </p>

      <div className="flex gap-4 flex-wrap justify-center">
        <button
          onClick={() => onPick('broadcaster')}
          className="bg-accent text-black font-bold px-6 py-4 rounded-2xl hover:bg-accent/90 transition w-56"
        >
          🎥 Start as Broadcaster
        </button>
        <button
          onClick={() => onPick('viewer')}
          className="bg-gray-800 border border-gray-700 font-bold px-6 py-4 rounded-2xl hover:bg-gray-700 transition w-56"
        >
          📺 Join as Viewer
        </button>
      </div>

      <button
        onClick={() => onPick('fallback')}
        className="text-sm text-gray-500 hover:text-accent underline underline-offset-4 transition"
      >
        Skip Vonage — use fallback demo mode
      </button>
    </div>
  )
}
