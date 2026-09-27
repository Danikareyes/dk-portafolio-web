// ===================================
// MENÚ RESPONSIVE (HAMBURGUESA)
// ===================================
const navToggle = document.getElementById('navToggle');
const mainNav = document.getElementById('nav-menu');

navToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('is-open');
  navToggle.classList.toggle('is-active');
  navToggle.setAttribute('aria-expanded', isOpen);
});

// Cierra el menú automáticamente al hacer clic en un link (mejora UX en móvil)
const navLinks = mainNav.querySelectorAll('a');
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('is-open');
    navToggle.classList.remove('is-active');
    navToggle.setAttribute('aria-expanded', false);
  });
});
// ===================================
// TEMA CLARO / OSCURO
// ===================================
const themeToggle = document.getElementById('themeToggle');
const themeIcon = themeToggle.querySelector('.theme-icon');
const htmlElement = document.documentElement;

// Al cargar la página: revisa si el usuario ya eligió un tema antes
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
  htmlElement.setAttribute('data-theme', savedTheme);
  themeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
}

themeToggle.addEventListener('click', () => {
  const currentTheme = htmlElement.getAttribute('data-theme');
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

  htmlElement.setAttribute('data-theme', newTheme);
  themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';

  localStorage.setItem('theme', newTheme);
});
// ===================================
// VALIDACIÓN DEL FORMULARIO DE CONTACTO
// ===================================
const contactForm = document.getElementById('contactForm');

// Cada campo describe su propia regla de validación — agregar un campo nuevo
// en el futuro solo requiere una línea aquí, no una función nueva.
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

// Valida un solo campo y muestra/oculta su mensaje de error
function validateField(field) {
  const isValid = field.validate(field.input.value);
  field.error.textContent = isValid ? '' : field.message;
  field.input.classList.toggle('input-invalid', !isValid);
  return isValid;
}

// Valida en tiempo real, apenas el usuario sale del campo (blur)
fields.forEach(field => {
  field.input.addEventListener('blur', () => validateField(field));
});

// Valida todo al enviar
contactForm.addEventListener('submit', (event) => {
  event.preventDefault();

  const allValid = fields.every(validateField);
  if (!allValid) return;

  // Sin backend propio: abrimos el cliente de correo con los datos ya listos
  const name = fields[0].input.value;
  const email = fields[1].input.value;
  const subject = fields[2].input.value;
  const message = fields[3].input.value;

  const body = `Nombre: ${name}\nCorreo: ${email}\n\n${message}`;
  const mailtoLink = `mailto:danikreyes@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  window.location.href = mailtoLink;
  contactForm.reset();
});

// ===================================
// MARQUEE AUTOMÁTICO DE SKILLS (pausa al hover)
// ===================================
function initMarquee(track, speed = 60) {
  const items = Array.from(track.children);

  // Solo activa el marquee si hay suficientes elementos para justificarlo
  if (items.length <= 2) return;

  // Duplica las cards una vez, así el loop se ve continuo sin "salto" al reiniciar
  items.forEach(item => track.appendChild(item.cloneNode(true)));
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

// Se aplica automáticamente a las 4 categorías sin repetir código por cada una
document.querySelectorAll('.skills-cards').forEach(track => initMarquee(track));

// ===================================
// FILTRO DE PROYECTOS: buscador + botón "Todos"
// ===================================
const filterAllBtn = document.querySelector('.filter-btn[data-filter="Todos"]');
const techInput = document.getElementById('techSearchInput');
const techList = document.getElementById('techSearchList');
const projectCards = document.querySelectorAll('.project-card');
const projectsGrid = document.querySelector('.projects-grid');

// Tecnologías reales, tomadas de Skills (no solo de las cards de proyecto)
const allSkills = Array.from(document.querySelectorAll('.skill-name')).map(el => el.textContent.trim());

function renderTechList(filterText = '') {
  const matches = allSkills.filter(t => t.toLowerCase().includes(filterText.toLowerCase()));
  techList.innerHTML = matches.length
    ? matches.map(t => `<li role="option" class="tech-option">${t}</li>`).join('')
    : `<li class="tech-option tech-option-empty">Sin coincidencias</li>`;
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
  let visibleCount = 0;

  projectCards.forEach(card => {
    const cardTechs = Array.from(card.querySelectorAll('.tech-tag')).map(t => t.textContent.trim());
    const matches = tech === 'Todos' || cardTechs.includes(tech);
    card.style.display = matches ? '' : 'none';
    if (matches) visibleCount++;
  });

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


// ===================================
// TARJETAS DE PROYECTO EXPANDIBLES
// ===================================
projectsGrid.addEventListener('click', (event) => {
  const toggleBtn = event.target.closest('.project-toggle');
  if (!toggleBtn) return;

  const card = toggleBtn.closest('.project-card');
  const details = card.querySelector('.project-details');
  const isOpen = card.classList.toggle('is-expanded');

  toggleBtn.setAttribute('aria-expanded', isOpen);
  toggleBtn.querySelector('.toggle-icon').textContent = isOpen ? '▴' : '▾';
  details.style.maxHeight = isOpen ? `${details.scrollHeight}px` : null;
});