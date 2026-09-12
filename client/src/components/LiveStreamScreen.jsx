import { useRef } from 'react'

export default function LiveStreamScreen({ videoRef, onCapture, onUpload, cameraError }) {
  const fileInputRef = useRef(null)

  function handleFileChange(e) {
    const file = e.target.files?.[0]
    if (file) onUpload(file)
    e.target.value = ''
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="relative w-full max-w-3xl mx-auto rounded-2xl overflow-hidden bg-black aspect-video shadow-2xl shadow-black/50 border border-gray-800">
        <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" />

        <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-sm font-semibold tracking-wide">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          LIVE — Idol Performance
        </div>

        {cameraError && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/85 text-center p-6 text-gray-300 text-sm">
            {cameraError}
          </div>
        )}

        <button
          onClick={onCapture}
          disabled={Boolean(cameraError)}
          className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-accent hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed text-black font-bold px-6 py-3 rounded-full shadow-lg shadow-accent/30 transition-transform active:scale-95"
        >
          ✨ Recreate This Look
        </button>
      </div>

      <button
        onClick={() => fileInputRef.current?.click()}
        className="text-sm text-gray-400 hover:text-accent underline underline-offset-4 transition"
      >
        or upload a photo instead
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  )
}
