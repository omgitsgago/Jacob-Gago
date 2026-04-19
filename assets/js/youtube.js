'use strict';

// ============================================================
//   JACOB GAGO — youtube.js
//
//   HOW TO UPDATE YOUR VIDEOS:
//   1. Go to youtube.com/@jacobgago
//   2. Click any video
//   3. Copy the ID from the URL: youtube.com/watch?v=VIDEO_ID_HERE
//   4. Paste it into the VIDEOS array below, replacing VIDEO_ID_N
//   5. Also update the title field to match the video title
// ============================================================

const VIDEOS = [
  {
    id:    'Y6FH8gLGnZU',
    title: 'MAKE FLYING REAL | Thrustmaster TCA Captain X Airbus Edition Review | Microsoft Flight Simulator'
  },
  {
    id:    'vzBnOcwvzRY',
    title: "DON'T MAKE A MISTAKE! Ryzen 9 9950X3D vs Intel Core Ultra 9 285K | Hands-On Real World Test"
  },
  {
    id:    '6KQvzt2VIrc',
    title: 'This Keyboard Feels Like Cheating\u2026 ATK Hex80 Hall Effect Review'
  }
];

const CHANNEL_URL = 'https://www.youtube.com/@JacobGagoOfficial';

function thumbUrl(id, quality) {
  return `https://img.youtube.com/vi/${id}/${quality}.jpg`;
}

function videoUrl(id) {
  return `https://www.youtube.com/watch?v=${id}`;
}

const PLAY_ICON_SVG = `
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
    <path d="M5 3.5l10 5.5-10 5.5V3.5z" fill="#d4a24c"/>
  </svg>
`;

function createCard(video, index) {
  const isPlaceholder = video.id.startsWith('VIDEO_ID_');

  const a = document.createElement('a');
  a.className = 'video-card fade-up';
  a.href      = isPlaceholder ? CHANNEL_URL : videoUrl(video.id);
  a.target    = '_blank';
  a.rel       = 'noopener noreferrer';
  a.setAttribute('aria-label', isPlaceholder ? 'Visit YouTube channel' : `Watch: ${video.title}`);
  a.style.transitionDelay = `${index * 0.09}s`;

  const img = document.createElement('img');
  img.className = 'video-thumbnail';
  img.alt       = video.title;
  img.loading   = 'lazy';

  if (isPlaceholder) {
    // Render a dark placeholder tile when IDs haven't been filled in yet
    img.src = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='640' height='360'%3E%3Crect width='640' height='360' fill='%23111'/%3E%3Ctext x='320' y='185' font-family='sans-serif' font-size='13' fill='%23444' text-anchor='middle'%3EAdd video ID in youtube.js%3C/text%3E%3C/svg%3E`;
  } else {
    img.src = thumbUrl(video.id, 'maxresdefault');
    img.onerror = function () {
      if (!this.dataset.fallback) {
        this.dataset.fallback = '1';
        this.src = thumbUrl(video.id, 'hqdefault');
      }
    };
  }

  const play = document.createElement('div');
  play.className   = 'video-play';
  play.innerHTML   = PLAY_ICON_SVG;

  const overlay = document.createElement('div');
  overlay.className = 'video-overlay';

  const title = document.createElement('p');
  title.className   = 'video-title';
  title.textContent = video.title;

  overlay.appendChild(title);

  a.appendChild(img);
  a.appendChild(play);
  a.appendChild(overlay);

  return a;
}

function initVideoGrid() {
  const grid = document.getElementById('video-grid');
  if (!grid) return;

  grid.innerHTML = '';

  const fragment = document.createDocumentFragment();
  VIDEOS.forEach((video, i) => {
    fragment.appendChild(createCard(video, i));
  });
  grid.appendChild(fragment);

  // Register cards with the scroll observer from main.js.
  // main.js is deferred and runs after youtube.js (both defer, source order matters),
  // so by the time this rAF fires, window.scrollObserver is defined.
  requestAnimationFrame(() => {
    grid.querySelectorAll('.fade-up').forEach(el => {
      if (window.scrollObserver) {
        window.scrollObserver.observe(el);
      } else {
        el.classList.add('is-visible');
      }
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initVideoGrid);
} else {
  initVideoGrid();
}
