import { useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { type GLTF } from "three-stdlib";
import { useRef } from "react";

const MODEL_PATH = "/models/lobster.glb";

type TLobster = GLTF & {
  nodes: {
    finRight?: THREE.Mesh;
    finLeft?: THREE.Mesh;
    body?: THREE.Mesh;
    mustacheLeft?: THREE.Mesh;
    mustacheRight?: THREE.Mesh;
    [key: string]: any;
  };
};

useGLTF.preload(MODEL_PATH);

function Lobster() {
  const lobsterGltf = useGLTF(MODEL_PATH) as GLTF;

  return <div>Lobster</div>;
}

export default Lobster;
