const OBJECTS = ['❤️', '💖', '💕', '🌸', '✨', '💝'];
const RAIN_DURATION_MS = 4000;

function createRainItem(container) {
  const item = document.createElement('span');
  item.className = 'rain-item';
  item.textContent = OBJECTS[Math.floor(Math.random() * OBJECTS.length)];

  const left = Math.random() * 100;
  const duration = 2.5 + Math.random() * 2.5;
  const size = 1.2 + Math.random() * 1.6;

  item.style.left = left + 'vw';
  item.style.animationDuration = duration + 's';
  item.style.fontSize = size + 'rem';

  item.addEventListener('animationend', () => item.remove());

  container.appendChild(item);
}

function startRain() {
  const container = document.createElement('div');
  container.className = 'rain-container';
  document.body.appendChild(container);

  const itemCount = 60;
  for (let i = 0; i < itemCount; i++) {
    createRainItem(container);
  }

  setTimeout(() => {
    container.remove();
  }, RAIN_DURATION_MS + 1000);
}

function startContinuousRain() {
  const container = document.createElement('div');
  container.className = 'rain-container';
  document.body.appendChild(container);

  createRainItem(container);
  setInterval(() => {
    createRainItem(container);
  }, 150);
}

function rectsOverlap(a, b) {
  return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
}

function dodgeButton(button, avoidElements) {
  const margin = 16;
  const width = button.offsetWidth;
  const height = button.offsetHeight;

  if (button.parentElement !== document.body) {
    const placeholder = document.createElement('div');
    placeholder.style.width = width + 'px';
    placeholder.style.height = height + 'px';
    placeholder.style.visibility = 'hidden';
    button.parentElement.insertBefore(placeholder, button);

    document.body.appendChild(button);
  }

  const avoidRects = (avoidElements || []).map((el) => el.getBoundingClientRect());

  const maxLeft = Math.max(margin, document.documentElement.clientWidth - width - margin);
  const maxTop = Math.max(margin, document.documentElement.clientHeight - height - margin);

  let randomLeft = margin;
  let randomTop = margin;
  let attempts = 0;

  do {
    randomLeft = margin + Math.random() * (maxLeft - margin);
    randomTop = margin + Math.random() * (maxTop - margin);
    attempts += 1;
  } while (
    attempts < 30 &&
    avoidRects.some((rect) => rectsOverlap(
      { left: randomLeft, right: randomLeft + width, top: randomTop, bottom: randomTop + height },
      rect
    ))
  );

  button.classList.add('jumping');
  button.style.width = width + 'px';
  button.style.height = height + 'px';
  button.style.left = randomLeft + 'px';
  button.style.top = randomTop + 'px';
}

function setupChaseButton(button, buttonA, avoidElements) {
  let armed = false;

  button.addEventListener('mouseenter', () => {
    if (armed) return;
    dodgeButton(button, avoidElements);
  });

  button.addEventListener('touchstart', () => {
    if (armed) return;
    dodgeButton(button, avoidElements);
  }, { passive: true });

  button.addEventListener('click', () => {
    if (!armed) {
      armed = true;
      button.textContent = buttonA.textContent;
      button.dataset.answer = 'a';
    }
  });
}

function setupMorphButton(button, buttonA) {
  const originalText = button.textContent;
  let armed = false;

  button.addEventListener('mouseenter', () => {
    if (armed) return;
    button.textContent = buttonA.textContent;
  });

  button.addEventListener('mouseleave', () => {
    if (armed) return;
    button.textContent = originalText;
  });

  button.addEventListener('click', () => {
    if (!armed) {
      armed = true;
      button.textContent = buttonA.textContent;
      button.dataset.answer = 'a';
    }
  });
}

function setupMusic() {
  const audio = document.getElementById('bg-audio');
  const musicButton = document.getElementById('music-btn');
  if (!audio || !musicButton) return;

  audio.addEventListener('playing', () => {
    musicButton.hidden = true;
  });

  audio.play().catch(() => {});

  musicButton.addEventListener('click', () => {
    audio.play().catch(() => {});
  });
}

const NTFY_TOPIC = 'luisapo-termin-d826e40fde';

function sendTerminAnswer(time) {
  return fetch(`https://ntfy.sh/${NTFY_TOPIC}`, {
    method: 'POST',
    headers: { Title: 'Termin-Antwort' },
    body: `Treffen um ${time} Uhr`,
  }).catch(() => {});
}

function setupTerminPage() {
  const timeInput = document.getElementById('meeting-time');
  const submitButton = document.getElementById('submit-btn');

  timeInput.addEventListener('input', () => {
    submitButton.disabled = timeInput.value === '';
  });

  submitButton.addEventListener('click', () => {
    if (timeInput.value === '') return;

    submitButton.disabled = true;
    submitButton.textContent = 'submitting...Please wait a moment';

    sendTerminAnswer(timeInput.value).finally(() => {
      window.location.href = 'yes.html';
    });
  });
}

document.addEventListener('DOMContentLoaded', () => {
  if (document.body.id === 'page-yes') {
    startContinuousRain();
    setupMusic();
    return;
  }

  if (document.body.id === 'page-termin') {
    setupTerminPage();
    return;
  }

  const answerButtons = document.querySelectorAll('.answer-btn');
  const buttonA = document.getElementById('btn-a');
  const buttonB = document.getElementById('btn-b');
  const buttonC = document.getElementById('btn-c');

  answerButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (button.dataset.answer === 'a') {
        window.location.href = 'Termin.html';
      }
    });
  });

  setupChaseButton(buttonB, buttonA, [buttonA, buttonC]);
  setupMorphButton(buttonC, buttonA);
});
