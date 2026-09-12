import { useState } from 'react'
import { detectLook, matchCloset, shopAlternatives } from '../api'

export const PIPELINE_SCREENS = {
  LIVE: 'live',
  ANALYZING: 'analyzing',
  DETECTED: 'detected',
  MATCH: 'match',
  SHOP: 'shop',
  RECREATE: 'recreate',
}

export function usePipeline() {
  const [screen, setScreen] = useState(PIPELINE_SCREENS.LIVE)
  const [frame, setFrame] = useState(null)
  const [outfit, setOutfit] = useState(null)
  const [matchResult, setMatchResult] = useState(null)
  const [shopResults, setShopResults] = useState([])
  const [error, setError] = useState(null)

  async function runDetection(imageDataUrl) {
    setFrame(imageDataUrl)
    setScreen(PIPELINE_SCREENS.ANALYZING)
    setError(null)
    try {
      const result = await detectLook(imageDataUrl)
      setOutfit(result.items)
      setScreen(PIPELINE_SCREENS.DETECTED)
    } catch (err) {
      setError(err.message)
      setScreen(PIPELINE_SCREENS.LIVE)
    }
  }

  async function handleMatch() {
    setError(null)
    try {
      const result = await matchCloset(outfit)
      setMatchResult(result)
      setScreen(PIPELINE_SCREENS.MATCH)
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleShop() {
    setError(null)
    const missingItems = matchResult.items.filter((item) => item.missing)
    try {
      const results = await Promise.all(
        missingItems.map((item) =>
          shopAlternatives({
            category: item.detected.category,
            color: item.detected.color,
            material: item.detected.material,
          })
        )
      )
      setShopResults(results)
      setScreen(PIPELINE_SCREENS.SHOP)
    } catch (err) {
      setError(err.message)
    }
  }

  function handleRecreate() {
    setScreen(PIPELINE_SCREENS.RECREATE)
  }

  function reset() {
    setFrame(null)
    setOutfit(null)
    setMatchResult(null)
    setShopResults([])
    setError(null)
    setScreen(PIPELINE_SCREENS.LIVE)
  }

  return {
    screen,
    frame,
    outfit,
    matchResult,
    shopResults,
    error,
    runDetection,
    handleMatch,
    handleShop,
    handleRecreate,
    reset,
  }
}
