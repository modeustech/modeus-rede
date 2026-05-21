// Lenis (desktop only)
const isTouch = window.matchMedia("(pointer: coarse)").matches;


let lenis = null;

const CONSENT_STORAGE_KEY = "cookie_consent";
const consentBanner = document.querySelector(".cookie-banner");
const consentAcceptBtn = document.querySelector(".cookie-accept");
const consentRejectBtn = document.querySelector(".cookie-reject");

function updateConsentMode(consentState, persist = true) {
  const isAccepted = consentState === "accepted";
  const consentUpdate = {
    ad_storage: isAccepted ? "granted" : "denied",
    analytics_storage: isAccepted ? "granted" : "denied",
    ad_user_data: isAccepted ? "granted" : "denied",
    ad_personalization: isAccepted ? "granted" : "denied",
    functionality_storage: "granted",
    security_storage: "granted",
  };

  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", consentUpdate);
  } else if (window.dataLayer) {
    window.dataLayer.push(["consent", "update", consentUpdate]);
  }

  if (persist) {
    localStorage.setItem(CONSENT_STORAGE_KEY, consentState);
  }

  if (consentBanner) {
    consentBanner.hidden = true;
  }
}

function initCookieConsent() {
  if (!consentBanner) return;

  const savedConsent = localStorage.getItem(CONSENT_STORAGE_KEY);
  if (savedConsent === "accepted" || savedConsent === "rejected") {
    updateConsentMode(savedConsent, false);
    return;
  }

  consentBanner.hidden = false;
  if (consentAcceptBtn) {
    consentAcceptBtn.addEventListener("click", () => updateConsentMode("accepted"));
  }
  if (consentRejectBtn) {
    consentRejectBtn.addEventListener("click", () => updateConsentMode("rejected"));
  }
}

initCookieConsent();

const SIGNUP_LINK_SELECTOR = 'a[href*="orderportal.modeus.com/login?signup=yes"]';
const TRUSTED_ACCOUNT_EVENT_ORIGINS = [
  "https://orderportal.modeus.com",
  "https://test-33cae.web.app",
];
let hasTrackedAccountCreated = false;

function pushDataLayerEvent(eventName, payload = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event: eventName,
    ...payload,
  });
}

function detectLanguage() {
  return document.documentElement.lang || (window.location.pathname.startsWith("/nl") ? "nl" : "en");
}

function trackPartnerSignupClick(event) {
  const signupLink = event.target.closest(SIGNUP_LINK_SELECTOR);
  if (!signupLink) return;

  pushDataLayerEvent("sign_up_start", {
    method: "partner_portal",
    link_url: signupLink.href,
    page_path: window.location.pathname,
    page_language: detectLanguage(),
  });
}

function trackAccountCreated(source, extra = {}) {
  if (hasTrackedAccountCreated) return;
  hasTrackedAccountCreated = true;

  pushDataLayerEvent("account_created", {
    source,
    page_path: window.location.pathname,
    page_language: detectLanguage(),
    ...extra,
  });
}

function checkAccountCreatedFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const hasSuccessSignal =
    params.get("account_created") === "1" ||
    params.get("signup") === "success" ||
    params.get("registration") === "success";

  if (hasSuccessSignal) {
    trackAccountCreated("return_url");
  }
}

function initSignupTracking() {
  document.addEventListener("click", trackPartnerSignupClick);
  checkAccountCreatedFromUrl();

  window.addEventListener("message", (event) => {
    if (!TRUSTED_ACCOUNT_EVENT_ORIGINS.includes(event.origin)) return;
    if (!event.data || typeof event.data !== "object") return;

    const eventType = event.data.event || event.data.type;
    if (eventType === "account_created" || eventType === "signup_success") {
      trackAccountCreated("post_message", {
        message_origin: event.origin,
      });
    }
  });
}

