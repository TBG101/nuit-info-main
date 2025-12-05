export function animatePlanets(planets, currentTime, camera) {
  planets.forEach((planet) => {
    if (planet.mesh) planet.mesh.rotation.y += 0.002;
    if (planet.lights) planet.lights.rotation.y += 0.002;
    if (planet.clouds) planet.clouds.rotation.y += 0.0023;
    if (planet.glowMesh) planet.glowMesh.rotation.y += 0.002;
    if (planet.orbitAnimation) {
      planet.orbitAnimation.forEach((animateFunction) => {
        animateFunction(currentTime, camera);
      });
    }
  });
}

export function animateStars(stars, currentTime) {
  const deltaX = Math.sin(currentTime);
  const deltaY = Math.cos(currentTime);
  const deltaZ = Math.sin(currentTime);
  stars.position.x += deltaX * 0.001;
  stars.position.y += deltaY * 0.001;
  stars.position.z += deltaZ * 0.001;
}

export function animateAsteroids(curve, instancedMesh, deltaTime, progress) {
  progress = (progress + 0.0001 * deltaTime) % 1;
  const position = curve.getPointAt(progress);
  instancedMesh.position.copy(position);
  instancedMesh.instanceMatrix.needsUpdate = true;
}
