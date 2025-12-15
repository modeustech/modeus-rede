// =======================
// Lenis (desktop only)
// =======================
const isTouch = window.matchMedia("(pointer: coarse)").matches;

let lenis = null;
if (!isTouch) {
  lenis = new Lenis({
    smoothWheel: true,
    smoothTouch: false,
  });

  lenis.on("scroll", () => ScrollTrigger.update());

  gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
  });
  gsap.ticker.lagSmoothing(0);
}

// =======================
// Three.js main chair
// =======================
const scene = new THREE.Scene();

const modelFrame = document.querySelector(".model-frame");
const rotateBtn = document.querySelector(".rotate-btn");
const resetBtn = document.querySelector(".reset-btn");

const camera = new THREE.PerspectiveCamera(55, 1, 0.01, 1000);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setClearColor(0x000000, 0);

// cap DPR for performance (especially mobile)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

function resizeRendererToFrame() {
  if (!modelFrame) return;
  const { width, height } = modelFrame.getBoundingClientRect();
  if (!width || !height) return;

  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

resizeRendererToFrame();

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.physicallyCorrectLights = true;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 2.5;

const modelContainer = document.querySelector(".model");
if (modelContainer) modelContainer.appendChild(renderer.domElement);

window.addEventListener("resize", () => {
  resizeRendererToFrame();
});

scene.add(new THREE.AmbientLight(0xffffff, 0.75));

const mainLight = new THREE.DirectionalLight(0xffffff, 7.5);
mainLight.position.set(0.5, 7.5, 2.5);
scene.add(mainLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 2.5);
fillLight.position.set(-15, 0, -5);
scene.add(fillLight);

const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1.5);
scene.add(hemiLight);

// ---- state
let model = null;
let baseYPosition = 0;

let rotationEnabled = true;
let isDraggingModel = false;
let dragStartX = 0;
let dragStartRotationY = 0;

const floatAmplitude = 0.2;
const floatSpeed = 1.5;
const rotationSpeed = 0.01;
let isFloating = true;
const rotationSensitivity = 0.01;
const baseTilt = 0.4;

// ---- single RAF loop (this replaces basicAnimate + animate)
let rafId = null;

function renderLoop() {
  if (model) {
    if (isFloating) {
      const floatOffset = Math.sin(Date.now() * 0.001 * floatSpeed) * floatAmplitude;
      model.position.y = baseYPosition + floatOffset;
    }

    model.rotation.x = baseTilt;

    if (rotationEnabled && !isDraggingModel) {
      model.rotation.y += rotationSpeed;
    }
  }

  renderer.render(scene, camera);
  rafId = requestAnimationFrame(renderLoop);
}

rafId = requestAnimationFrame(renderLoop);

// ---- UI
function updateRotateButtonLabel() {
  if (!rotateBtn) return;
  rotateBtn.textContent = rotationEnabled ? "Rotate" : "Pause";
}

function toggleRotation() {
  rotationEnabled = !rotationEnabled;
  updateRotateButtonLabel();
}

rotateBtn?.addEventListener("click", toggleRotation);

resetBtn?.addEventListener("click", () => {
  if (!model) return;
  gsap.to(model.rotation, {
    x: baseTilt,
    y: 0.5,
    duration: 0.6,
    ease: "power2.out",
  });
  if (!rotationEnabled) toggleRotation();
});

if (modelFrame) {
  modelFrame.addEventListener("pointerdown", (event) => {
    if (!model) return;
    isDraggingModel = true;
    dragStartX = event.clientX;
    dragStartRotationY = model.rotation.y;
    modelFrame.setPointerCapture(event.pointerId);
  });

  modelFrame.addEventListener("pointermove", (event) => {
    if (!isDraggingModel || !model) return;
    const deltaX = event.clientX - dragStartX;
    model.rotation.y = dragStartRotationY + deltaX * rotationSensitivity;
  });

  modelFrame.addEventListener("pointerup", (event) => {
    isDraggingModel = false;
    if (modelFrame.hasPointerCapture(event.pointerId)) {
      modelFrame.releasePointerCapture(event.pointerId);
    }
  });

  modelFrame.addEventListener("pointerleave", () => {
    isDraggingModel = false;
  });
}

updateRotateButtonLabel();

function positionCamera(maxDim) {
  const distanceMultiplier = 3.8;
  const verticalOffset = maxDim * 0.3;

  camera.position.set(0.1, verticalOffset, maxDim * distanceMultiplier);
  camera.lookAt(0, 0, 0);
}

function playInitialAnimation() {
  if (!model) return;
  gsap.to(model.scale, {
    x: 2.2,
    y: 2.2,
    z: 2.2,
    duration: 1,
    ease: "power2.out",
  });
}

