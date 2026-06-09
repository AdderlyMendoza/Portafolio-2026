// ===== THEME TOGGLE =====
const html      = document.documentElement;
const themeBtn  = document.getElementById('themeBtn');
const savedTheme = localStorage.getItem('theme') || 'dark';
html.setAttribute('data-theme', savedTheme);

function setTheme(theme) {
  document.body.classList.add('theme-transitioning');
  html.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  setTimeout(() => document.body.classList.remove('theme-transitioning'), 400);
}

themeBtn?.addEventListener('click', () => {
  const current = html.getAttribute('data-theme');
  setTheme(current === 'dark' ? 'light' : 'dark');
});

// ===== NAVBAR SCROLL =====
const navbar = document.getElementById('navbar');
const hamburger = document.querySelector('.hamburger');

// rAF garantiza que el cambio de clase ocurra una única vez por frame,
// evitando CSS-transitions solapadas durante la animación de la barra del browser
let navScrollRAF;
window.addEventListener('scroll', () => {
  if (navScrollRAF) cancelAnimationFrame(navScrollRAF);
  navScrollRAF = requestAnimationFrame(() => {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  });
}, { passive: true });

hamburger?.addEventListener('click', () => navbar.classList.toggle('menu-open'));
document.querySelectorAll('.nav-mobile a').forEach(a =>
  a.addEventListener('click', () => navbar.classList.remove('menu-open'))
);

// ===== HERO CARD PARALLAX SCROLL =====
const heroCard = document.getElementById('heroCard');

function updateParallax() {
  if (!heroCard) return;
  const heroEl = document.getElementById('hero');
  const heroH = heroEl ? heroEl.offsetHeight : window.innerHeight;
  const progress = Math.min(window.scrollY / heroH, 1);

  const rotateX = progress * 45;
  const rotateY = progress * -12;
  const translateY = progress * 80;
  const scale = 1 - progress * 0.08;
  const opacity = 1 - progress * 0.85;

  heroCard.style.transform = `
    perspective(1200px)
    rotateX(${rotateX}deg)
    rotateY(${rotateY}deg)
    translateY(${translateY}px)
    scale(${scale})
  `;
  heroCard.style.opacity = Math.max(opacity, 0.15);
}

window.addEventListener('scroll', updateParallax, { passive: true });

// ===== FLOATING BADGE =====
const floatingBadge = document.getElementById('floatingBadge');
window.addEventListener('scroll', () => {
  if (!floatingBadge) return;
  const heroH = document.getElementById('hero')?.offsetHeight || window.innerHeight;
  floatingBadge.classList.toggle('visible', window.scrollY > heroH * 0.5);
}, { passive: true });

// ===== SCROLL REVEAL =====
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('revealed');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal-up, .reveal-fade, .reveal-left, .reveal-right')
  .forEach(el => revealObserver.observe(el));

// ===== COUNTER ANIMATION =====
function animateCount(el) {
  const target = parseInt(el.getAttribute('data-count'), 10);
  const duration = 1800;
  const interval = 16;
  const steps = duration / interval;
  const inc = target / steps;
  let current = 0;
  const timer = setInterval(() => {
    current += inc;
    if (current >= target) { el.textContent = target; clearInterval(timer); }
    else el.textContent = Math.floor(current);
  }, interval);
}

const counterObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCount(entry.target);
      counterObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(el => counterObs.observe(el));

// ===== SERVICES ACCORDION =====
document.querySelectorAll('.svc-item').forEach(item => {
  const header = item.querySelector('.svc-header');
  header?.addEventListener('click', () => {
    const isOpen = item.classList.contains('open');
    // close all
    document.querySelectorAll('.svc-item.open').forEach(i => i.classList.remove('open'));
    // toggle current
    if (!isOpen) item.classList.add('open');
  });
});

// ===== ANIMACIÓN HELPER (proyectos + experiencia) =====
function revealItem(el, delay = 0) {
  el.classList.remove('proj-hidden', 'exp-hidden');
  el.offsetHeight;                        // force reflow → animación arranca desde 0
  el.style.animationDelay = `${delay}ms`;
  el.classList.add('card-in');
  el.addEventListener('animationend', () => {
    el.classList.remove('card-in');
    el.style.animationDelay = '';
  }, { once: true });
}

// ===== PROYECTOS — Ver más responsivo (3 móvil / 6 desktop) =====
const allProjCards = [...document.querySelectorAll('.project-card')];
const verMasBtn    = document.getElementById('verMasBtn');
let projExpanded   = false;
let SHOW_INITIAL   = 6;

function getShowInitial() { return window.innerWidth < 768 ? 3 : 6; }

function getActiveFilter() {
  return document.querySelector('.filter-btn.active')?.dataset.filter || 'all';
}

function applyFilter(filter) {
  allProjCards.forEach(card => {
    if (card.classList.contains('proj-hidden')) return;   // no tocar las ocultas
    const matches = filter === 'all' || card.dataset.category === filter;
    card.classList.toggle('hidden', !matches);
  });
}

function initProjects() {
  SHOW_INITIAL = getShowInitial();
  // Reset estado
  allProjCards.forEach(c => c.classList.remove('proj-hidden', 'hidden', 'card-in'));
  allProjCards.slice(SHOW_INITIAL).forEach(c => c.classList.add('proj-hidden'));
  projExpanded = false;

  const extraCount = allProjCards.length - SHOW_INITIAL;
  if (verMasBtn) {
    verMasBtn.innerHTML = `Ver ${extraCount} proyectos más <span class="btn-arrow">↓</span>`;
    const wrapper = verMasBtn.closest('.projects-more');
    if (wrapper) wrapper.style.display = extraCount > 0 ? 'flex' : 'none';
  }
}

