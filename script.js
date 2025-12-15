// Lenis (desktop only)
const isTouch = window.matchMedia("(pointer: coarse)").matches;


let lenis = null;


if (!isTouch) {
 lenis = new Lenis({
   smoothWheel: true,
   smoothTouch: false,
 });


 // Keep ScrollTrigger in sync with Lenis
 lenis.on("scroll", () => ScrollTrigger.update());


 // Drive Lenis with GSAP's ticker
 gsap.ticker.add((time) => {
   lenis.raf(time * 1000);
 });
 gsap.ticker.lagSmoothing(0);
}




const scene = new THREE.Scene();


const modelFrame = document.querySelector(".model-frame");
const rotateBtn = document.querySelector(".rotate-btn");
const resetBtn = document.querySelector(".reset-btn");


const camera = new THREE.PerspectiveCamera(55, 1, 0.01, 1000);


const renderer = new THREE.WebGLRenderer({
 antialias: true,
 alpha: true,
});
renderer.setClearColor(0x000000, 0);


function resizeRendererToFrame() {
 if (!modelFrame) return;
 const { width, height } = modelFrame.getBoundingClientRect();
 if (width === 0 || height === 0) return;
 renderer.setSize(width, height);
 renderer.setPixelRatio(window.devicePixelRatio);
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
if (modelContainer) {
 modelContainer.appendChild(renderer.domElement);
}


window.addEventListener("resize", resizeRendererToFrame);


const ambientLight = new THREE.AmbientLight(0xffffff, 0.75);
scene.add(ambientLight);


const mainLight = new THREE.DirectionalLight(0xffffff, 7.5);
mainLight.position.set(0.5, 7.5, 2.5);
scene.add(mainLight);


const fillLight = new THREE.DirectionalLight(0xffffff, 2.5);
fillLight.position.set(-15, 0, -5);
scene.add(fillLight);


const hemiLight = new THREE.HemisphereLight(0xffffff, 0xffffff, 1.5);
hemiLight.position.set(0, 0, 0);
scene.add(hemiLight);


function basicAnimate() {
 renderer.render(scene, camera);
 requestAnimationFrame(basicAnimate);
}
basicAnimate();


let model;
let baseYPosition = 0; // Store the base y position
let rotationEnabled = true;
let isDraggingModel = false;
let dragStartX = 0;
let dragStartRotationY = 0;


const loader = new THREE.GLTFLoader();
loader.load("./assets/chair_1.glb", function (gltf) {
 model = gltf.scene;
 model.traverse((node) => {
   if (node.isMesh) {
     // Create a new material that matches the design
     const material = new THREE.MeshStandardMaterial({
       color: 0x8c4531, // Dark gray/black to match the design
       metalness: 0.8,
       roughness: 1.7,
       envMapIntensity: 1.0
     });
    
     // Apply the material to the mesh
     node.material = material;
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


 cancelAnimationFrame(basicAnimate);
 animate();
});


const floatAmplitude = 0.2;
const floatSpeed = 1.5;
const rotationSpeed = 0.01;
let isFloating = true;
const rotationSensitivity = 0.01;
const baseTilt = 0.4;


function updateRotateButtonLabel() {
 if (!rotateBtn) return;
 rotateBtn.textContent = rotationEnabled ? "Rotate" : "Pause";
}


function toggleRotation() {
 rotationEnabled = !rotationEnabled;
 updateRotateButtonLabel();
}


if (rotateBtn) {
 rotateBtn.addEventListener("click", toggleRotation);
}


if (resetBtn) {
 resetBtn.addEventListener("click", () => {
   if (!model) return;
   gsap.to(model.rotation, {
     x: baseTilt,
     y: 0.5,
     duration: 0.6,
     ease: "power2.out",
   });
   if (!rotationEnabled) {
     toggleRotation();
   }
 });
}


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
   if (!isDraggingModel) return;
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
 const distanceMultiplier = 3.8;     // was 3.2
 const verticalOffset = maxDim * 0.3; // add some Y height


 camera.position.set(0.1, verticalOffset, maxDim * distanceMultiplier);
 camera.lookAt(0, 0, 0);
}


function playInitialAnimation() {
 if (model) {
   gsap.to(model.scale, {
     x: 2.2,
     y: 2.2,
     z: 2.2,
     duration: 1,
     ease: "power2.out",
   });
 }
}


function animate() {
 if (model) {
   if (isFloating) {
     const floatOffset =
       Math.sin(Date.now() * 0.001 * floatSpeed) * floatAmplitude;
     model.position.y = baseYPosition + floatOffset; // Add float to base position
   }


   model.rotation.x = baseTilt;
   if (rotationEnabled && !isDraggingModel) {
     model.rotation.y += rotationSpeed;
   }
 }


 renderer.render(scene, camera);
 requestAnimationFrame(animate);
}


const introSection = document.querySelector(".intro");
const archiveSection = document.querySelector(".archive");
const outroSection = document.querySelector(".outro");


const splitText = new SplitType(".outro-copy h2", {
 types: "lines",
 lineClass: "line",
});


splitText.lines.forEach((line) => {
 const text = line.innerHTML;
 line.innerHTML = `<span style="display: block; transform: translateY(70px);">${text}</span>`;
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



// Hamburger menu toggle
const hamburger = document.querySelector(".hamburger");
const navLinks = document.querySelector(".nav-links");
const navCta = document.querySelector(".nav-cta");


function toggleMenu() {
 if (!hamburger || !navLinks) return;
  const isExpanded = hamburger.getAttribute("aria-expanded") === "true";
 const newState = !isExpanded;
  hamburger.setAttribute("aria-expanded", String(newState));
 navLinks.classList.toggle("active", newState);
  if (navCta) {
   navCta.classList.toggle("active", newState);
 }
  // Prevent body scroll when menu is open
 if (newState) {
   document.body.style.overflow = "hidden";
 } else {
   document.body.style.overflow = "";
 }
}


function closeMenu() {
 if (!hamburger || !navLinks) return;
  hamburger.setAttribute("aria-expanded", "false");
 navLinks.classList.remove("active");
  if (navCta) {
   navCta.classList.remove("active");
 }
  document.body.style.overflow = "";
}


if (hamburger && navLinks) {
 // Toggle menu on hamburger click
 hamburger.addEventListener("click", (e) => {
   e.preventDefault();
   toggleMenu();
 });


 // Close menu when clicking on a link
 const navLinksItems = navLinks.querySelectorAll("a");
 navLinksItems.forEach((link) => {
   link.addEventListener("click", () => {
     closeMenu();
   });
 });


 // Close menu when clicking the CTA button
 if (navCta) {
   navCta.addEventListener("click", () => {
     closeMenu();
   });
 }


 // Close menu when clicking outside
 document.addEventListener("click", (e) => {
   // Only close if menu is active and click is outside menu elements
   if (navLinks.classList.contains("active")) {
     const clickedElement = e.target;
     const isClickInsideMenu =
       hamburger.contains(clickedElement) ||
       navLinks.contains(clickedElement) ||
       (navCta && navCta.contains(clickedElement));
    
     if (!isClickInsideMenu) {
       closeMenu();
     }
   }


// Careers modal
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
   if (modalBody && fullBody) {
     modalBody.innerHTML = fullBody.innerHTML;
   }
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
   const readMoreBtn = card.querySelector(".career-readmore");
   if (readMoreBtn) {
     readMoreBtn.addEventListener("click", () => openCareerModal(card));
   }
 });


 closeTriggers.forEach((el) => {
   el.addEventListener("click", closeCareerModal);
 });


 document.addEventListener("keydown", (event) => {
   if (event.key === "Escape" && careerModal.classList.contains("is-open")) {
     closeCareerModal();
   }
 });
}
 });


 // Close menu on window resize if it's open and we're above mobile breakpoint
 window.addEventListener("resize", () => {
   if (window.innerWidth > 640 && navLinks.classList.contains("active")) {
     closeMenu();
   }
 });
}





// Gallery scroll navigation and progress indicator
const galleryScroll = document.getElementById("galleryScroll");
const galleryPrev = document.querySelector(".gallery-nav--prev");
const galleryNext = document.querySelector(".gallery-nav--next");
const progressBar = document.querySelector(".gallery-scroll-progress-bar");


if (galleryScroll && galleryPrev && galleryNext && progressBar) {
 function updateGalleryUI() {
   const { scrollLeft, scrollWidth, clientWidth } = galleryScroll;
   const scrollPercentage = (scrollLeft / (scrollWidth - clientWidth)) * 100;
  
   // Update progress bar
   progressBar.style.width = `${scrollPercentage}%`;
  
   // Update button states
   galleryPrev.disabled = scrollLeft <= 0;
   galleryNext.disabled = scrollLeft >= scrollWidth - clientWidth - 1;
 }


 // Initial state
 updateGalleryUI();


 // Update on scroll
 galleryScroll.addEventListener("scroll", updateGalleryUI);


 // Navigation buttons
 galleryPrev.addEventListener("click", () => {
   const cardWidth = galleryScroll.querySelector(".gallery-portrait-card").offsetWidth;
   const gap = 24; // 1.5em = 24px
   galleryScroll.scrollBy({
     left: -(cardWidth + gap),
     behavior: "smooth",
   });
 });


 galleryNext.addEventListener("click", () => {
   const cardWidth = galleryScroll.querySelector(".gallery-portrait-card").offsetWidth;
   const gap = 24; // 1.5em = 24px
   galleryScroll.scrollBy({
     left: cardWidth + gap,
     behavior: "smooth",
   });
 });


 // Update on window resize
 window.addEventListener("resize", updateGalleryUI);
}


