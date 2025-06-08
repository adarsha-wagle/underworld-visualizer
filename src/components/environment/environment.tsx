import Effects from "@/components/effects/effects";
import Lights from "./lights";
import UnderwaterAmbient from "./underwater-ambient";
import UnderwaterCaustics from "./underwater-caustics";
import Seafloor from "./seafloor";

function Environment() {
  return (
    <>
      <Effects />
      <UnderwaterAmbient />
      <UnderwaterCaustics />
      <Lights />
      <Seafloor />
    </>
  );
}

export default Environment;
