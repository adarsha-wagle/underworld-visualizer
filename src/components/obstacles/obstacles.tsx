import Bubbles from "../bubbles/bubbles";
import Corals from "../corals/corals";
import KelpForest from "../kelp-forest/kelp-forest";
import AnemoneCorals from "../models/static/anemone-corals";
import SmallCorals from "../models/static/small-corals";
import RedCorals from "../models/static/red-corals";
import SeaCorals from "../models/static/sea-corals";
import SpawnGoldFish from "../models/gold-fish/spawn-goldfish";
import SpawnSeaHorses from "../models/sea-horse/spawn-seahorse";
// import SpawnGoldFish from "../models/gold-fish/spawn-goldfish";

function Obstacles() {
  return (
    <>
      <KelpForest />
      <Corals />
      <Bubbles />
      <RedCorals />
      <AnemoneCorals />
      <SeaCorals />
      <SmallCorals />
      <SpawnGoldFish />
      <SpawnSeaHorses />
    </>
  );
}

export default Obstacles;
