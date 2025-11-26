const form = document.getElementById('contact-form');
const statusElement = document.getElementById('form-status');
const endpoint = '/api/contact';

const setStatus = (message, variant = 'neutral') => {
  if (!statusElement) return;
  statusElement.textContent = message;
  statusElement.classList.remove('error', 'success');
  if (variant !== 'neutral') {
    statusElement.classList.add(variant);
  }
};

const toggleFieldError = (name, hasError) => {
  const field = form?.elements.namedItem(name);
  if (!field) return;
  field.classList.toggle('error-field', hasError);
};

form?.addEventListener('submit', async (event) => {
  event.preventDefault();
  setStatus('Sending your message...');

  Array.from(form.elements)
    .filter((el) => el.name)
    .forEach((el) => el.classList.remove('error-field'));

  const formData = new FormData(form);
  const payload = Object.fromEntries(formData.entries());

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const result = await response.json();

    if (!response.ok) {
      Object.keys(result.errors || {}).forEach((key) => toggleFieldError(key, true));
      setStatus(result.message || 'Please double-check the highlighted fields.', 'error');
      return;
    }

    form.reset();
    setStatus(result.message || 'Thanks! Someone from Monce will reach out shortly.', 'success');
  } catch (error) {
    console.error('Failed to submit contact form', error);
    setStatus('Network error — please try again in a moment.', 'error');
  }
});
