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