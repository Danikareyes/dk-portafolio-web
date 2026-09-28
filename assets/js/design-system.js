const tokenElements = document.querySelectorAll('[data-token]');

function renderTokenValues() {
  const styles = getComputedStyle(document.documentElement);
  tokenElements.forEach(element => {
    element.textContent = styles.getPropertyValue(element.dataset.token).trim();
  });
}

renderTokenValues();
new MutationObserver(renderTokenValues)
  .observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
window.addEventListener('resize', renderTokenValues);