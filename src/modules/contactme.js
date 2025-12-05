import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { degToRad } from "three/src/math/MathUtils.js";

let becaonBasePosition = new THREE.Vector3(0, 0, 0);
/**
 * @param {any} scene
 * @param {THREE.Vector3} beaconPosition
 */
export async function createBeacon(scene, beaconPosition, customLoader) {
  const beacon = await new Promise((resolve, reject) => {
    // Use provided loader or create a new one
    const loader = customLoader || new GLTFLoader();
    loader.load(
      "./models/alien_beacon.glb",
      (gltf) => {
        const beacon = gltf.scene;

        beacon.position.copy(beaconPosition);
        beacon.scale.setScalar(1.5);
        scene.add(beacon);
        becaonBasePosition = new THREE.Vector3().copy(beaconPosition);

        resolve(beacon);
      },
      undefined,
      (error) => {
        console.error("An error happened", error);
        reject(error);
      }
    );
  });
  return beacon;
}

export async function moveBeacon(beacon, currentTime) {
  beacon.position.y = Math.sin(currentTime) * 0.2 + becaonBasePosition.y;
  beacon.position.x = Math.cos(currentTime) * 0.4 + becaonBasePosition.x;
  beacon.position.z = Math.sin(currentTime) * 0.8 + becaonBasePosition.z;

  const z = Math.sin(currentTime * 0.5 + 40) * 10 - 5;
  const y = Math.cos(currentTime * 0.5) * 2.5;
  const x = Math.sin(currentTime * 0.5) * 5;

  beacon.rotation.z = degToRad(z);
  beacon.rotation.y = degToRad(y);
  beacon.rotation.x = degToRad(x);
}
