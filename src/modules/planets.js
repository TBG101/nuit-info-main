import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { techStack } from "./constValues";
import { isInBetween } from "./utils";

function getFresnelMat({ rimHex = 0x0088ff, facingHex = 0x000000 } = {}) {
  const uniforms = {
    color1: { value: new THREE.Color(rimHex) },
    color2: { value: new THREE.Color(facingHex) },
    fresnelBias: { value: 0.1 },
    fresnelScale: { value: 1.0 },
    fresnelPower: { value: 4.0 },
  };
  const vs = `
  uniform float fresnelBias;
  uniform float fresnelScale;
  uniform float fresnelPower;
  
  varying float vReflectionFactor;
  
  void main() {
    vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
    vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
  
    vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );
  
    vec3 I = worldPosition.xyz - cameraPosition;
  
    vReflectionFactor = fresnelBias + fresnelScale * pow( 1.0 + dot( normalize( I ), worldNormal ), fresnelPower );
  
    gl_Position = projectionMatrix * mvPosition;
  }
  `;
  const fs = `
  uniform vec3 color1;
  uniform vec3 color2;
  
  varying float vReflectionFactor;
  
  void main() {
    float f = clamp( vReflectionFactor, 0.0, 1.0 );
    gl_FragColor = vec4(mix(color2, color1, vec3(f)), f);
  }
  `;
  const fresnelMat = new THREE.ShaderMaterial({
    uniforms: uniforms,
    vertexShader: vs,
    fragmentShader: fs,
    transparent: true,
    blending: THREE.AdditiveBlending,
    // wireframe: true,
  });
  return fresnelMat;
}

export function createDetailedDescription(data, index) {
  const template = document.getElementById("project-template");
  const clone = template.cloneNode(true);
  const projectTitle = clone.children[0].children[0]; // h1
  const projectDescription = clone.children[0].children[1]; // p
  const techStackTitle = clone.children[0].children[2]; // h2
  const techStackList = clone.children[0].children[3]; // ul
  const viewProject = clone.children[0].children[4].children[0]; // a

  projectTitle.textContent = data.name;
  projectDescription.textContent = data.description;
  techStackTitle.textContent = "Tech Stack";
  data.tech.forEach((tech) => {
    const li = document.createElement("li");
    li.textContent = tech;
    techStackList.appendChild(li);
  });

  viewProject.addEventListener("mouseover", () => {
    const audio = new Audio("./sounds/hover.mp3");
    audio.volume = 0.1;
    audio.play();
  });
  if (data.github) viewProject.href = data.github;
  else if (data.customData) {
    data.customData.links.forEach((links) => {
      const buttonContainerClone = viewProject.parentElement.cloneNode(true);
      const buttonClone = buttonContainerClone.children[0];
      buttonClone.href = links.url;
      buttonClone.textContent = links.title;
      clone.children[0].appendChild(buttonContainerClone);
      buttonClone.addEventListener("mouseover", () => {
        const audio = new Audio("./sounds/hover.mp3");
        audio.volume = 0.1;
        audio.play();
      });
    });
    viewProject.parentElement.remove();
  }
  clone.id = data.name;
  if (index % 2 == 1) {
    clone.classList.add("reverse");
  }

  document.body.appendChild(clone);
}

async function createOrbitTech(
  orbitTilt,
  orbitOffset,
  radius = 1,
  scale = 0.05,
  offsetX = 0,
  techPath = "./public/models/techstack/cpp.glb",
  customLoader
) {
  // Use provided loader or create a new one
  const loader = customLoader || new GLTFLoader();
  /**@type {THREE.Object3D<Object3DEventMap>} */
  let techMesh = null;
  await new Promise((resolve, reject) => {
    loader.load(
      techPath,
      (gltf) => {
        techMesh = gltf.scene.children[0];
        resolve();
      },
      () => {},
      (error) => {
        console.error("Error loading tech mesh", error);
        reject();
      }
    );
  });

  techMesh.scale.setScalar(scale);
  techMesh.rotation.x = THREE.MathUtils.degToRad(90);

  const points = [];
  const segments = 64;
  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2;
    points.push(
      new THREE.Vector3(
        Math.cos(angle) * (radius + offsetX),
        0,
        Math.sin(angle) * (radius + offsetX)
      )
    );
  }

  const orbitGeometry = new THREE.BufferGeometry().setFromPoints(points);
  const orbitMaterial = new THREE.LineBasicMaterial({
    color: 0xffffff,
    opacity: 0.15,
    transparent: true,
  });
  const orbitCircle = new THREE.LineLoop(orbitGeometry, orbitMaterial);

  // Apply tilt to orbit path
  const tiltMatrix = new THREE.Matrix4();
  tiltMatrix.makeRotationAxis(
    new THREE.Vector3(1, 0, 1).normalize(),
    orbitTilt
  );
  orbitCircle.applyMatrix4(tiltMatrix);

  function animateTech(currentTime) {
    const angle = currentTime * 0.8; // Tech orbit speed

    // Calculate position in a basic circular orbit
    let x = Math.cos(angle + orbitOffset) * (radius + offsetX);
    let z = Math.sin(angle + orbitOffset) * (radius + offsetX);
    let y = 0; // Default y-position

    // Apply tilt using the same rotation matrix
    const position = new THREE.Vector3(x, y, z);
    position.applyMatrix4(tiltMatrix);

    // Set the tech's position
    techMesh.position.set(position.x, position.y, position.z);
  }

  return { techMesh, animateTech, orbitCircle };
}

