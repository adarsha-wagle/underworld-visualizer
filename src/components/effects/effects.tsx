import { useSettingsContext } from "@/providers.tsx/settings-provider";
import {
  EffectComposer,
  Bloom,
  Vignette,
  Noise,
  ChromaticAberration,
} from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import type { JSX } from "react";

function Effects() {
  const {
    isBloomEnabled,
    isNoiseEnabled,
    isVignetteEnabled,
    chromaticAberration,
  } = useSettingsContext();

  const effects = [
    isBloomEnabled && (
      <Bloom
        key="bloom"
        luminanceThreshold={0.2}
        luminanceSmoothing={0.1}
        intensity={0.5}
      />
    ),
    isVignetteEnabled && (
      <Vignette key="vignette" eskil={false} offset={0.1} darkness={0.8} />
    ),
    isNoiseEnabled && <Noise key="noise" opacity={0.04} />,
    <ChromaticAberration
      key="chromatic"
      offset={[chromaticAberration, chromaticAberration]}
      blendFunction={BlendFunction.NORMAL}
    />,
  ].filter((effect): effect is JSX.Element => Boolean(effect));

  return <EffectComposer>{effects}</EffectComposer>;
}

export default Effects;
