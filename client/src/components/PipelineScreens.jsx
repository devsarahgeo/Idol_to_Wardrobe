import { PIPELINE_SCREENS } from '../hooks/usePipeline'
import AnalyzingScreen from './AnalyzingScreen'
import OutfitDetectedScreen from './OutfitDetectedScreen'
import ClosetMatchScreen from './ClosetMatchScreen'
import MissingItemScreen from './MissingItemScreen'
import RecreatedLookScreen from './RecreatedLookScreen'

export default function PipelineScreens({ pipeline, children }) {
  return (
    <>
      {pipeline.screen === PIPELINE_SCREENS.LIVE && children}
      {pipeline.screen === PIPELINE_SCREENS.ANALYZING && <AnalyzingScreen frame={pipeline.frame} />}
      {pipeline.screen === PIPELINE_SCREENS.DETECTED && pipeline.outfit && (
        <OutfitDetectedScreen items={pipeline.outfit} onContinue={pipeline.handleMatch} />
      )}
      {pipeline.screen === PIPELINE_SCREENS.MATCH && pipeline.matchResult && (
        <ClosetMatchScreen
          result={pipeline.matchResult}
          onShop={pipeline.handleShop}
          onRecreate={pipeline.handleRecreate}
        />
      )}
      {pipeline.screen === PIPELINE_SCREENS.SHOP && (
        <MissingItemScreen shopResults={pipeline.shopResults} onRestart={pipeline.reset} />
      )}
      {pipeline.screen === PIPELINE_SCREENS.RECREATE && pipeline.matchResult && (
        <RecreatedLookScreen result={pipeline.matchResult} onRestart={pipeline.reset} />
      )}
    </>
  )
}
