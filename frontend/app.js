const API_BASE = (function () {
  // Allow quick override via env or use localhost default
  if (window.__API_BASE__) return window.__API_BASE__;
  return 'http://localhost:5000/api';
})();

const summaryCards = document.getElementById('summaryCards');
const plansGrid = document.getElementById('plansGrid');
const classesGrid = document.getElementById('classesGrid');
const trainersGrid = document.getElementById('trainersGrid');
const membershipForm = document.getElementById('membershipForm');
const formMessage = document.getElementById('formMessage');
const apiStatus = document.getElementById('apiStatus');

const money = (value) => `$${value}`;

async function fetchJson(url) {
  const response = await fetch(`${API_BASE}${url}`);
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}

async function checkApiHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`);
    if (!res.ok) throw new Error('unhealthy');
    const data = await res.json();
    apiStatus.hidden = true;
    return data;
  } catch (err) {
    if (apiStatus) {
      apiStatus.hidden = false;
      apiStatus.textContent = 'Unable to reach gym backend — some features may be unavailable.';
    }
    console.error('API health check failed', err);
    return null;
  }
}

function renderSummary(summary) {
  const cards = [
    { label: 'Members', value: summary.totalMembers },
    { label: 'Active members', value: summary.activeMembers },
    { label: 'Classes', value: summary.totalClasses },
    { label: 'Monthly revenue', value: money(summary.monthlyRevenue) },
  ];

  summaryCards.innerHTML = cards
    .map(
      (card) => `
        <div class="metric-card">
          <span>${card.label}</span>
          <strong>${card.value}</strong>
        </div>
      `
    )
    .join('');
}

function renderPlans(plans) {
  plansGrid.innerHTML = plans
    .map(
      (plan, index) => `
        <article class="plan-card ${index === 1 ? 'highlight' : ''}">
          <h3>${plan.name}</h3>
          <div class="price-tag">
            <strong>${money(plan.price)}</strong>
            <span>/mo</span>
          </div>
          <p>${plan.description}</p>
          <ul class="plan-features">
            ${plan.features.map((feature) => `<li>${feature}</li>`).join('')}
          </ul>
          <a href="#join" class="primary-btn">Choose ${plan.name}</a>
        </article>
      `
    )
    .join('');
}

function renderClasses(classes) {
  classesGrid.innerHTML = classes
    .map(
      (classItem) => `
        <article class="class-card">
          <span class="pill">${classItem.day}</span>
          <h3>${classItem.name}</h3>
          <p>Led by ${classItem.coach}</p>
          <div class="class-meta">
            <span>${classItem.time}</span>
            <span>${classItem.enrolled}/${classItem.capacity}</span>
          </div>
          <a href="#join" class="secondary-btn">Book a spot</a>
        </article>
      `
    )
    .join('');
}

function renderTrainers(trainers) {
  trainersGrid.innerHTML = trainers
    .map(
      (trainer) => `
        <article class="trainer-card-item">
          <div class="rating">★ ${trainer.rating}</div>
          <h3>${trainer.name}</h3>
          <p>${trainer.specialty}</p>
          <p>Experience: ${trainer.experience}</p>
        </article>
      `
    )
    .join('');
}

async function loadInitialData() {
  try {
    await checkApiHealth();
    const [summary, plans, classes, trainers] = await Promise.all([
      fetchJson('/dashboard/summary'),
      fetchJson('/plans'),
      fetchJson('/classes'),
      fetchJson('/trainers'),
    ]);

    renderSummary(summary);
    renderPlans(plans);
    renderClasses(classes);
    renderTrainers(trainers);
  } catch (error) {
    console.error('Failed to load gym data:', error);
    formMessage.textContent = 'The gym API is not available right now.';
  }
}

membershipForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  formMessage.textContent = '';

  const formData = new FormData(membershipForm);
  const payload = {
    name: formData.get('name'),
    email: formData.get('email'),
    plan: formData.get('plan'),
    goal: formData.get('goal'),
    phone: 'Not provided',
  };

  try {
    const response = await fetch(`${API_BASE}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Unable to sign up.');
    }

    formMessage.textContent = 'Your membership request has been received. Our team will contact you soon.';
    membershipForm.reset();
  } catch (error) {
    formMessage.textContent = error.message;
  }
});

loadInitialData();
