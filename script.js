const products = [
    {
        title: "Optikai lencsés kereteink",
        img: "assets/product1.jpg",
        desc: "Acélból, acetátból és könnyű TR-90 anyagból készült kereteink klasszikus és kortárs vonalvezetésben egyaránt elérhetők. Kollekciónk széleskörű korosztályi lefedettséget biztosít, hogy optikájában minden vásárló megtalálja az ideális darabot.",
    },
    {
        title: "Acetát Előtétes Kereteink",
        img: "assets/gallery-new1.png",
        desc: "Prémium acetátból kézzel polírozott előtétes kereteink egyedi karakterrel bírnak. Élénk és visszafogott árnyalatokban, változatos formákban érhetők el – ideális választás elegáns, markáns megjelenést kereső vásárlóknak.",
    },
    {
        title: "Clip-onos Kereteink",
        img: "assets/gallery-new3.png",
        desc: "Clip-onos kereteink praktikus 2-in-1 megoldást kínálnak: a mágnesesen rögzülő napszemüveg-előtéttel egyetlen keret látja el a mindennapi és a napvédelmi funkciót. Különösen keresett termék aktív, utazó és sportos vásárlók körében.",
    },
];

const section = document.querySelector(".products");
const leftTab = section.querySelector(".product-tab.active");
const leftNum = leftTab.querySelector(".product-tab__num");
const leftLabel = leftTab.querySelector(".product-tab__label");
const titleEl = section.querySelector(".products__title");
const imgEl = section.querySelector(".products__img");
const descEl = section.querySelector(".products__desc");
const content = section.querySelector(".products__content");

let currentIdx = 0;
let isAnimating = false;
let pendingIdx = -1;

const progressDots = section.querySelectorAll(".products__dot");

const EXIT_MS = 220;
const ENTER_MS = 400;

// Jobb oszlop frissítése: mindig a két inaktív terméket mutatja
function updateRightColumn(activeIdx) {
    const count = products.length;
    const inactive = [];
    for (let i = 1; i < count; i++) inactive.push((activeIdx + i) % count);
    section
        .querySelectorAll(".products__inactive-tabs .product-tab")
        .forEach((btn, i) => {
            const pi = inactive[i];
            btn.dataset.index = pi;
            btn.querySelector(".product-tab__num").textContent = String(
                pi + 1,
            ).padStart(2, "0");
            btn.querySelector(".product-tab__label").textContent =
                products[pi].title;
        });
}

function slide(el, to, duration, easing, axis) {
    const fn = axis === "y" ? "translateY" : "translateX";
    el.style.transition = `transform ${duration}ms ${easing}, opacity ${duration}ms ease`;
    el.style.transform = `${fn}(${to}px)`;
}

function switchProduct(newIdx) {
    if (newIdx === currentIdx) return;
    if (isAnimating) {
        pendingIdx = newIdx;
        return;
    }
    isAnimating = true;
    pendingIdx = -1;

    const isMobile = window.innerWidth <= 639;
    const axis = isMobile ? "y" : "x";
    const dir = newIdx > currentIdx ? 1 : -1;
    const fn = isMobile ? "translateY" : "translateX";

    slide(content, -dir * 60, EXIT_MS, "ease", axis);
    slide(leftTab, -dir * 60, EXIT_MS, "ease", axis);
    content.style.opacity = "0";
    leftTab.style.opacity = "0";

    setTimeout(() => {
        const p = products[newIdx];
        titleEl.textContent = p.title;
        imgEl.src = p.img;
        descEl.textContent = p.desc;

        leftNum.textContent = String(newIdx + 1).padStart(2, "0");
        leftLabel.textContent = p.title;

        updateRightColumn(newIdx);
        currentIdx = newIdx;
        progressDots.forEach((dot, i) => dot.classList.toggle("active", i === newIdx));

        [content, leftTab].forEach((el) => {
            el.style.transition = "none";
            el.style.transform = `${fn}(${dir * 60}px)`;
            el.style.opacity = "0";
        });
        void content.offsetWidth;

        slide(content, 0, ENTER_MS, "cubic-bezier(0.22, 1, 0.36, 1)", axis);
        slide(leftTab, 0, ENTER_MS, "cubic-bezier(0.22, 1, 0.36, 1)", axis);
        content.style.opacity = "1";
        leftTab.style.opacity = "1";

        setTimeout(() => {
            [content, leftTab].forEach((el) => {
                el.style.transition = "";
                el.style.transform = "";
                el.style.opacity = "";
            });
            isAnimating = false;
            if (pendingIdx !== -1 && pendingIdx !== currentIdx) {
                const p = pendingIdx;
                pendingIdx = -1;
                switchProduct(p);
            }
        }, ENTER_MS);
    }, EXIT_MS);
}