initProjects();

// Reiniciar al cambiar tamaño (solo si está contraído)
let resizeDebounce;
window.addEventListener('resize', () => {
  clearTimeout(resizeDebounce);
  resizeDebounce = setTimeout(() => { if (!projExpanded) initProjects(); }, 250);
}, { passive: true });

verMasBtn?.addEventListener('click', () => {
  projExpanded = !projExpanded;
  const extra = allProjCards.slice(SHOW_INITIAL);

  if (projExpanded) {
    const currentFilter = getActiveFilter();
    let visibleDelay = 0;
    extra.forEach(c => {
      const matches = currentFilter === 'all' || c.dataset.category === currentFilter;
      if (!matches) {
        c.classList.remove('proj-hidden');
        c.classList.add('hidden');           // fuera del filtro → ocultar con hidden
      } else {
        revealItem(c, visibleDelay * 60);    // animar solo las que coinciden
        visibleDelay++;
      }
    });
    verMasBtn.innerHTML = 'Ver menos <span class="btn-arrow">↑</span>';
  } else {
    extra.forEach(c => {
      c.classList.add('proj-hidden');
      c.classList.remove('hidden', 'card-in');
    });
    verMasBtn.innerHTML = `Ver ${extra.length} proyectos más <span class="btn-arrow">↓</span>`;
  }
});

// ===== PROJECT FILTER =====
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyFilter(btn.dataset.filter);
  });
});

// ===== EXPERIENCIA — Ver más / Ver menos =====
const EXP_INITIAL  = 2;
const allExpItems  = [...document.querySelectorAll('.timeline-item')];
const verMasExpBtn = document.getElementById('verMasExpBtn');
let   expExpanded  = false;

allExpItems.slice(EXP_INITIAL).forEach(item => item.classList.add('exp-hidden'));

verMasExpBtn?.addEventListener('click', () => {
  expExpanded = !expExpanded;
  const extra = allExpItems.slice(EXP_INITIAL);

  if (expExpanded) {
    extra.forEach((item, i) => revealItem(item, i * 90));
    verMasExpBtn.innerHTML = 'Ver menos <span class="btn-arrow">↑</span>';
  } else {
    extra.forEach(item => { item.classList.add('exp-hidden'); item.classList.remove('card-in'); });
    verMasExpBtn.innerHTML = `Ver ${extra.length} experiencias más <span class="btn-arrow">↓</span>`;
  }
});

// ===== CONTACT FORM =====
document.getElementById('contactForm')?.addEventListener('submit', e => {
  e.preventDefault();
  const btn = e.target.querySelector('button[type="submit"]');
  const nombre   = document.getElementById('nombre').value;
  const email    = document.getElementById('email').value;
  const tipo     = document.getElementById('tipo').value;
  const proyecto = document.getElementById('proyecto').value;

  const subject = encodeURIComponent(`Proyecto - ${tipo || 'Consulta'} — ${nombre}`);
  const body = encodeURIComponent(
    `Hola Adderly,\n\nNombre: ${nombre}\nEmail: ${email}\nTipo de proyecto: ${tipo}\n\nDescripción:\n${proyecto}\n\n¡Quedo atento a tu respuesta!`
  );

  btn.textContent = '¡Enviado! ✓';
  btn.style.background = '#27ae60';
  btn.disabled = true;

  setTimeout(() => {
    window.location.href = `mailto:aderly19xd@gmail.com?subject=${subject}&body=${body}`;
  }, 300);

  setTimeout(() => {
    btn.innerHTML = 'Enviar mensaje <span class="btn-arrow">→</span>';
    btn.style.background = '';
    btn.disabled = false;
    e.target.reset();
  }, 3500);
});

// ===== ACTIVE NAV ON SCROLL =====
const sections  = document.querySelectorAll('section[id]');
const navLinks  = document.querySelectorAll('.nav-links a[href^="#"]');

const sectionObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      navLinks.forEach(a => {
        a.style.color = a.getAttribute('href') === `#${entry.target.id}`
          ? 'var(--accent)' : '';
      });
    }
  });
}, { threshold: 0.45 });

sections.forEach(s => sectionObs.observe(s));

// ===== SMOOTH SCROLL ANCHORS =====
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
  });
});

// ===== IMAGE FALLBACK — remove broken img so CSS :has() releases fallback =====
function checkImg(img) {
  if (img.naturalWidth === 0) img.remove();
}
document.querySelectorAll('.hero-img, .about-photo-card img').forEach(img => {
  if (img.complete) { checkImg(img); return; }
  img.addEventListener('load',  () => checkImg(img));
  img.addEventListener('error', () => img.remove());
});

// ===== SUBTLE MOUSE PARALLAX on hero background =====
const heroBefore = document.getElementById('hero');
document.addEventListener('mousemove', e => {
  if (!heroBefore || window.scrollY > window.innerHeight) return;
  const x = (e.clientX / window.innerWidth  - 0.5) * 12;
  const y = (e.clientY / window.innerHeight - 0.5) * 10;
  heroBefore.style.setProperty('--mx', `${x}px`);
  heroBefore.style.setProperty('--my', `${y}px`);
}, { passive: true });
