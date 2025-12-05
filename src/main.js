import * as THREE from "three";
import gsap from "gsap";
import {
  initScene,
  initCamera,
  initRenderer,
  initLights,
  createPlanets,
  randomAsteroids,
  addStars,
  postProccesing,
} from "./modules/init";
import { CSS3DRenderer } from "three/addons/renderers/CSS3DRenderer.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { createDialog, initInstructions } from "./modules/dialog";
import {
  handleResize,
  handleScroll,
  handleClick,
  handleKeyDown,
} from "./modules/eventHandlers";
import {
  dialogData,
  planetData,
  sectionCoordinates,
} from "./modules/constValues";
import { isInBetween } from "./modules/utils";
import { setAstronautVelocity, updateAstronaut } from "./modules/astronaut";

import {
  initTechStackSection,
  updateTechPosition,
  updateTechRotation,
} from "./modules/techStack";
import { createBeacon, moveBeacon } from "./modules/contactme";
import { loadAstronaut } from "./modules/astronaut";
import { createLoadingManager } from "./modules/loadingManager";
import {
  animatePlanets,
  animateStars,
  animateAsteroids,
} from "./modules/animations";

/**
 * keep hold of the current focus
 * -1 means on astronaut
 * -2 means on dialog
 * n means on planet n
 * **/
const state = {
  canMove: true,
  currentFocus: -1, // -1 means on astronaut, -2 means on dialog, n means on planet n,
  contactShown: false,
  goToSection: -1, // -1 mean no section, n mean go to section n
  goToPlanet: -1, // -1 mean no planet, n mean go to planet n
};

function setupEventListeners(
  camera,
  renderer,
  renderer3D,
  outlinePass,
  bloomEffect,
  ssaaPass,
  composer,
  astronaut,
  state,
  planets,
  techStack,
  beacon,
  bokehPass
) {
  window.addEventListener("resize", () =>
    handleResize(
      camera,
      renderer,
      renderer3D,
      outlinePass,
      bloomEffect,
      ssaaPass,
      composer
    )
  );

  window.addEventListener("wheel", (event) =>
    handleScroll(event, astronaut, camera, state, bokehPass)
  );

  window.addEventListener("click", (event) =>
    handleClick(event, camera, planets, state, techStack, bokehPass, beacon)
  );

  document.addEventListener("keydown", (event) =>
    handleKeyDown(event, astronaut, camera, state)
  );
}

function setupNavigation(nav, navItems, state) {
  let navThrottle = false;

  nav.addEventListener("mousemove", (event) => {
    if (navThrottle) return;
    navThrottle = true;
    const rect = nav.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 30;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * -10;

    nav.style.transform = `rotateX(${y}deg) rotateY(${x}deg)`;
    setTimeout(() => {
      navThrottle = false;
    }, 18);
  });

  nav.addEventListener("mouseleave", () => {
    gsap.to(nav.style, {
      duration: 0.5,
      ease: "power2.out",
      transform: "rotateX(0deg) rotateY(0deg)",
    });
  });

  navItems.forEach((navItem, index) => {
    if (navItem.id === "nav-projects-dropdown-container") return;

    navItem.addEventListener("click", () => {
      if (
        state.canMove === false ||
        state.contactShown ||
        state.currentFocus !== -1
      )
        return;
      navItems.forEach((item) => item.classList.remove("active"));
      navItem.classList.add("active");
      state.goToSection = index;
    });
  });
}

function setupPlanetNavigation(navigationPlanets, planetData, state) {
  planetData.reverse().forEach((planet, index) => {
    const planetElement = document.createElement("li");
    planetElement.id = index;
    const planetLink = document.createElement("a");
    planetLink.className = "nav-item";
    planetLink.innerText = planet.name;

    planetLink.addEventListener("click", () => {
      if (state.canMove === false || state.contactShown) return;
      state.goToPlanet = index;
    });

    planetElement.appendChild(planetLink);
    navigationPlanets.appendChild(planetElement);
  });
}

