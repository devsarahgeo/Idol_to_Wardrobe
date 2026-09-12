import react from '@vitejs/plugin-react'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // basicSsl + host:true let the broadcaster/viewer be opened from a second
  // device on the LAN over https:// — Chrome refuses getUserMedia on any
  // origin that isn't localhost or https, which otherwise surfaces as
  // "NotAllowedError" from OT.initPublisher.
  plugins: [react(), basicSsl()],
  server: {
    https: true,
    host: true,
  },
})
