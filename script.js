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


