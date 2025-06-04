import {
  EffectComposer,
  Bloom,
  Vignette,
  Noise,
  ChromaticAberration,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";

function Effects() {
  return (
    <EffectComposer>
      <Bloom
        luminanceThreshold={0.2}
        luminanceSmoothing={0.1}
        intensity={0.5}
      />
      <Vignette eskil={false} offset={0.1} darkness={0.8} />
      <Noise opacity={0.04} />
      <ChromaticAberration
        offset={[0.001, 0.001]}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  );
}

export default Effects;