// ---- load model
const loader = new THREE.GLTFLoader();
loader.load("./assets/chair_1.glb", (gltf) => {
  model = gltf.scene;

  model.traverse((node) => {
    if (node.isMesh) {
      node.material = new THREE.MeshStandardMaterial({
        color: 0x8c4531,
        metalness: 0.8,
        roughness: 1.7,
        envMapIntensity: 1.0,
      });
      node.castShadow = true;
      node.receiveShadow = true;
    }
  });

  const box = new THREE.Box3().setFromObject(model);
  const center = box.getCenter(new THREE.Vector3());
  model.position.sub(center);

  model.position.x = 0;
  model.position.y -= 7;
  baseYPosition = model.position.y;

  scene.add(model);

  const size = box.getSize(new THREE.Vector3());
  const maxDim = Math.max(size.x, size.y, size.z);

  positionCamera(maxDim);

  model.scale.set(0, 0, 0);
  model.rotation.set(0, 0.5, 0);

  playInitialAnimation();
});

// =======================
// SplitType + ScrollTrigger (your existing)
// =======================
const splitText = new SplitType(".outro-copy h2", { types: "lines", lineClass: "line" });
splitText.lines.forEach((line) => {
  const text = line.innerHTML;
  line.innerHTML = `<span style="display:block; transform: translateY(70px);">${text}</span>`;
});

ScrollTrigger.create({
  trigger: ".outro",
  start: "top center",
  onEnter: () => {
    gsap.to(".outro-copy h2 .line span", {
      translateY: 0,
      duration: 1,
      stagger: 0.1,
      ease: "power3.out",
      force3D: true,
    });
  },
  onLeaveBack: () => {
    gsap.to(".outro-copy h2 .line span", {
      translateY: 70,
      duration: 1,
      stagger: 0.1,
      ease: "power3.out",
      force3D: true,
    });
  },
  toggleActions: "play reverse play reverse",
});

// (keep your other ScrollTriggers as-is)

// =======================
// Gallery scroll (your existing)
// =======================
const galleryScroll = document.getElementById("galleryScroll");
const galleryPrev = document.querySelector(".gallery-nav--prev");
const galleryNext = document.querySelector(".gallery-nav--next");
const progressBar = document.querySelector(".gallery-scroll-progress-bar");

if (galleryScroll && galleryPrev && galleryNext && progressBar) {
  function updateGalleryUI() {
    const { scrollLeft, scrollWidth, clientWidth } = galleryScroll;
    const scrollPercentage = (scrollLeft / (scrollWidth - clientWidth)) * 100;
    progressBar.style.width = `${scrollPercentage}%`;
    galleryPrev.disabled = scrollLeft <= 0;
    galleryNext.disabled = scrollLeft >= scrollWidth - clientWidth - 1;
  }

  updateGalleryUI();
  galleryScroll.addEventListener("scroll", updateGalleryUI);

  galleryPrev.addEventListener("click", () => {
    const card = galleryScroll.querySelector(".gallery-portrait-card");
    if (!card) return;
    const cardWidth = card.offsetWidth;
    const gap = 24;
    galleryScroll.scrollBy({ left: -(cardWidth + gap), behavior: "smooth" });
  });

  galleryNext.addEventListener("click", () => {
    const card = galleryScroll.querySelector(".gallery-portrait-card");
    if (!card) return;
    const cardWidth = card.offsetWidth;
    const gap = 24;
    galleryScroll.scrollBy({ left: cardWidth + gap, behavior: "smooth" });
  });

  window.addEventListener("resize", updateGalleryUI);
}

// =======================
// Footer clip-path ScrollTrigger (WARNING: expensive)
// Keep for now, but consider replacing later.
// =======================
const footer = document.querySelector(".site-footer");
if (footer) {
  ScrollTrigger.create({
    trigger: footer,
    start: "top bottom",
    end: "top 20%",
    scrub: 1,
    onUpdate: (self) => {
      const progress = Math.min(self.progress, 1);
      const topEdge = Math.max(0, 100 - progress * 100);
      footer.style.clipPath = `polygon(0 ${topEdge}%, 100% ${topEdge}%, 100% 100%, 0 100%)`;
    },
  });
}