async function createAllOrbits(
  earthGroup,
  techUsed,
  animateFunctions = [],
  customLoader
) {
  const orbitTiltAngles = [];
  const orbitBaseSpacing = 20;
  let baseOrbitRadius = 1;
  let orbitSpacing = 0.3;

  await Promise.all(
    techUsed.map(async (element, index) => {
      let icon = techStack.find((tech) => tech.name === element)?.icon;
      if (!icon) return;

      let orbitTilt = (index / techUsed.length) * 180; // Evenly distribute orbit tilts

      // Ensure spacing between orbits
      let currentIndex = 0;
      while (currentIndex < orbitTiltAngles.length) {
        while (
          isInBetween(
            orbitTilt,
            orbitTiltAngles[currentIndex] - orbitBaseSpacing,
            orbitTiltAngles[currentIndex] + orbitBaseSpacing
          )
        ) {
          orbitTilt = (Math.random() * 180).toFixed(2); // Adjust tilt if too close
          currentIndex = 0;
        }
        currentIndex++;
      }
      orbitTiltAngles.push(orbitTilt);

      let orbitRadius =
        baseOrbitRadius + index * 0.1 * Math.random() * orbitSpacing;
      let orbitOffset = index * (Math.PI / 4);
      const { techMesh, animateTech, orbitCircle } = await createOrbitTech(
        THREE.MathUtils.degToRad(orbitTilt),
        orbitOffset,
        orbitRadius,
        0.05,
        0.5,
        icon,
        customLoader
      );
      animateFunctions.push(animateTech);
      earthGroup.add(orbitCircle);
      earthGroup.add(techMesh);
    })
  );
}

