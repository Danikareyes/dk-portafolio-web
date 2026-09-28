/* ==========================================================================
   MAIN.JS — Portafolio
   1) Menú responsive        5) Filtro de proyectos + buscador
   2) Tema claro / oscuro    6) Cards de proyecto expandibles
   3) Formulario de contacto 7) Botón volver arriba
   4) Marquee de skills
   ========================================================================== */


/* ==========================================================================
   1. MENÚ RESPONSIVE
   ========================================================================== */
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('nav-menu');

function closeMenu() {
  mainNav.classList.remove('is-open');
  navToggle.classList.remove('is-active');
  navToggle.setAttribute('aria-expanded', 'false');
}

navToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('is-open');
  navToggle.classList.toggle('is-active', isOpen);
  navToggle.setAttribute('aria-expanded', isOpen);
});

// Al elegir una sección, el menú se cierra solo (importante en móvil)
mainNav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));


/* ==========================================================================
   2. TEMA CLARO / OSCURO (con localStorage)
   ========================================================================== */
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('.theme-icon');
const htmlElement = document.documentElement;

function applyTheme(theme) {
  htmlElement.setAttribute('data-theme', theme);
  themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('theme', theme);
}

const savedTheme = localStorage.getItem('theme');
if (savedTheme) applyTheme(savedTheme);

themeToggle.addEventListener('click', () => {
  const isDark = htmlElement.getAttribute('data-theme') === 'dark';
  applyTheme(isDark ? 'light' : 'dark');
});


/* ==========================================================================
   3. FORMULARIO DE CONTACTO: validación + envío
   ========================================================================== */

/* Envío real del mensaje con Web3Forms (servicio gratuito para sitios estáticos):
   1) Entra a https://web3forms.com y crea tu "access key" con tu correo.
   2) Pega la clave entre las comillas. Es pública por diseño: puede ir en el código.
   Si se deja vacía, el formulario solo valida los datos y muestra un aviso en pantalla. */
const WEB3FORMS_KEY = '';
const CONTACT_EMAIL = 'danikreyes@gmail.com';

const contactForm = document.getElementById('contactForm');
const submitBtn = contactForm.querySelector('button[type="submit"]');
const submitLabel = submitBtn.textContent;
const formStatus = document.getElementById('formStatus');

// Cada campo describe su regla: agregar uno nuevo es agregar un objeto aquí
const fields = [
  {
    input: document.getElementById('name'),
    error: document.getElementById('nameError'),
    validate: (value) => value.trim().length >= 2,
    message: 'Ingresa tu nombre completo (mínimo 2 caracteres).'
  },
  {
    input: document.getElementById('email'),
    error: document.getElementById('emailError'),
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
    message: 'Ingresa un correo electrónico válido.'
  },
  {
    input: document.getElementById('subject'),
    error: document.getElementById('subjectError'),
    validate: (value) => value.trim().length >= 3,
    message: 'El asunto debe tener al menos 3 caracteres.'
  },
  {
    input: document.getElementById('message'),
    error: document.getElementById('messageError'),
    validate: (value) => value.trim().length >= 10,
    message: 'El mensaje debe tener al menos 10 caracteres.'
  }
];

function validateField(field) {
  const isValid = field.validate(field.input.value);
  field.error.textContent = isValid ? '' : field.message;
  field.input.classList.toggle('input-invalid', !isValid);
  return isValid;
}

// type: 'success' | 'error' | 'info'
function showFormStatus(message, type) {
  formStatus.textContent = message;
  formStatus.className = `form-status is-${type}`;
}

// Validación en tiempo real al salir de cada campo
fields.forEach(field => {
  field.input.addEventListener('blur', () => validateField(field));
});

contactForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  formStatus.textContent = '';
  formStatus.className = 'form-status';

  // .map (y no .every) para que se muestren TODOS los errores a la vez
  const allValid = fields.map(validateField).every(Boolean);
  if (!allValid) return;

  const [name, email, subject, message] = fields.map(field => field.input.value.trim());

  // Sin servicio configurado: no se envía nada; se avisa con honestidad en pantalla
  if (!WEB3FORMS_KEY) {
    showFormStatus(`¡Gracias! Tus datos se validaron correctamente. Por ahora el envío automático no está activo: puedes escribirme a ${CONTACT_EMAIL}.`, 'info');
    contactForm.reset();
    return;
  }

  submitBtn.disabled = true;
  submitBtn.textContent = 'Enviando...';

  try {
    const response = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ access_key: WEB3FORMS_KEY, name, email, subject, message })
    });
    const result = await response.json();
    if (!result.success) throw new Error(result.message);

    showFormStatus('¡Mensaje enviado correctamente! Te responderé lo antes posible.', 'success');
    contactForm.reset();
  } catch (error) {
    showFormStatus(`No se pudo enviar el mensaje. Inténtalo de nuevo o escríbeme a ${CONTACT_EMAIL}.`, 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = submitLabel;
  }
});


/* ==========================================================================
   4. MARQUEE DE SKILLS (se pausa al pasar el mouse)
   ========================================================================== */
function initMarquee(track, speed = 60) {
  const items = Array.from(track.children);
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Pocas skills o usuario sin animaciones: se queda como fila estática
  if (items.length <= 2 || reduceMotion) return;

  // Se duplican las cards para que el bucle no tenga saltos.
  // Los clones se ocultan a lectores de pantalla para no leer todo dos veces.
  items.forEach(item => {
    const clone = item.cloneNode(true);
    clone.setAttribute('aria-hidden', 'true');
    track.appendChild(clone);
  });
  track.classList.add('is-marquee');

  const wrapper = track.parentElement;
  let position = 0;
  let paused = false;
  let lastTime = null;

  function step(timestamp) {
    if (lastTime === null) lastTime = timestamp;
    const delta = timestamp - lastTime;
    lastTime = timestamp;

    if (!paused) {
      position -= (speed * delta) / 1000;
      if (position <= -track.scrollWidth / 2) position = 0;
      track.style.transform = `translateX(${position}px)`;
    }
    requestAnimationFrame(step);
  }

  wrapper.addEventListener('mouseenter', () => (paused = true));
  wrapper.addEventListener('mouseleave', () => (paused = false));

  requestAnimationFrame(step);
}