// Inactive tab kattintás → görget a megfelelő termék pozíciójára
section
    .querySelectorAll(".products__inactive-tabs .product-tab")
    .forEach((tab) => {
        tab.addEventListener("click", () => {
            const idx = parseInt(tab.dataset.index, 10);
            const top =
                section.getBoundingClientRect().top +
                window.scrollY +
                idx * window.innerHeight;
            window.scrollTo({ top, behavior: "smooth" });
        });
    });

/* ===========================================
   PRODUCTS — scroll-driven termékváltás
=========================================== */
function updateProductsOnScroll() {
    const scrolled = -section.getBoundingClientRect().top;
    const sectionScrollHeight = section.offsetHeight - window.innerHeight;
    if (scrolled < 0 || scrolled >= sectionScrollHeight) return;
    const segmentSize = sectionScrollHeight / products.length;
    const newIdx = Math.min(
        Math.floor(scrolled / segmentSize),
        products.length - 1,
    );
    switchProduct(newIdx);
}

window.addEventListener("scroll", updateProductsOnScroll, { passive: true });

/* ===========================================
   STICKY HEADER
=========================================== */
const stickyHeader = document.querySelector(".sticky-header");
const heroEl = document.querySelector(".hero");

window.addEventListener(
    "scroll",
    () => {
        stickyHeader.classList.toggle(
            "visible",
            window.scrollY > heroEl.offsetHeight * 0.85,
        );
    },
    { passive: true },
);

/* ===========================================
   BACK TO TOP
=========================================== */
const backToTopBtn = document.getElementById("backToTop");
const heroSection = document.querySelector(".hero");

const aboutSection = document.querySelector(".about");
const footerSection = document.querySelector(".footer");

window.addEventListener(
    "scroll",
    () => {
        const scrollY = window.scrollY;
        const btnPageY = scrollY + window.innerHeight - 50;

        backToTopBtn.classList.toggle(
            "visible",
            scrollY > heroSection.offsetHeight * 0.5,
        );

        const onDark =
            (btnPageY >= aboutSection.offsetTop &&
                btnPageY <
                    aboutSection.offsetTop + aboutSection.offsetHeight) ||
            (btnPageY >= footerSection.offsetTop &&
                btnPageY <
                    footerSection.offsetTop + footerSection.offsetHeight);

        backToTopBtn.classList.toggle("on-dark", onDark);
    },
    { passive: true },
);

backToTopBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
});

/* ===========================================
   HAMBURGER MENU — fullscreen overlay
=========================================== */
const hamburger = document.querySelector(".hamburger");
const menuOverlay = document.querySelector(".menu-overlay");

function closeMenu() {
    hamburger.classList.remove("open");
    menuOverlay.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
    menuOverlay.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
}

if (hamburger && menuOverlay) {
    hamburger.addEventListener("click", () => {
        const isOpen = hamburger.classList.toggle("open");
        menuOverlay.classList.toggle("open", isOpen);
        hamburger.setAttribute("aria-expanded", isOpen);
        menuOverlay.setAttribute("aria-hidden", !isOpen);
        document.body.style.overflow = isOpen ? "hidden" : "";
    });

    menuOverlay.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", closeMenu);
    });
}

/* ===========================================
   GALLERY — scroll-driven cover effect
=========================================== */
const gallery = document.querySelector(".gallery");

if (gallery) {
    const cards = Array.from(gallery.querySelectorAll(".gallery__card"));

    function updateGallery() {
        const isMobile = window.innerWidth <= 639;
        // Mobilon a szöveges rész (gallery__left) magasságát is figyelembe kell venni
        const textOffset = isMobile
            ? gallery.querySelector(".gallery__left")?.offsetHeight || 0
            : 0;

        // A görgetés kezdetét eltoljuk a szöveggel
        const rect = gallery.getBoundingClientRect();
        const scrolled = -rect.top - textOffset;

        // A számításnál a viewport magasságot használjuk alapnak
        const vh = window.innerHeight * 0.8; // Mobilon kicsit érzékenyebbre vesszük

        cards.forEach((card, i) => {
            card.style.zIndex = i + 1;
            if (i === 0) {
                card.style.clipPath = "inset(0 0 0 0)";
            } else {
                const segmentStart = (i - 1) * vh;
                const progress = Math.max(
                    0,
                    Math.min(1, (scrolled - segmentStart) / vh),
                );
                const reveal = Math.round((1 - progress) * 100);
                card.style.clipPath = `inset(${reveal}% 0 0 0)`;
            }
        });
    }

    window.addEventListener("scroll", updateGallery, { passive: true });
    updateGallery();
}

