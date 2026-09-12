import { useEffect, useRef, useState } from 'react'
import { usePipeline, PIPELINE_SCREENS } from '../hooks/usePipeline'
import PipelineScreens from './PipelineScreens'
import LiveStreamScreen from './LiveStreamScreen'
import { captureFrame, readFileAsDataUrl } from '../utils/captureFrame'

export default function FallbackView({ onExit }) {
  const videoRef = useRef(null)
  const [cameraError, setCameraError] = useState(null)
  const pipeline = usePipeline()

  useEffect(() => {
    if (pipeline.screen !== PIPELINE_SCREENS.LIVE) return

    let activeStream
    async function startCamera() {
      try {
        activeStream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (videoRef.current) videoRef.current.srcObject = activeStream
        setCameraError(null)
      } catch {
        setCameraError('Could not access your camera — use "upload a photo instead" below.')
      }
    }
    startCamera()

    return () => {
      activeStream?.getTracks().forEach((track) => track.stop())
    }
  }, [pipeline.screen])

  function handleCapture() {
    if (!videoRef.current) return
    pipeline.runDetection(captureFrame(videoRef.current))
  }

  async function handleUpload(file) {
    const dataUrl = await readFileAsDataUrl(file)
    pipeline.runDetection(dataUrl)
  }

  return (
    <PipelineScreens pipeline={pipeline}>
      <div className="flex flex-col items-center gap-4 w-full">
        <LiveStreamScreen
          videoRef={videoRef}
          onCapture={handleCapture}
          onUpload={handleUpload}
          cameraError={cameraError}
        />
        <button onClick={onExit} className="text-sm text-gray-500 hover:text-white underline underline-offset-4">
          ← Back
        </button>
      </div>
    </PipelineScreens>
  )
}