function setupMusicToggle(audioLoader, listener) {
  const musicToggle =
    document.getElementById("music-toggle") || createMusicToggle();
  const backgroundMusic = new THREE.Audio(listener);
  let isMusicPlaying = false;

  // Preload the audio buffer once
  audioLoader.load("./music/space.mp3", (buffer) => {
    backgroundMusic.setBuffer(buffer);
    backgroundMusic.setLoop(true);
    backgroundMusic.setVolume(0.5);
  });

  // Use a single event listener for toggling music
  musicToggle.addEventListener("click", () => {
    if (isMusicPlaying) {
      backgroundMusic.stop();
      musicToggle.innerHTML =
        '<img src="/icons/play-icon.png" alt="Play Music" />';
    } else {
      backgroundMusic.play();
      musicToggle.innerHTML =
        '<img src="/icons/stop-icon.png" alt="Stop Music" />';
    }
    isMusicPlaying = !isMusicPlaying;
  });

  return backgroundMusic;
}

function createMusicToggle() {
  const musicToggle = document.createElement("button");
  musicToggle.id = "music-toggle";
  musicToggle.innerHTML = '<img src="/icons/play-icon.png" alt="Play Music" />';
  document.body.appendChild(musicToggle);
  return musicToggle;
}

function showSmallScreenIndicator() {
  if (window.innerWidth < 800) {
    const smallScreenIndicator = document.createElement("div");
    smallScreenIndicator.id = "small-screen-indicator";
    smallScreenIndicator.innerHTML = `
      <p>
        This website is not optimized for small screens. Please use a larger
        screen for the best experience.
      </p>
    `;

    smallScreenIndicator.style.display = "flex";
    smallScreenIndicator.style.justifyContent = "center";
    smallScreenIndicator.style.alignItems = "center";
    smallScreenIndicator.style.position = "fixed";
    smallScreenIndicator.style.top = "0";
    smallScreenIndicator.style.left = "0";
    smallScreenIndicator.style.width = "100vw";
    smallScreenIndicator.style.height = "100vh";
    smallScreenIndicator.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
    smallScreenIndicator.style.color = "white";
    smallScreenIndicator.style.fontSize = "1.5rem";
    smallScreenIndicator.style.textAlign = "center";
    smallScreenIndicator.style.zIndex = "1000";

    document.body.appendChild(smallScreenIndicator);
    return true;
  }
  return false;
}