// =======================
// Footer inline 3D chair (unchanged, but capped DPR already)
// =======================
const chairCanvas = document.querySelector(".chair-canvas");
if (chairCanvas) {
  const chairScene = new THREE.Scene();
  const chairCamera = new THREE.PerspectiveCamera(50, 1, 0.01, 1000);

  const chairRenderer = new THREE.WebGLRenderer({
    canvas: chairCanvas,
    antialias: true,
    alpha: true,
  });
  chairRenderer.setClearColor(0x000000, 0);
  chairRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  function resizeChairCanvas() {
    const container = chairCanvas.parentElement;
    if (!container) return;
    const computedStyle = window.getComputedStyle(container);
    const fontSize = parseFloat(computedStyle.fontSize) || 180;
    const size = Math.round(fontSize * 1.2);
    chairCanvas.width = size;
    chairCanvas.height = size;
    chairRenderer.setSize(size, size);
    chairCamera.aspect = 1;
    chairCamera.updateProjectionMatrix();
  }

  resizeChairCanvas();
  window.addEventListener("resize", resizeChairCanvas);

  chairScene.add(new THREE.AmbientLight(0xffffff, 1));

  const chairDirectionalLight = new THREE.DirectionalLight(0xffffff, 2);
  chairDirectionalLight.position.set(2, 5, 3);
  chairScene.add(chairDirectionalLight);

  const chairFillLight = new THREE.DirectionalLight(0xffffff, 0.5);
  chairFillLight.position.set(-2, 0, -2);
  chairScene.add(chairFillLight);

  let chairModel = null;
  const chairLoader = new THREE.GLTFLoader();

  chairLoader.load("./assets/bar.glb", (gltf) => {
    chairModel = gltf.scene;

    chairModel.traverse((node) => {
      if (node.isMesh) {
        node.material = new THREE.MeshStandardMaterial({
          color: 0xffffff,
          metalness: 0.3,
          roughness: 0.7,
        });
      }
    });

    const box = new THREE.Box3().setFromObject(chairModel);
    const center = box.getCenter(new THREE.Vector3());
    chairModel.position.sub(center);

    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    const scale = 125 / maxDim;
    chairModel.scale.set(scale, scale, scale);

    chairScene.add(chairModel);

    const distance = maxDim * 2.5;
    chairCamera.position.set(0, 0, distance);
    chairCamera.lookAt(0, 0, 0);
    chairCamera.updateProjectionMatrix();
  });

  function animateChair() {
    requestAnimationFrame(animateChair);
    if (chairModel) chairModel.rotation.y += 0.01;
    chairRenderer.render(chairScene, chairCamera);
  }

  animateChair();
}

// =======================
// Hamburger menu (your existing, unchanged)
// =======================
const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");
const navCta = document.querySelector(".nav-cta");

function toggleMenu() {
  if (!hamburger || !navLinks) return;

  const isExpanded = hamburger.getAttribute("aria-expanded") === "true";
  const newState = !isExpanded;

  hamburger.setAttribute("aria-expanded", String(newState));
  navLinks.classList.toggle("active", newState);
  navCta?.classList.toggle("active", newState);

  document.body.style.overflow = newState ? "hidden" : "";
}

function closeMenu() {
  if (!hamburger || !navLinks) return;

  hamburger.setAttribute("aria-expanded", "false");
  navLinks.classList.remove("active");
  navCta?.classList.remove("active");

  document.body.style.overflow = "";
}

if (hamburger && navLinks) {
  hamburger.addEventListener("click", (e) => {
    e.preventDefault();
    toggleMenu();
  });

  navLinks.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  navCta?.addEventListener("click", closeMenu);

  document.addEventListener("click", (e) => {
    if (!navLinks.classList.contains("active")) return;
    const clicked = e.target;
    const inside =
      hamburger.contains(clicked) ||
      navLinks.contains(clicked) ||
      (navCta && navCta.contains(clicked));

    if (!inside) closeMenu();
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 640 && navLinks.classList.contains("active")) {
      closeMenu();
    }
  });
}

// =======================
// Careers modal (moved OUT of click handlers)
// =======================
const careerCards = document.querySelectorAll(".career-card");
const careerModal = document.querySelector("#career-modal");

if (careerCards.length && careerModal) {
  const modalTitle = careerModal.querySelector(".career-modal-title");
  const modalMeta = careerModal.querySelector(".career-modal-meta");
  const modalBody = careerModal.querySelector(".career-modal-body");
  const modalApply = careerModal.querySelector(".career-modal-apply");
  const closeTriggers = careerModal.querySelectorAll("[data-career-close]");

  function openCareerModal(card) {
    const title = card.querySelector("h2")?.textContent ?? "";
    const meta = card.querySelector(".career-meta")?.textContent ?? "";
    const fullBody = card.querySelector(".career-full");
    const applyLink = card.querySelector("[data-career-apply]");

    if (modalTitle) modalTitle.textContent = title;
    if (modalMeta) modalMeta.textContent = meta;
    if (modalBody && fullBody) modalBody.innerHTML = fullBody.innerHTML;

    if (modalApply && applyLink) {
      modalApply.href = applyLink.href;
      modalApply.textContent = applyLink.textContent || "Apply via email";
    }

    careerModal.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function closeCareerModal() {
    careerModal.classList.remove("is-open");
    document.body.style.overflow = "";
  }

  careerCards.forEach((card) => {
    card.querySelector(".career-readmore")?.addEventListener("click", () => openCareerModal(card));
  });

  closeTriggers.forEach((el) => el.addEventListener("click", closeCareerModal));

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && careerModal.classList.contains("is-open")) {
      closeCareerModal();
    }
  });
}
