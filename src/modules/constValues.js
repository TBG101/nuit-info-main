import {
  createEarth,
  createJupiter,
  createMars,
  createEris,
  createNeptune,
} from "./planets";

const astronautPath = "./astrov2.glb";
const minY = -5;
const maxY = 475;

/**
 * Linux Journey Checkpoints
 * @type {Array<{id: number, title: string, theme: string, badge: string, text: string, dialogPosition: {x: number, y: number, z: number}, facts: string[], color: string}>}
 **/
const dialogData = [
  {
    id: 0,
    title: "Welcome to the Linux Journey",
    theme: "Introduction",
    badge: null,
    color: "#4FC3F7",
    text: "🚀 Welcome Explorer!\nEmbark on a journey to discover why Linux is the future of education.",
    dialogPosition: { x: -7.5, y: 0, z: 0 },
    facts: [
      "You'll learn why schools should adopt Linux",
      "Collect badges as you progress",
      "Discover the power of open-source",
    ],
  },
  {
    id: 1,
    title: "The Cracked Windows Wall",
    theme: "Cost & Licensing",
    badge: "Libre Access Badge",
    color: "#2196F3",
    text: "🔵 Checkpoint 1: The Cracked Windows Wall\nDiscover the ruins of expensive licensing...",
    dialogPosition: { x: 7.5, y: 30, z: 0 },
    facts: [
      "Schools spend thousands yearly on license renewals",
      "One leaked license = legal risk",
      "Linux is 100% FREE & open-source",
      "Students can install it on any computer at home safely",
    ],
  },
  {
    id: 2,
    title: "Land of Eternal Machines",
    theme: "Durability & PC Revival",
    badge: "Eco-Warrior Badge",
    color: "#9C27B0",
    text: "🟣 Checkpoint 2: The Land of Eternal Machines\nOld PCs thrown away... until Linux revives them!",
    dialogPosition: { x: -7.5, y: 60, z: 0 },
    facts: [
      "Linux distros like Ubuntu, Mint, Zorin revive old PCs",
      "Saves money - departments can reuse computers",
      "Reduces electronic waste",
      "A 10-year-old PC runs smoothly with Linux",
    ],
  },
  {
    id: 3,
    title: "Security Tower",
    theme: "Guardian of Data",
    badge: "Cyber-Guardian Shield",
    color: "#FFEB3B",
    text: "🟡 Checkpoint 3: Security Tower\nFight viruses and ransomware with Linux shields!",
    dialogPosition: { x: 7.5, y: 90, z: 0 },
    facts: [
      "Linux has significantly fewer viruses",
      "No constant antivirus subscription fees",
      "Fewer ransomware attacks target Linux",
      "Secure package installation via official repositories",
    ],
  },
  {
    id: 4,
    title: "The Freedom Forge",
    theme: "Open-Source & Education",
    badge: "Open-Source Smith Badge",
    color: "#FF9800",
    text: "🟠 Checkpoint 4: The Freedom Forge\nForge your own tools from source code!",
    dialogPosition: { x: -7.5, y: 120, z: 0 },
    facts: [
      "Linux encourages exploration and learning",
      "Students learn how real systems are built",
      "Teachers can create custom configurations",
      "No black-box systems - everything is transparent",
      "School clubs can develop their own tools",
    ],
  },
  {
    id: 5,
    title: "Software Forest",
    theme: "Free Educational Tools",
    badge: "Knowledge Harvester Badge",
    color: "#795548",
    text: "🟤 Checkpoint 5: Software Forest\nWhere knowledge grows on trees... for FREE!",
    dialogPosition: { x: 7.5, y: 150, z: 0 },
    facts: [
      "LibreOffice - Free alternative to Microsoft Office",
      "GIMP - Professional image editing",
      "VS Code, Blender, Scratch, GeoGebra",
      "Arduino IDE for robotics clubs",
      "No more software piracy needed!",
    ],
  },
  {
    id: 6,
    title: "The Energy Shrine",
    theme: "Power & Performance",
    badge: "Speedster Crest",
    color: "#F44336",
    text: "🔴 Checkpoint 6: The Energy Shrine\nUnleash maximum performance!",
    dialogPosition: { x: -7.5, y: 180, z: 0 },
    facts: [
      "Faster boot times",
      "Smoother multitasking",
      "Fewer background services consuming resources",
      "Better memory management",
      "Lightweight distros perfect for weak hardware",
    ],
  },
  {
    id: 7,
    title: "Terminal Mountain",
    theme: "Real Tech Skills",
    badge: "Power User Badge",
    color: "#4CAF50",
    text: "🟢 Checkpoint 7: Terminal Mountain\nMaster the command line!",
    dialogPosition: { x: 7.5, y: 210, z: 0 },
    facts: [
      "Learn real DevOps and sysadmin skills",
      "Terminal mastery helps in programming careers",
      "Future-proof skills for university",
      "Same commands used in servers worldwide",
    ],
  },
  {
    id: 8,
    title: "Cloud Bridge",
    theme: "Servers & Networks",
    badge: "Network Navigator Badge",
    color: "#FFEB3B",
    text: "🟡 Checkpoint 8: Cloud Bridge\nDiscover the backbone of the internet!",
    dialogPosition: { x: -7.5, y: 240, z: 0 },
    facts: [
      "80%+ of servers worldwide run Linux",
      "Digital labs and cloud platforms use Linux",
      "Superior networking tools",
      "Default choice for cybersecurity learning",
    ],
  },
  {
    id: 9,
    title: "Ubuntu Citadel",
    theme: "Final Destination",
    badge: "Linux Champion",
    color: "#E95420",
    text: "⭐ Final Portal: Ubuntu Citadel\nCongratulations, Explorer! You've completed the journey!",
    dialogPosition: { x: 7.5, y: 270, z: 0 },
    facts: [
      "✔ Free open-source licenses",
      "✔ Revived old PCs",
      "✔ Improved security",
      "✔ Better learning environment",
      "✔ Sustainable development",
    ],
  },
];

