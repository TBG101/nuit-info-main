import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { astronautPath, maxY, minY } from "./constValues";
import { MathUtils } from "three";
import { isInBetween } from "./utils";

let astronautVelocity = 0;

export async function loadAstronaut(scene, customLoader) {
  return new Promise((resolve, reject) => {
    // Use provided loader or create a new one
    const loader = customLoader || new GLTFLoader();
    loader.load(
      astronautPath,
      (gltf) => {
        const astronaut = gltf.scene;
        astronaut.position.set(0, -5, 0);
        astronaut.scale.set(1, 1, 1);

        // Ensure textures update properly
        astronaut.traverse((child) => {
          if (child.isMesh) {
            child.material.needsUpdate = true;
          }
        });
        scene.add(astronaut);
        resolve({ astronaut, animations: gltf.animations });
      },
      () => { },
      (error) => reject(error)
    );
  });
}

export function moveAstronaut(astronaut, camera, targetPosition) {
  if (astronaut.position === targetPosition) return;
  astronautVelocity += (targetPosition.y - astronaut.position.y) / 100;
  astronautVelocity = MathUtils.clamp(astronautVelocity, -0.15, 0.15);
}

export function updateAstronaut(astronaut, camera, state, deltaTime) {
  if (astronautVelocity < 0.0005 && astronautVelocity > -0.0005) {
    astronautVelocity = 0;
    return;
  }
  const delta = deltaTime * 0.05;

  if (
    state.currentFocus == -2 ||
    state.currentFocus > -1 ||
    state.canMove == false ||
    state.contactShown ||
    !isInBetween(astronaut.position.y, minY, maxY)
  ) {
    astronautVelocity *= 0.9;
    astronaut.position.y += astronautVelocity;
  } else astronaut.position.y += astronautVelocity;
  // check if the astronaut is in focus to not mess up the camera smooth movement
  if (state.currentFocus == -1) camera.position.y = astronaut.position.y + 2;

  if (astronautVelocity > 0) {
    if (astronautVelocity - delta <= 0) {
      astronautVelocity = 0;
    } else {
      astronautVelocity -= delta;
    }
  } else if (astronautVelocity < 0) {
    if (astronautVelocity + delta >= 0) {
      astronautVelocity = 0;
    } else {
      astronautVelocity += delta;
    }
  }
}

export function getAstronautVelocity() {
  astronautVelocity;
}
export function setAstronautVelocity(value) {
  astronautVelocity = value;
}
