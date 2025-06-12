import Effects from "@/components/effects/effects";
import Lights from "./lights";
import UnderwaterAmbient from "./underwater-ambient";
import UnderwaterCaustics from "./underwater-caustics";
import Seafloor from "./seafloor";
// import BoundaryCausticsWalls from "./boundary";
import { isDevelopment } from "@/constants/env";

function Environment() {
  return (
    <>
      {!isDevelopment && <Effects />}
      <UnderwaterAmbient />
      <UnderwaterCaustics />
      {/* <BoundaryCausticsWalls /> */}
      <Lights />
      <Seafloor />
    </>
  );
}

export default Environment;
