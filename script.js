const products = [
  {
    title: 'Optikai lencsés kereteink',
    img:   'assets/product1.jpg',
    desc:  "Másik kisebb leíró szöveg az aktuális kép mellé. It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English.",
  },
  {
    title: 'Acetát Előtétes Kereteink',
    img:   'assets/gallery-new1.png',
    desc:  "Acetát kereteink kiváló minőségű alapanyagból készülnek. It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.",
  },
  {
    title: 'Clip-onos Kereteink',
    img:   'assets/gallery-new3.png',
    desc:  "Clip-on megoldásaink praktikus választást kínálnak mindennapi használatra. It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.",
  },
];

const section    = document.querySelector('.products');
const leftTab    = section.querySelector('.product-tab.active');
const leftNum    = leftTab.querySelector('.product-tab__num');
const leftLabel  = leftTab.querySelector('.product-tab__label');
const titleEl    = section.querySelector('.products__title');
const imgEl      = section.querySelector('.products__img');
const descEl     = section.querySelector('.products__desc');
const content    = section.querySelector('.products__content');

let currentIdx  = 0;
let isAnimating = false;
let pendingIdx  = -1;

const EXIT_MS  = 220;
const ENTER_MS = 400;

// Jobb oszlop frissítése: mindig a két inaktív terméket mutatja
function updateRightColumn(activeIdx) {
  const count = products.length;
  const inactive = [];
  for (let i = 1; i < count; i++) inactive.push((activeIdx + i) % count);
  section.querySelectorAll('.products__inactive-tabs .product-tab').forEach((btn, i) => {
    const pi = inactive[i];
    btn.dataset.index = pi;
    btn.querySelector('.product-tab__num').textContent   = String(pi + 1).padStart(2, '0');
    btn.querySelector('.product-tab__label').textContent = products[pi].title;
  });
}

function slide(el, toX, duration, easing) {
  el.style.transition = `transform ${duration}ms ${easing}, opacity ${duration}ms ease`;
  el.style.transform  = `translateX(${toX}px)`;
}

function switchProduct(newIdx) {
  if (newIdx === currentIdx) return;
  if (isAnimating) { pendingIdx = newIdx; return; }
  isAnimating = true;
  pendingIdx = -1;

  // 1 = előre (jobbról jön), -1 = vissza (balról jön)
  const dir = newIdx > currentIdx ? 1 : -1;

  // Kiúszik: tartalom + bal felirat együtt
  slide(content,  -dir * 60, EXIT_MS, 'ease');
  slide(leftTab,  -dir * 60, EXIT_MS, 'ease');
  content.style.opacity = '0';
  leftTab.style.opacity = '0';

  setTimeout(() => {
    // Tartalom frissítése
    const p = products[newIdx];
    titleEl.textContent  = p.title;
    imgEl.src            = p.img;
    descEl.textContent   = p.desc;

    // Bal felirat frissítése
    leftNum.textContent   = String(newIdx + 1).padStart(2, '0');
    leftLabel.textContent = p.title;

    // Jobb oszlop frissítése
    updateRightColumn(newIdx);
    currentIdx = newIdx;

    // Beúszás kiindulópontja (ellentétes oldal)
    [content, leftTab].forEach(el => {
      el.style.transition = 'none';
      el.style.transform  = `translateX(${dir * 60}px)`;
      el.style.opacity    = '0';
    });
    void content.offsetWidth; // force reflow

    // Beúszik
    slide(content, 0, ENTER_MS, 'cubic-bezier(0.22, 1, 0.36, 1)');
    slide(leftTab, 0, ENTER_MS, 'cubic-bezier(0.22, 1, 0.36, 1)');
    content.style.opacity = '1';
    leftTab.style.opacity = '1';

    setTimeout(() => {
      [content, leftTab].forEach(el => {
        el.style.transition = '';
        el.style.transform  = '';
        el.style.opacity    = '';
      });
      isAnimating = false;
      if (pendingIdx !== -1 && pendingIdx !== currentIdx) {
        const p = pendingIdx; pendingIdx = -1;
        switchProduct(p);
      }
    }, ENTER_MS);
  }, EXIT_MS);
}

// Inactive tab kattintás → görget a megfelelő termék pozíciójára
section.querySelectorAll('.products__inactive-tabs .product-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const idx = parseInt(tab.dataset.index, 10);
    const top = section.getBoundingClientRect().top + window.scrollY + idx * window.innerHeight;
    window.scrollTo({ top, behavior: 'smooth' });
  });
});

/* ===========================================
   PRODUCTS — scroll-driven termékváltás
=========================================== */
function updateProductsOnScroll() {
  if (window.innerWidth <= 1023) return;
  const scrolled = -section.getBoundingClientRect().top;
  const vh = window.innerHeight;
  if (scrolled < 0 || scrolled >= products.length * vh) return;
  const newIdx = Math.min(Math.floor(scrolled / vh), products.length - 1);
  switchProduct(newIdx);
}

window.addEventListener('scroll', updateProductsOnScroll, { passive: true });


/* ===========================================
   BACK TO TOP
=========================================== */
const backToTopBtn = document.getElementById('backToTop');
const heroSection  = document.querySelector('.hero');

const aboutSection  = document.querySelector('.about');
const footerSection = document.querySelector('.footer');

window.addEventListener('scroll', () => {
  const scrollY  = window.scrollY;
  const btnPageY = scrollY + window.innerHeight - 50;

  backToTopBtn.classList.toggle('visible', scrollY > heroSection.offsetHeight * 0.5);

  const onDark =
    (btnPageY >= aboutSection.offsetTop  && btnPageY < aboutSection.offsetTop  + aboutSection.offsetHeight) ||
    (btnPageY >= footerSection.offsetTop && btnPageY < footerSection.offsetTop + footerSection.offsetHeight);

  backToTopBtn.classList.toggle('on-dark', onDark);
}, { passive: true });

backToTopBtn.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


/* ===========================================
   GALLERY — scroll-driven cover effect
=========================================== */
const gallery = document.querySelector('.gallery');

if (gallery) {
  const cards = Array.from(gallery.querySelectorAll('.gallery__card'));

  function updateGallery() {
    if (window.innerWidth <= 639) return;

    const scrolled = -gallery.getBoundingClientRect().top;
    const vh = window.innerHeight;

    cards.forEach((card, i) => {
      card.style.zIndex = i + 1;
      if (i === 0) {
        card.style.clipPath = 'inset(0 0 0 0)';
      } else {
        const segmentStart = (i - 1) * vh;
        const progress = Math.max(0, Math.min(1, (scrolled - segmentStart) / vh));
        const reveal = Math.round((1 - progress) * 100);
        card.style.clipPath = `inset(${reveal}% 0 0 0)`;
      }
    });
  }

  window.addEventListener('scroll', updateGallery, { passive: true });
  updateGallery();
}
