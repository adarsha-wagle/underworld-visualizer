import Bubbles from "../bubbles/bubbles";
import Corals from "../corals/corals";
import KelpForest from "../kelp-forest/kelp-forest";
import SpawnAnemoneCorals from "../models/static/spawn-anemone-corals";
import SpawnSmallCorals from "../models/static/spawn-small-corals";
import SpawnRedCorals from "../models/static/spawn-red-corals";
import SpawnLobsters from "../models/lobster/spawn-lobsters";
import SpawnDolphins from "../models/dolphin/spawn-dolphins";
import SpawnSeahorses from "../models/sea-horse/spawn-seahorses";
import SpawnMantarays from "../models/manta-ray/spawn-manta-rays";
import Ship from "../models/static/ship";
import SpawnGoldfishes from "../models/gold-fish/spawn-goldfishes";
import SpawnSharks from "../models/shark/spawn-sharks";
import SpawnWhales from "../models/whale/spawn-whales";

function Obstacles() {
  return (
    <>
      <Ship />
      <KelpForest />
      <Corals />
      <Bubbles />
      <SpawnRedCorals />
      <SpawnAnemoneCorals />
      <SpawnSmallCorals />

      {/* Dynamic Models */}
      <SpawnDolphins />
      <SpawnSharks />
      <SpawnSeahorses />
      <SpawnMantarays />
      <SpawnWhales />
      <SpawnLobsters />
      <SpawnGoldfishes />
    </>
  );
}

export default Obstacles;