async function main() {
  // check screen size
  if (showSmallScreenIndicator()) {
    return;
  }

  // Scene Setup
  const scene = initScene();
  const renderer = initRenderer();
  const camera = initCamera();
  scene.add(camera);

  const renderer3D = new CSS3DRenderer();
  renderer3D.setSize(window.innerWidth, window.innerHeight);
  renderer3D.domElement.id = "renderer3D";

  // Append to DOM
  document.body.appendChild(renderer3D.domElement);
  document.body.appendChild(renderer.domElement);

  // Lights
  initLights(scene);
  const currentDownloaderElement = document.getElementById("current-download"); // Create a boolean to track when scene is actually ready
  let isSceneFullyReady = false;

  // Set up loading manager to track all assets
  const loadingManager = createLoadingManager(currentDownloaderElement, () => {
    // This function will be called when THREE.js reports all assets are loaded
    console.log("THREE.js LoadingManager reports loading complete.");

    // Set a safety timeout to ensure all processing is complete before showing music choice
    setTimeout(() => {
      if (isSceneFullyReady) {
        console.log("Scene is fully ready - showing music request");
        showMusicRequest();
      } else {
        console.log("Waiting for scene to be fully ready...");
        // If the scene isn't fully ready yet, wait for that flag
        const checkInterval = setInterval(() => {
          if (isSceneFullyReady) {
            console.log("Scene became fully ready - showing music request");
            clearInterval(checkInterval);
            showMusicRequest();
          }
        }, 100);

        // Absolute fallback - if after 10 seconds we still aren't ready, force it
        setTimeout(() => {
          if (!isSceneFullyReady) {
            console.warn(
              "Scene never reported ready after 10s - forcing music request"
            );
            clearInterval(checkInterval);
            isSceneFullyReady = true;
            showMusicRequest();
          }
        }, 10000);
      }
    }, 1000);
  });

  // Function to handle showing the music request after loading
  function showMusicRequest() {
    gsap.to("#loader", {
      opacity: 0,
      duration: 1,
      ease: "power2.out",
    });
    gsap.to("#current-download", {
      opacity: 0,
      duration: 1,
      ease: "power2.out",
    });
    gsap.to("#loading-progress-bar", {
      opacity: 0,
      duration: 1,
      ease: "power2.out",
      onComplete: () => {
        document.getElementById("loader").style.display = "none";
        currentDownloaderElement.style.display = "none";
        document.getElementById("loading-progress-bar").style.display = "none";

        // Show music request after all assets are loaded
        const musicRequest = document.getElementById("music-request");
        musicRequest.style.display = "block";
        setTimeout(() => {
          musicRequest.style.opacity = 1;
        }, 100);
      },
    });
  }
  // Use loading manager for all loaders
  const textureLoader = new THREE.TextureLoader(loadingManager);
  const gltfLoader = new GLTFLoader(loadingManager);

  // Background - HDR Space Texture
  let backgroundTexture;
  let backgroundPlane;

  try {
    backgroundTexture = await new Promise((resolve, reject) => {
      textureLoader.load(
        "./textures/space_blue.webp",
        (texture) => {
          texture.wrapS = THREE.RepeatWrapping;
          texture.wrapT = THREE.RepeatWrapping;
          texture.repeat.setScalar(1);
          texture.encoding = THREE.sRGBEncoding;
          texture.mapping = THREE.EquirectangularReflectionMapping;
          resolve(texture);
        },
        undefined,
        (error) => reject(error)
      );
    });

    scene.environment = backgroundTexture;
    scene.background = backgroundTexture;

    const aspectRatio =
      backgroundTexture.image.width / backgroundTexture.image.height;
    const geometry = new THREE.PlaneGeometry(1000 * aspectRatio, 1000);
    const material = new THREE.MeshBasicMaterial({
      map: backgroundTexture,
    });

    backgroundPlane = new THREE.Mesh(geometry, material);
    backgroundPlane.position.set(40, 250, -400);
    scene.add(backgroundPlane);
  } catch (error) {
    console.error("Failed to load background texture:", error);
  }

  // Stars
  const stars = addStars(scene, 1500);

  // Load assets in parallel
  const [astronautResult, planets, beacon, techStack] = await Promise.all([
    // Astronaut
    loadAstronaut(scene, gltfLoader),

    // Planets
    createPlanets(scene, camera),

    // Beacon
    createBeacon(scene, new THREE.Vector3(-10, 460, -15), gltfLoader),

    // Tech stack
    initTechStackSection(scene, camera, gltfLoader),
  ]);

  // Extract astronaut data
  const { astronaut, animations } = astronautResult;

  // Set up contact section event listener
  document.getElementById("close-sos").addEventListener("click", () => {
    state.contactShown = false;
    const element = document.getElementById("sos-interface");
    element.classList.remove("visible");
    element.classList.add("hidden");
  });

  // Asteroids
  let animateAstrroProgress = 0;
  const { curve, instancedMesh } = randomAsteroids(scene, 1);

  // Create selection array for post-processing
  let selection = [];
  techStack.children.forEach((stack) => {
    selection.push(stack.children[0]);
  });
  selection.push(beacon);
  // Post Processing
  const { composer, bokehPass, outlinePass, bloomEffect, ssaaPass } =
    postProccesing(scene, camera, renderer, selection);

  // Stats
  const stats = new Stats();
  stats.showPanel(0);
  document.body.appendChild(stats.dom);
  stats.dom.style.display = "none";

  // Load background music
  const audioLoader = new THREE.AudioLoader(loadingManager);
  const listener = new THREE.AudioListener();
  camera.add(listener);
  // Ensure all GPU processes are complete before marking scene as ready
  // This forces a single render pass to finalize all GPU operations
  renderer.render(scene, camera);
  composer.render();

  // Mark that the scene is fully ready now
  // This is the critical flag that indicates ALL assets and processing are complete
  isSceneFullyReady = true;

  // Setup music toggle & auto play
  const backgroundMusic = setupMusicToggle(audioLoader, listener, camera);

  // Handle music confirmation buttons
  const yesMusicButton = document.getElementById("yes-music");
  const noMusicButton = document.getElementById("no-music");
  const loadingElement = document.getElementById("loading");
  const musicToggle = document.getElementById("music-toggle");
  yesMusicButton.addEventListener("click", () => {
    backgroundMusic.play();
    musicToggle.innerHTML =
      '<img src="/icons/stop-icon.png" alt="Stop Music" />';
    // Only hide the loading element after user makes a choice about music
    loadingElement.style.opacity = 0;
    setTimeout(() => {
      loadingElement.style.display = "none";
      loadingElement.style.pointerEvents = "none";
      musicToggle.style.display = "block";
    }, 1000);
  });

  noMusicButton.addEventListener("click", () => {
    backgroundMusic.stop();
    musicToggle.innerHTML =
      '<img src="/icons/play-icon.png" alt="Play Music" />';
    // Only hide the loading element after user makes a choice about music
    loadingElement.style.opacity = 0;
    setTimeout(() => {
      loadingElement.style.display = "none";
      loadingElement.style.pointerEvents = "none";
      musicToggle.style.display = "block";
    }, 1000);
  });

  // Setup Event Listeners
  setupEventListeners(
    camera,
    renderer,
    renderer3D,
    outlinePass,
    bloomEffect,
    ssaaPass,
    composer,
    astronaut,
    state,
    planets,
    techStack,
    beacon,
    bokehPass
  );

  // Setup Navigation
  const nav = document.getElementById("navigation");
  const navItems = document.querySelectorAll(".nav-item");
  setupNavigation(nav, navItems, state);

  const navigationPlanets = document.getElementById("nav-projects-dropdown");
  setupPlanetNavigation(navigationPlanets, planetData, state);

  // function for navigation
  let isMovingToSection = false;
  const handleGoto = (minY, maxY) => {
    const isInside = isInBetween(astronaut.position.y, minY, maxY);
    if (isInside && isMovingToSection === false) {
      state.goToSection = -1;
      return;
    }

    isMovingToSection = true;
    const targetPosition = new THREE.Vector3().copy(astronaut.position);
    targetPosition.y = minY + 1;
    setAstronautVelocity(0);
    astronaut.position.y = astronaut.position.lerp(targetPosition, 0.05).y;
    camera.position.y = astronaut.position.y + 2;

    if (
      isInBetween(
        astronaut.position.y,
        targetPosition.y - 0.1,
        targetPosition.y + 0.1
      )
    ) {
      isMovingToSection = false;
    }
  };

  // astronaut animations
  const animation = animations[0];
  const mixer = new THREE.AnimationMixer(astronaut);
  const action = mixer.clipAction(animation);
  action.play();

  // pointer events for all children are none
  renderer3D.domElement.childNodes.forEach((child) => {
    child.style.pointerEvents = "none";
  });

  scene.add(initInstructions());
  /** @type {Record<number, CSS3DObject>} **/
  let allDialogsShown = {};

  let astroHeight = 0;
  let lastDialogId = -1;
  let idsToshow = {};
  dialogData.forEach((dialog) => {
    idsToshow[dialog.id] = false;
  });
  const startTime = Date.now();
  let currentTime = 0;

  const boundingBox = new THREE.Box3().setFromObject(astronaut);
  astroHeight = boundingBox.max.y - boundingBox.min.y;
  const clock = new THREE.Clock();

  // Camera Animation to astronaut
  gsap.to(camera.position, {
    ease: "power4.out",
    duration: 1,
    x: 0,
    y: astronaut.position.y + 2,
    z: astronaut.position.z + 15,
  });

  // Animation Loop
  function animate() {
    stats.begin();
    mixer.update(0.01);
    currentTime = (currentTime + Date.now() - startTime) / 1000;
    const deltaTime = clock.getDelta();

    if (state.goToSection > -1) {
      state.goToPlanet = -1;
      const position = sectionCoordinates[state.goToSection];
      handleGoto(position.minY, position.maxY);
    } else {
      sectionCoordinates.forEach((position, index) => {
        if (isInBetween(astronaut.position.y, position.minY, position.maxY)) {
          if (!navItems[index].classList.contains("active"))
            navItems[index].classList.add("active");
        } else navItems[index].classList.remove("active");
      });
    }

    if (state.goToPlanet > -1) {
      const planet = planetData[state.goToPlanet];
      const targetPosition = new THREE.Vector3().copy(astronaut.position);
      targetPosition.y = planet.position.y - 1;
      setAstronautVelocity(0);
      astronaut.position.y = astronaut.position.lerp(targetPosition, 0.05).y;
      camera.position.y = astronaut.position.y + 2;

      if (
        isInBetween(
          astronaut.position.y,
          targetPosition.y - 0.1,
          targetPosition.y + 0.1
        )
      ) {
        state.goToPlanet = -1;
      }
    }

    // planets
    animatePlanets(planets, currentTime, camera);

    // stars
    animateStars(stars, currentTime);

    // asteroids
    animateAsteroids(curve, instancedMesh, deltaTime, animateAstrroProgress);

    // beacon
    moveBeacon(beacon, currentTime);

    // techStack
    techStack.children.forEach((stack, index) => {
      updateTechPosition(stack, currentTime, index);
      updateTechRotation(stack.children[0], currentTime, index);
    });

    if (state.goToSection === -1 && state.goToPlanet === -1) {
      if (state.canMove) {
        // astronaut
        updateAstronaut(astronaut, camera, state, deltaTime);
      }

      const astronautY = astronaut.position.y;
      const visibleRange = { min: astronautY - 2, max: astronautY + 2 };

      dialogData.forEach((dialog) => {
        const dialogY = dialog.dialogPosition.y;
        const isDialogVisible =
          dialogY >= visibleRange.min && dialogY <= visibleRange.max;

        if (isDialogVisible) {
          if (!allDialogsShown[dialog.id]) {
            const newDialog = createDialog(scene, dialog.text, {
              x: dialog.dialogPosition.x,
              y: dialogY + astroHeight / 2,
              z: astronaut.position.z,
            });
            allDialogsShown[dialog.id] = newDialog;

            // Slight delay for animation effect
            setTimeout(() => {
              idsToshow[dialog.id] = true;
              newDialog.element.classList.add("visible");
              newDialog.element.classList.remove("hidden");
            }, 50);
          }

          const dialogObject = allDialogsShown[dialog.id];
          if (dialogObject) {
            // Float animation
            dialogObject.position.y += 0.001 * Math.sin(currentTime * 1.5);
            dialogObject.position.x += 0.00025 * Math.cos(currentTime);
            dialogObject.position.z += 0.0005 * Math.sin(currentTime);

            if (lastDialogId !== dialog.id) {
              lastDialogId = dialog.id;
              state.canMove = false;
            }

            if (!state.canMove && lastDialogId === dialog.id) {
              const targetY = dialogY - 1;
              const targetPos = new THREE.Vector3(
                astronaut.position.x,
                targetY,
                astronaut.position.z
              );

              setAstronautVelocity(0);
              astronaut.position.y = astronaut.position.lerp(targetPos, 0.05).y;
              camera.position.y = astronaut.position.y + 2;
            }

            if (idsToshow[dialog.id]) {
              dialogObject.element.classList.add("visible");
              dialogObject.element.classList.remove("hidden");
            }
          }
        } else {
          const dialogObject = allDialogsShown[dialog.id];
          if (dialogObject) {
            dialogObject.element.classList.remove("visible");
            dialogObject.element.classList.add("hidden");
          }

          // Re-enable movement if astronaut left the dialog zone
          if (lastDialogId === dialog.id) {
            lastDialogId = -1;
            state.canMove = true;
          }
        }
      });
    }

    // render
    renderer.render(scene, camera);
    renderer3D.render(scene, camera);
    composer.render();
    stats.end();

    requestAnimationFrame(animate);
  }

  animate();

  document.addEventListener("keydown", (event) => {
    if (event.key === "d" || event.key === "D") {
      stats.dom.style.display =
        stats.dom.style.display === "none" ? "block" : "none";
    }
  });
}

// Portfolio Selection Logic
function initPortfolioSelection() {
  const portfolioSelection = document.getElementById("portfolio-selection");
  const select3DBtn = document.getElementById("select-3d");
  const select2DBtn = document.getElementById("select-2d");
  const loadingDiv = document.getElementById("loading");

  // Show portfolio selection first
  portfolioSelection.style.display = "flex";
  loadingDiv.style.display = "none";

  select3DBtn.addEventListener("click", () => {
    // Hide selection screen and start 3D portfolio
    portfolioSelection.classList.add("hidden");
    setTimeout(() => {
      portfolioSelection.style.display = "none";
      loadingDiv.style.display = "flex";
      // Continue with 3D portfolio initialization
      main();
    }, 600);
  });

  select2DBtn.addEventListener("click", () => {
    // Redirect to traditional portfolio
    window.location.href = "./portfolio.html";
  });
}

// Initialize portfolio selection on page load
document.addEventListener("DOMContentLoaded", () => {
  initPortfolioSelection();
});