initSignupTracking();

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
loader.load("/assets/chair_1.glb", function (gltf) {
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
 rotateBtn.textContent = rotationEnabled ? "Pause" : "Rotate";
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
    
     // Don't close menu if clicking on career modal buttons
     const isCareerButton = clickedElement.closest(".career-readmore") || 
                            clickedElement.closest(".career-card");
     if (!isClickInsideMenu && !isCareerButton) {
       closeMenu();
     }
   }
 });
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
     // Reset scroll position to top
     modalBody.scrollTop = 0;
   }
   if (modalApply && applyLink) {
     modalApply.href = applyLink.href;
     modalApply.textContent = applyLink.textContent || "Apply via email";
   }

   // Save current scroll position
   const scrollY = window.scrollY;
   document.body.style.top = `-${scrollY}px`;

   // Disable Lenis smooth scroll if active
   if (lenis) {
     lenis.stop();
   }

   careerModal.classList.add("is-open");
   document.body.style.overflow = "hidden";
   document.body.style.position = "fixed";
   document.body.style.width = "100%";
   
   // Store scroll position for restoration
   document.body.dataset.scrollY = scrollY;
 }


 function closeCareerModal() {
   careerModal.classList.remove("is-open");
   
   // Restore scroll position
   const scrollY = document.body.dataset.scrollY || 0;
   document.body.style.overflow = "";
   document.body.style.position = "";
   document.body.style.width = "";
   document.body.style.top = "";
   window.scrollTo(0, parseInt(scrollY || 0, 10));
   delete document.body.dataset.scrollY;
   
   // Re-enable Lenis smooth scroll if it was active
   if (lenis) {
     lenis.start();
   }
 }


 careerCards.forEach((card) => {
   const readMoreBtn = card.querySelector(".career-readmore");
   if (readMoreBtn) {
     readMoreBtn.addEventListener("click", (e) => {
       e.preventDefault();
       e.stopPropagation();
       openCareerModal(card);
     });
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


 // Close menu on window resize if it's open and we're above mobile breakpoint
 window.addEventListener("resize", () => {
   if (window.innerWidth > 640 && navLinks.classList.contains("active")) {
     closeMenu();
   }
 });





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


// Footer unmask scroll effect
const footer = document.querySelector(".site-footer");
if (footer) {
 ScrollTrigger.create({
   trigger: footer,
   start: "top bottom",
   end: "top 20%",
   scrub: 1,
   onUpdate: (self) => {
     const progress = Math.min(self.progress, 1);
     // Reveal from bottom: start at 100% (fully hidden) and reveal to 0% (fully visible)
     // The top edge of the clip moves from bottom (100%) to top (0%) as we scroll
     const topEdge = Math.max(0, 100 - (progress * 100));
     const clipPath = `polygon(0 ${topEdge}%, 100% ${topEdge}%, 100% 100%, 0 100%)`;
     footer.style.clipPath = clipPath;
   },
 });
}


// Dynamic header logo switch based on footer visibility
const nav = document.querySelector(".primary-nav");
const headerLogo = document.querySelector(".primary-nav img.logo");
const siteFooter = document.querySelector(".site-footer");

if (nav && headerLogo && siteFooter && typeof ScrollTrigger !== "undefined") {
  const greenLogo = "/assets/Modeus secondary II.png";
  const whiteLogo = "/assets/Modeus_logo_white.png"; // use svg if you have it

  ScrollTrigger.create({
    trigger: siteFooter,
    start: () => `top top+=${nav.offsetHeight}`,   // when footer reaches nav area
    end: () => `bottom top+=${nav.offsetHeight}`,  // until footer is past nav area
    onEnter: () => (headerLogo.src = whiteLogo),
    onEnterBack: () => (headerLogo.src = whiteLogo),
    onLeave: () => (headerLogo.src = greenLogo),
    onLeaveBack: () => (headerLogo.src = greenLogo),
  });
}



// Footer inline 3D chair model
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
  // Update canvas size based on container
 function resizeChairCanvas() {
   const container = chairCanvas.parentElement;
   if (!container) return;
   const computedStyle = window.getComputedStyle(container);
   const fontSize = parseFloat(computedStyle.fontSize) || 180; // Default to heading size
   const size = Math.round(fontSize * 1.2); // Scale with font size
   chairCanvas.width = size;
   chairCanvas.height = size;
   chairRenderer.setSize(size, size);
   chairRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Cap pixel ratio for performance
   chairCamera.aspect = 1;
   chairCamera.updateProjectionMatrix();
 }
  resizeChairCanvas();
 window.addEventListener("resize", resizeChairCanvas);
  // Lights
 const chairAmbientLight = new THREE.AmbientLight(0xffffff, 1);
 chairScene.add(chairAmbientLight);
  const chairDirectionalLight = new THREE.DirectionalLight(0xffffff, 2);
 chairDirectionalLight.position.set(2, 5, 3);
 chairScene.add(chairDirectionalLight);
  const chairFillLight = new THREE.DirectionalLight(0xffffff, 0.5);
 chairFillLight.position.set(-2, 0, -2);
 chairScene.add(chairFillLight);
  let chairModel = null;
 const chairLoader = new THREE.GLTFLoader();
  chairLoader.load("/assets/bar.glb", function (gltf) {
   chairModel = gltf.scene;
   chairModel.traverse((node) => {
     if (node.isMesh) {
       const material = new THREE.MeshStandardMaterial({
         color: 0xffffff,
         metalness: 0.3,
         roughness: 0.7,
       });
       node.material = material;
     }
   });
  
   const box = new THREE.Box3().setFromObject(chairModel);
   const center = box.getCenter(new THREE.Vector3());
   chairModel.position.sub(center);
  
   const size = box.getSize(new THREE.Vector3());
   const maxDim = Math.max(size.x, size.y, size.z);
  
   // Adjust scale to fit bar model - may need different scaling
   const scale = 125 / maxDim;
   chairModel.scale.set(scale, scale, scale);
  
   chairScene.add(chairModel);
  
   // Position camera - adjust distance based on model size
   const distance = maxDim * 2.5;
   chairCamera.position.set(0, 0, distance);
   chairCamera.lookAt(0, 0, 0);
   chairCamera.updateProjectionMatrix();
  
   // Re-render after model loads
   chairRenderer.render(chairScene, chairCamera);
 });
  // Auto-rotation animation
 function animateChair() {
   requestAnimationFrame(animateChair);
  
   if (chairModel) {
     chairModel.rotation.y += 0.01;
   }
  
   chairRenderer.render(chairScene, chairCamera);
 }
  animateChair();
}