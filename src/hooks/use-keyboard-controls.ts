// useKeyboardControls.ts
import { useEffect, useState } from "react";

type TKeys = {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  shift: boolean;
};

export const useKeyboardControls = () => {
  const [keys, setKeys] = useState<TKeys>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    shift: false,
  });

  const handleKeyDown = (e: KeyboardEvent) => {
    switch (e.code) {
      case "KeyW":
        setKeys((k) => ({ ...k, forward: true }));
        break;
      case "KeyS":
        setKeys((k) => ({ ...k, backward: true }));
        break;
      case "KeyA":
        setKeys((k) => ({ ...k, left: true }));
        break;
      case "KeyD":
        setKeys((k) => ({ ...k, right: true }));
        break;
      case "ShiftLeft":
        setKeys((k) => ({ ...k, shift: true }));
        break;
    }
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    switch (e.code) {
      case "KeyW":
        setKeys((k) => ({ ...k, forward: false }));
        break;
      case "KeyS":
        setKeys((k) => ({ ...k, backward: false }));
        break;
      case "KeyA":
        setKeys((k) => ({ ...k, left: false }));
        break;
      case "KeyD":
        setKeys((k) => ({ ...k, right: false }));
        break;
      case "ShiftLeft":
        setKeys((k) => ({ ...k, shift: false }));
        break;
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return keys;
};