document.querySelectorAll('.skills-cards').forEach(track => initMarquee(track));


/* ==========================================================================
   5. FILTRO DE PROYECTOS: botón "Todos" + buscador de tecnología
   ========================================================================== */
const filterAllBtn = document.querySelector('.filter-btn[data-filter="Todos"]');
const techInput = document.getElementById('techSearchInput');
const techList = document.getElementById('techSearchList');
const projectCards = document.querySelectorAll('.project-card');
const projectsGrid = document.querySelector('.projects-grid');

// Tecnologías tomadas de Skills. Set elimina los duplicados que crea el marquee.
const allSkills = [...new Set(
  Array.from(document.querySelectorAll('.skill-name')).map(el => el.textContent.trim())
)];

function renderTechList(filterText = '') {
  const matches = allSkills.filter(tech => tech.toLowerCase().includes(filterText.toLowerCase()));
  techList.innerHTML = matches.length
    ? matches.map(tech => `<li role="option" class="tech-option">${tech}</li>`).join('')
    : '<li class="tech-option tech-option-empty">Sin coincidencias</li>';
}

function openDropdown() {
  renderTechList(techInput.value);
  techList.hidden = false;
  techInput.setAttribute('aria-expanded', 'true');
}

function closeDropdown() {
  techList.hidden = true;
  techInput.setAttribute('aria-expanded', 'false');
}

function filterProjects(tech) {
  const wanted = tech.toLowerCase();
  let visibleCount = 0;

  projectCards.forEach(card => {
    // Se compara sin distinguir mayúsculas: "AWS" coincide con "Aws"
    const cardTechs = Array.from(card.querySelectorAll('.tech-tag')).map(tag => tag.textContent.trim().toLowerCase());
    const matches = wanted === 'todos' || cardTechs.includes(wanted);
    card.style.display = matches ? '' : 'none';
    if (matches) visibleCount++;
  });

  // Si ningún proyecto coincide, se explica en vez de mostrar una grilla vacía
  let emptyMsg = projectsGrid.querySelector('.projects-empty');
  if (visibleCount === 0) {
    if (!emptyMsg) {
      emptyMsg = document.createElement('p');
      emptyMsg.className = 'projects-empty';
      projectsGrid.appendChild(emptyMsg);
    }
    emptyMsg.textContent = `Aún no tengo proyectos publicados que usen ${tech}. ¡Pronto los habrá!`;
  } else {
    emptyMsg?.remove();
  }
}

function setActiveFilter(label) {
  filterAllBtn.classList.toggle('is-active', label === 'Todos');
  techInput.value = label === 'Todos' ? '' : label;
  filterProjects(label);
}

techInput.addEventListener('focus', openDropdown);
techInput.addEventListener('input', () => renderTechList(techInput.value));

techList.addEventListener('click', (event) => {
  const option = event.target.closest('.tech-option:not(.tech-option-empty)');
  if (!option) return;
  setActiveFilter(option.textContent);
  closeDropdown();
});

filterAllBtn.addEventListener('click', () => setActiveFilter('Todos'));

document.addEventListener('click', (event) => {
  if (!event.target.closest('.tech-search')) closeDropdown();
});


/* ==========================================================================
   6. CARDS DE PROYECTO EXPANDIBLES
   ========================================================================== */

// Al cargar: se ocultan las tecnologías que pasan el límite (data-limit) y
// se agrega la etiqueta "+N más"
document.querySelectorAll('.project-tech-list').forEach(list => {
  const limit = parseInt(list.dataset.limit, 10) || 3;
  const tags = Array.from(list.children);

  if (tags.length <= limit) return;

  tags.forEach((tag, index) => {
    if (index >= limit) tag.classList.add('tech-tag-hidden');
  });

  const moreBadge = document.createElement('li');
  moreBadge.className = 'tech-tag tech-tag-more';
  moreBadge.textContent = `+${tags.length - limit} más`;
  list.appendChild(moreBadge);
});

projectsGrid.addEventListener('click', (event) => {
  const toggleBtn = event.target.closest('.project-toggle');
  if (!toggleBtn) return;

  const card = toggleBtn.closest('.project-card');
  const details = card.querySelector('.project-details');
  const tagList = card.querySelector('.project-tech-list');
  const moreBadge = tagList.querySelector('.tech-tag-more');
  const isOpen = card.classList.toggle('is-expanded');

  tagList.querySelectorAll('.tech-tag-hidden').forEach(tag => {
    tag.classList.toggle('is-visible', isOpen);
  });
  if (moreBadge) moreBadge.style.display = isOpen ? 'none' : '';

  toggleBtn.setAttribute('aria-expanded', isOpen);
  toggleBtn.querySelector('.toggle-label').textContent = isOpen ? 'Ver menos' : 'Ver más detalles';
  toggleBtn.querySelector('.toggle-icon').textContent = isOpen ? '▴' : '▾';

  details.style.maxHeight = isOpen ? `${details.scrollHeight}px` : null;
});

window.addEventListener('resize', () => {
  document.querySelectorAll('.project-card.is-expanded .project-details')
    .forEach(details => (details.style.maxHeight = `${details.scrollHeight}px`));
});

const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  backToTop.classList.toggle('is-visible', window.scrollY > 400);
}, { passive: true });