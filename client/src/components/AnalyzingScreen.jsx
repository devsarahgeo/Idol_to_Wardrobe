export default function AnalyzingScreen({ frame }) {
  return (
    <div className="relative w-full max-w-3xl mx-auto rounded-2xl overflow-hidden bg-black aspect-video shadow-2xl border border-gray-800">
      {frame && (
        <img src={frame} className="w-full h-full object-cover opacity-40" alt="Captured frame" />
      )}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/40">
        <div className="w-14 h-14 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        <p className="text-lg font-medium tracking-wide animate-pulse">Analyzing the look...</p>
      </div>
    </div>
  )
}
