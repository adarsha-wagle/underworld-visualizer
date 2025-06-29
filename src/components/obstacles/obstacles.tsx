import Bubbles from "../bubbles/bubbles";
import Corals from "../corals/corals";
import KelpForest from "../kelp-forest/kelp-forest";
import SpawnAnemoneCorals from "../models/static/spawn-anemone-corals";
import SpawnSmallCorals from "../models/static/spawn-small-corals";
import SpawnRedCorals from "../models/static/spawn-red-corals";
import SpawnSeaCorals from "../models/static/spawn-sea-corals";
// import SpawnSeaHorses from "../models/sea-horse/spawn-seahorse";
import SpawnWhales from "../models/whale/spawn-whales";
import SpawnSharks from "../models/shark/spawn-sharks";
import SpawnLobsters from "../models/lobster/spawn-lobsters";
import SpawnDolphins from "../models/dolphin/spawn-dolphins";
import SpawnSharksAnim from "../models/shark/s-shark";
import SpawnSeahorses from "../models/sea-horse/spawn-seahorses";
import SpawnMantarays from "../models/manta-ray/spawn-manta-rays";
import Ship from "../models/static/ship";
import SpawnWhalesAnim from "../models/whale/spawn-whales-anim";
import SpawnGoldfishAnim from "../models/gold-fish/spawn-goldfishes";
// import SpawnAnglerFish from "../models/angler-fish/spawn-angler-fish";

function Obstacles() {
  return (
    <>
      <Ship />
      {/* <KelpForest />
      <Corals />
      <Bubbles />
      <SpawnRedCorals />
      <SpawnAnemoneCorals />
      <SpawnSeaCorals />      a
      <SpawnSmallCorals />
      <SpawnLobsters />
      <SpawnDolphins /> */}
      {/* <SpawnAnglerFish /> */}
      {/* <SpawnSharks /> */}
      {/* <SpawnSeaHorses /> */}
      {/* <SpawnSharksAnim /> */}
      {/* <SpawnSeahorses /> */}
      {/* <SpawnMantarays /> */}
      {/* <SpawnWhales /> */}
      {/* <SpawnWhalesAnim /> */}
      {/* <SpawnGoldFish /> */}
      <SpawnGoldfishAnim />
    </>
  );
}

export default Obstacles;
