import { MathUtils } from "three";
import { CSS3DObject } from "three/addons/renderers/CSS3DRenderer.js";

export function createDialog(scene, msg, position = { x: 0, y: 0, z: 0 }) {
  const div = document.createElement("div");
  div.id = "user-dialog";
  div.className = "hidden";

  const label = new CSS3DObject(div);
  label.position.set(position.x, position.y, position.z);
  label.scale.setScalar(0.02);
  const angle = 6;
  if (position.x > 0) {
    label.rotateY((-Math.PI * angle) / 180);
  } else {
    label.rotateY((Math.PI * angle) / 180);
  }
  scene.add(label);

  const span = document.createElement("span");
  const textSpan = div.appendChild(span.cloneNode());
  const cursorSpan = div.appendChild(span);
  cursorSpan.id = "text-cursor";
  cursorSpan.textContent = "|";

  const icon = document.createElement("img");
  icon.src = "./icons/press-button.png";
  icon.id = "dialog-icon";
  div.appendChild(icon);

  function typeWriterEffect(text, element, speed = 40) {
    let i = 0;
    function type() {
      if (i < text.length) {
        element.innerHTML += text[i] === "\n" ? "<br>" : text[i];
        i++;
        setTimeout(type, speed);
      } else if (i === text.length) {
        cursorSpan.remove();
      }
    }
    type();
  }

  setTimeout(() => {
    typeWriterEffect(msg, textSpan, 15);
  }, 200);

  return label;
}

export function initInstructions() {
  const instructions = document.createElement("div");
  instructions.classList.add("instructions");
  const wheel = document.createElement("img");
  const container = document.createElement("div");
  container.style.display = "flex";
  container.style.flexDirection = "row";
  container.style.alignItems = "center";
  container.style.justifyContent = "start";

  wheel.src = "./icons/scroll.png";
  wheel.classList.add("wheel");
  container.appendChild(wheel);

  const scrollText = document.createElement("p");
  scrollText.textContent = "Scroll to move";
  container.appendChild(scrollText);

  instructions.appendChild(container);

  const keysContainer = document.createElement("div");
  keysContainer.style.display = "flex";
  keysContainer.style.alignItems = "center";

  const keys = document.createElement("img");
  keys.src = "./icons/keys.png";
  keys.classList.add("keys");
  keysContainer.appendChild(keys);

  const keysText = document.createElement("p");
  keysText.textContent = "Use arrows to move";
  keysContainer.appendChild(keysText);
  instructions.appendChild(keysContainer);

  const clickContainer = document.createElement("div");
  clickContainer.style.display = "flex";
  clickContainer.style.alignItems = "center";
  const click = document.createElement("img");
  click.src = "./icons/press-button.png";
  click.classList.add("click");
  clickContainer.appendChild(click);
  const clickText = document.createElement("p");
  clickText.textContent = "Click to interact";
  clickContainer.appendChild(clickText);
  instructions.appendChild(clickContainer);

  instructions.style.zIndex = 1000;
  const instructions3D = new CSS3DObject(instructions);
  instructions3D.position.set(7.5, -3, 0);
  instructions3D.scale.setScalar(0.02);
  instructions3D.rotateY(MathUtils.degToRad(-10));
  return instructions3D;
}
