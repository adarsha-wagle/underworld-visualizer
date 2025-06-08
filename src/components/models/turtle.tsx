// import { useGLTF } from "@react-three/drei";
// import { useFrame } from "@react-three/fiber";
// import * as THREE from "three";
// import { type GLTF } from "three-stdlib";
// import { useRef, useEffect } from "react";

// type TTurtleGLTF = GLTF & {
//   nodes: {
//     body?: THREE.Mesh;
//     [key: string]: any;
//   };
//   materials: {
//     [key: string]: THREE.Material;
//   };
// };

// const MODEL_PATH = "/models/turtle.glb";

// useGLTF.preload(MODEL_PATH);

// function Turtle() {
//   const groupRef = useRef<THREE.Group>(null);
//   const turtleGltf = useGLTF(MODEL_PATH) as TTurtleGLTF;

//   return (
//     <group ref={groupRef} position={[0, 0, 80]}>
//       <primitive object={turtleGltf.scene} />
//     </group>
//   );
// }

// export default Turtle;