const techStack = [];

const techStackDirection = techStack.reduce((acc, tech, index) => {
  acc[index] = {};
  acc[index].direction = Math.random() > 0.5 ? 1 : -1;
  acc[index].randomFactor = Math.random() * 2;
  return acc;
}, []);

const offsetZ = -30;
const planetData = [
  {
    size: 12,
    position: { x: 35, y: 80, z: offsetZ * 3 },
    name: "3D Portfolio",
    documentSectionEl: document.getElementById("3D Portfolio"),
    createFunction: createEarth,
    tech: ["JavaScript", "Three.js", "GSAP"],
    description:
      "An interactive 3D portfolio showcasing my projects, skills, and experience in a visually immersive way.",
    github: "https://github.com/TBG101/3D-portfolio",
  },
  {
    size: 35,
    position: { x: -70, y: 140, z: offsetZ * 5 },
    name: "E-commerce Website",
    documentSectionEl: document.getElementById("E-commerce Website"),
    createFunction: createMars,
    tech: ["Next.js", "MongoDB", "Tailwind"],
    description:
      "A full-featured e-commerce platform with secure authentication, product management, and a seamless checkout experience.",
    github: "https://github.com/TBG101/Next.js-E-commerce",
  },
  {
    size: 50,
    position: { x: 70, y: 220, z: offsetZ * 6 },
    name: "Music Player App",
    documentSectionEl: document.getElementById("Music player app"),
    createFunction: createNeptune,
    tech: ["Flutter", "FFmpeg"],
    description:
      "A sleek and feature-rich music player app with offline support, YouTube audio downloads, and podcast streaming.",
    github: "https://github.com/TBG101/Music-Player-Android",
  },
  {
    size: 45,
    position: { x: -60, y: 320, z: offsetZ * 6 },
    name: "PC Remote Control",
    documentSectionEl: document.getElementById("PC Remote Control"),
    createFunction: createJupiter,
    tech: ["Flutter", "Rust"],
    description:
      "A remote control application that allows users to manage their PC wirelessly using their mobile device with ease.",
    customData: {
      links: [
        {
          title: "View Mobile Repository",
          url: "https://github.com/TBG101/Remote-Desktop-Shutdown",
        },
        {
          title: "View Desktop Repository",
          url: "https://github.com/TBG101/Remote-Desktop-Shutdown-Windows",
        },
      ],
    },
  },
  {
    size: 25,
    position: { x: 55, y: 400, z: offsetZ * 4 },
    name: "Kick VOD Downloader",
    documentSectionEl: document.getElementById("Kick VOD Downloader"),
    createFunction: createEris,
    tech: ["Flutter", "FFmpeg"],
    description:
      "A powerful tool for downloading and saving video-on-demand content from Kick.com for offline viewing.",
    github: "https://github.com/TBG101/kickdownloader",
  },
];

const sectionCoordinates = [
  {
    minY: 450,
    maxY: maxY,
  },
  {
    minY: 58,
    maxY: 450,
  },
  {
    minY: 30,
    maxY: 58,
  },
  {
    minY: -5,
    maxY: 30,
  },
];

export {
  dialogData,
  astronautPath,
  planetData,
  techStack,
  techStackDirection,
  minY,
  maxY,
  sectionCoordinates,
};
