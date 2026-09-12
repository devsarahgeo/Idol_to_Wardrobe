import { useEffect, useRef, useState } from 'react'
import { getVonageSession } from '../api'

function describeError(err) {
  const isInsecureOrigin = typeof window !== 'undefined' && !window.isSecureContext
  if (err.name === 'OT_USER_MEDIA_ACCESS_DENIED' || err.message?.includes('getUserMedia')) {
    if (isInsecureOrigin) {
      return 'Camera/mic access was blocked because this page isn\'t loaded over HTTPS (or localhost). ' +
        'Open it via https:// — e.g. https://<your-lan-ip>:5173 — and accept the self-signed cert warning, then reload.'
    }
    return 'Camera/mic access was denied. Click the camera icon in the address bar, allow access, then reload the page.'
  }
  return err.message
}

export default function BroadcasterView({ onExit }) {
  const containerRef = useRef(null)
  const sessionRef = useRef(null)
  const [status, setStatus] = useState('connecting') // connecting | live | error
  const [errorMsg, setErrorMsg] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function connect() {
      try {
        if (!window.OT) throw new Error('Vonage client SDK (opentok.js) failed to load.')

        const { applicationId, sessionId, token } = await getVonageSession('broadcaster')
        const session = window.OT.initSession(applicationId, sessionId)
        sessionRef.current = session

        const publisher = window.OT.initPublisher(
          containerRef.current,
          { insertMode: 'append', width: '100%', height: '100%' },
          (err) => {
            if (err && !cancelled) {
              setErrorMsg(describeError(err))
              setStatus('error')
            }
          }
        )

        session.connect(token, (err) => {
          if (cancelled) return
          if (err) {
            setErrorMsg(describeError(err))
            setStatus('error')
            return
          }
          session.publish(publisher, (pubErr) => {
            if (cancelled) return
            if (pubErr) {
              setErrorMsg(describeError(pubErr))
              setStatus('error')
            } else {
              setStatus('live')
            }
          })
        })
      } catch (err) {
        if (!cancelled) {
          setErrorMsg(describeError(err))
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

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div
        ref={containerRef}
        className="relative w-full max-w-3xl mx-auto rounded-2xl overflow-hidden bg-black aspect-video shadow-2xl border border-gray-800"
      >
        {status === 'connecting' && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
            Connecting to Vonage…
          </div>
        )}
        {status === 'live' && (
          <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/60 backdrop-blur px-3 py-1 rounded-full text-sm font-semibold">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" /> BROADCASTING
          </div>
        )}
        {status === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/85 text-red-300 text-sm text-center p-6">
            {errorMsg}
          </div>
        )}
      </div>
      <p className="text-gray-400 text-sm text-center max-w-sm">
        Have the viewer open this app in another tab/device and pick "Join as Viewer."
      </p>
      <button onClick={onExit} className="text-sm text-gray-500 hover:text-white underline underline-offset-4">
        ← Back
      </button>
    </div>
  )
}
