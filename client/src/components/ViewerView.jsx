import { useEffect, useRef, useState } from 'react'
import { getVonageSession } from '../api'
import { usePipeline, PIPELINE_SCREENS } from '../hooks/usePipeline'
import PipelineScreens from './PipelineScreens'

export default function ViewerView({ onExit }) {
  const containerRef = useRef(null)
  const sessionRef = useRef(null)
  const subscriberRef = useRef(null)
  const [status, setStatus] = useState('connecting') // connecting | waiting | live | error
  const [errorMsg, setErrorMsg] = useState(null)
  const pipeline = usePipeline()

  useEffect(() => {
    let cancelled = false

    async function connect() {
      try {
        if (!window.OT) throw new Error('Vonage client SDK (opentok.js) failed to load.')

        const { applicationId, sessionId, token } = await getVonageSession('viewer')
        const session = window.OT.initSession(applicationId, sessionId)
        sessionRef.current = session

        session.on('streamCreated', (event) => {
          const subscriber = session.subscribe(
            event.stream,
            containerRef.current,
            { insertMode: 'append', width: '100%', height: '100%' },
            (err) => {
              if (cancelled) return
              if (err) {
                setErrorMsg(err.message)
                setStatus('error')
              } else {
                subscriberRef.current = subscriber
                setStatus('live')
              }
            }
          )
        })

        session.on('streamDestroyed', () => {
          if (!cancelled) {
            subscriberRef.current = null
            setStatus('waiting')
          }
        })

        session.connect(token, (err) => {
          if (cancelled) return
          if (err) {
            setErrorMsg(err.message)
            setStatus('error')
          } else {
            setStatus('waiting')
          }
        })
      } catch (err) {
        if (!cancelled) {
          setErrorMsg(err.message)
          setStatus('error')
        }
      }
    }

    connect()

    return () => {
      cancelled = true
      sessionRef.current?.disconnect()
    }
  }, [])

  function handleCapture() {
    const subscriber = subscriberRef.current
    if (!subscriber) return
    const imgData = subscriber.getImgData()
    if (!imgData) {
      pipeline.reset()
      return
    }
    pipeline.runDetection(`data:image/png;base64,${imgData}`)
  }

  return (
    <PipelineScreens pipeline={pipeline}>
      <div className="flex flex-col items-center gap-4 w-full">
        <div
          ref={containerRef}
          className="relative w-full max-w-3xl mx-auto rounded-2xl overflow-hidden bg-black aspect-video shadow-2xl border border-gray-800"
        >
          {status !== 'live' && (
            <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm text-center p-6">
              {status === 'connecting' && 'Connecting to Vonage…'}
              {status === 'waiting' && 'Waiting for the broadcaster to join…'}
              {status === 'error' && errorMsg}
            </div>
          )}
          {status === 'live' && (
            <>
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-sm font-semibold">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> LIVE
              </div>
              <button
                onClick={handleCapture}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-accent hover:bg-accent/90 text-black font-bold px-6 py-3 rounded-full shadow-lg shadow-accent/30 transition-transform active:scale-95"
              >
                ✨ Recreate This Look
              </button>
            </>
          )}
        </div>
        <button onClick={onExit} className="text-sm text-gray-500 hover:text-white underline underline-offset-4">
          ← Back
        </button>
      </div>
    </PipelineScreens>
  )
}