export async function createPlanet(
  scene,
  position = { x: 0, y: 0, z: 0 },
  size,
  name,
  techUsed,
  data = {},
  index,
  customLoader
) {
  const {
    map,
    specularMap,
    bumpMap,
    bumpScale,
    lightsMap,
    cloudsMap,
    cloudsMapTrans,
    fresneData,
  } = data;
  const basePlanetGroup = new THREE.Group();
  basePlanetGroup.rotation.z = (-23.4 * Math.PI) / 180;

  // Use provided loader or create a new one
  const loader = customLoader || new THREE.TextureLoader();
  const geometry = new THREE.IcosahedronGeometry(1, 10);

  const material = new THREE.MeshPhongMaterial({
    map: await new Promise((res) => {
      loader.load(
        map,
        (texture) => res(texture),
        undefined,
        (error) => console.error("Error loading texture", error)
      );
    }),
    specularMap: specularMap
      ? await new Promise((res) => {
          loader.load(
            specularMap,
            (texture) => res(texture),
            undefined,
            (error) => console.error("Error loading texture", error)
          );
        })
      : null,
    bumpMap: bumpMap
      ? await new Promise((res) => {
          loader.load(
            bumpMap,
            (texture) => res(texture),
            undefined,
            (error) => console.error("Error loading texture", error)
          );
        })
      : null,
    bumpScale: bumpScale ?? null,
  });

  // Earth Mesh
  const earthMesh = new THREE.Mesh(geometry, material);
  basePlanetGroup.add(earthMesh);

  // Lights
  let lightsMesh = null;
  if (lightsMap) {
    const lightsMat = new THREE.MeshBasicMaterial({
      map: await new Promise((res) => {
        loader.load(
          lightsMap,
          (texture) => res(texture),
          undefined,
          (error) => console.error("Error loading texture", error)
        );
      }),
      blending: THREE.AdditiveBlending,
    });
    lightsMesh = new THREE.Mesh(geometry, lightsMat);
    lightsMesh.scale.setScalar(1.002);
    basePlanetGroup.add(lightsMesh);
  }

  // Clouds
  let cloudsMesh = null;
  if (cloudsMap) {
    const cloudsMat = new THREE.MeshStandardMaterial({
      map: await new Promise((res) => {
        loader.load(
          cloudsMap,
          (texture) => res(texture),
          undefined,
          (error) => console.error("Error loading texture", error)
        );
      }),
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
      alphaMap: await new Promise((res) => {
        loader.load(
          cloudsMapTrans,
          (texture) => res(texture),
          undefined,
          (error) => console.error("Error loading texture", error)
        );
      }),
    });
    cloudsMesh = new THREE.Mesh(geometry, cloudsMat);
    cloudsMesh.scale.setScalar(1.004);
    basePlanetGroup.add(cloudsMesh);
  }

  // Glow
  const fresnelMat = getFresnelMat(fresneData);
  const glowMesh = new THREE.Mesh(geometry, fresnelMat);
  glowMesh.scale.setScalar(1.015);
  basePlanetGroup.add(glowMesh);
  // orbits
  let animateFunctions = [];
  await createAllOrbits(
    basePlanetGroup,
    techUsed,
    animateFunctions,
    customLoader
  );

  // Position and Scale
  basePlanetGroup.scale.setScalar(size);
  basePlanetGroup.position.set(position.x, position.y, position.z);

  // Label
  const earthRadius = geometry.parameters.radius * size;

  scene.add(basePlanetGroup);

  return {
    mesh: earthMesh,
    lights: lightsMesh,
    clouds: cloudsMesh,
    glow: glowMesh,
    group: basePlanetGroup,
    name: name,
    orbitAnimation: animateFunctions,
  };
}

export async function createNeptune(
  scene,
  position = { x: 0, y: 0, z: 0 },
  size,
  name,
  techUsed,
  description,
  index,
  customLoader
) {
  return await createPlanet(
    scene,
    position,
    size,
    name,
    techUsed,
    {
      map: "./textures/neptune/base.jpg",
      fresneData: { rimHex: 0x00aaff },
    },
    index,
    customLoader
  );
}

export async function createEris(
  scene,
  position = { x: 0, y: 0, z: 0 },
  size,
  name,
  techUsed,
  description,
  index,
  customLoader
) {
  return await createPlanet(
    scene,
    position,
    size,
    name,
    techUsed,
    {
      map: "./textures/eris/base.jpg",
      fresneData: { rimHex: 0xaaaaaa },
    },
    index,
    customLoader
  );
}

export async function createJupiter(
  scene,
  position = { x: 0, y: 0, z: 0 },
  size,
  name,
  techUsed,
  description,
  index,
  customLoader
) {
  return await createPlanet(
    scene,
    position,
    size,
    name,
    techUsed,
    {
      map: "./textures/jupiter/base.jpg",
      fresneData: { rimHex: 0xffe0bd },
    },
    index,
    customLoader
  );
}

export async function createEarth(
  scene,
  position = { x: 0, y: 0, z: 0 },
  size,
  name,
  techUsed,
  description,
  index,
  customLoader
) {
  return await createPlanet(
    scene,
    position,
    size,
    name,
    techUsed,
    {
      map: "./textures/earth/00_earthmap1k.jpg",
      specularMap: "./textures/earth/02_earthspec1k.jpg",
      bumpMap: "./textures/earth/01_earthbump1k.jpg",
      bumpScale: 0.04,
      lightsMap: "./textures/earth/03_earthlights1k.jpg",
      cloudsMap: "./textures/earth/04_earthcloudmap.jpg",
      cloudsMapTrans: "./textures/earth/05_earthcloudmaptrans.jpg",
    },
    index,
    customLoader
  );
}

export async function createMars(
  scene,
  position = { x: 0, y: 0, z: 0 },
  size,
  name,
  techUsed,
  description,
  index,
  customLoader
) {
  return await createPlanet(
    scene,
    position,
    size,
    name,
    techUsed,
    {
      map: "./textures/mars/base.jpg",
      specularMap: "./textures/mars/glosiness.png",
      bumpMap: "./textures/mars/bump.png",
      bumpScale: 0.05,
      fresneData: { rimHex: 0xf4d3a6 },
    },
    index,
    customLoader
  );
}
