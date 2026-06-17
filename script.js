/* ============================================================
   Pushkar Jain — Interactive CV · script.js
   Customised for Zypit
   ============================================================ */

(function () {
  'use strict';

  /* ───────────────────────────────────────────────
     1. VIDEO PLAYER
  ─────────────────────────────────────────────── */
  const video        = document.getElementById('main-video');
  const playOverlay  = document.getElementById('play-overlay');
  const overlayBtn   = document.getElementById('play-overlay-btn');
  const ctrlPlay     = document.getElementById('ctrl-play');
  const iconPlay     = document.getElementById('icon-play');
  const iconPause    = document.getElementById('icon-pause');
  const ctrlMute     = document.getElementById('ctrl-mute');
  const iconVol      = document.getElementById('icon-vol');
  const volumeSlider = document.getElementById('volume-slider');
  const progressBar  = document.getElementById('progress-bar');
  const progressFill = document.getElementById('progress-fill');
  const timeDisplay  = document.getElementById('time-display');
  const ctrlFS       = document.getElementById('ctrl-fullscreen');
  const videoWrapper = document.getElementById('video-wrapper');

  /* Helper: format seconds → m:ss */
  function fmtTime(s) {
    if (isNaN(s) || !isFinite(s)) return '0:00';
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  }

  /* Toggle play/pause state */
  function setPlaying(playing) {
    if (playing) {
      iconPlay.style.display  = 'none';
      iconPause.style.display = '';
      playOverlay.classList.add('hidden');
    } else {
      iconPlay.style.display  = '';
      iconPause.style.display = 'none';
      playOverlay.classList.remove('hidden');
    }
  }

  /* Play / Pause */
  function togglePlay() {
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  }

  overlayBtn.addEventListener('click', togglePlay);
  ctrlPlay.addEventListener('click', togglePlay);
  video.addEventListener('play',  () => setPlaying(true));
  video.addEventListener('pause', () => setPlaying(false));
  video.addEventListener('ended', () => setPlaying(false));

  /* Click on the video area toggles play */
  videoWrapper.addEventListener('click', (e) => {
    if (e.target === video) togglePlay();
  });

  /* Time update → progress bar & display */
  video.addEventListener('timeupdate', () => {
    if (!video.duration) return;
    const pct = (video.currentTime / video.duration) * 100;
    progressFill.style.width = pct + '%';
    timeDisplay.textContent  = `${fmtTime(video.currentTime)} / ${fmtTime(video.duration)}`;
  });

  /* Metadata loaded → show total duration */
  video.addEventListener('loadedmetadata', () => {
    timeDisplay.textContent = `0:00 / ${fmtTime(video.duration)}`;
  });

  /* Click on progress bar → seek */
  progressBar.addEventListener('click', (e) => {
    const rect = progressBar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    video.currentTime = ratio * video.duration;
  });

  /* Drag on progress bar */
  let dragging = false;
  progressBar.addEventListener('mousedown', () => { dragging = true; });
  document.addEventListener('mousemove', (e) => {
    if (!dragging) return;
    const rect = progressBar.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    progressFill.style.width = (ratio * 100) + '%';
    video.currentTime = ratio * video.duration;
  });
  document.addEventListener('mouseup', () => { dragging = false; });

  /* Mute / Unmute */
  ctrlMute.addEventListener('click', () => {
    video.muted = !video.muted;
    updateVolIcon();
  });

  volumeSlider.addEventListener('input', () => {
    video.volume = parseFloat(volumeSlider.value);
    video.muted  = video.volume === 0;
    updateVolIcon();
  });

  function updateVolIcon() {
    if (video.muted || video.volume === 0) {
      iconVol.querySelector('path').setAttribute('d',
        'M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z');
    } else {
      iconVol.querySelector('path').setAttribute('d',
        'M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z');
    }
  }

  /* Keyboard shortcuts */
  document.addEventListener('keydown', (e) => {
    // Only trigger if not focused on an input/button
    if (['INPUT', 'BUTTON', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) return;
    if (e.code === 'Space') { e.preventDefault(); togglePlay(); }
    if (e.code === 'ArrowRight') { video.currentTime = Math.min(video.currentTime + 5, video.duration); }
    if (e.code === 'ArrowLeft')  { video.currentTime = Math.max(video.currentTime - 5, 0); }
    if (e.code === 'KeyM')       { video.muted = !video.muted; updateVolIcon(); }
    if (e.code === 'KeyF')       { requestFullscreen(); }
  });

  /* Fullscreen */
  function requestFullscreen() {
    if (videoWrapper.requestFullscreen)       videoWrapper.requestFullscreen();
    else if (videoWrapper.webkitRequestFullscreen) videoWrapper.webkitRequestFullscreen();
  }
  ctrlFS.addEventListener('click', requestFullscreen);

  /* ───────────────────────────────────────────────
     2. PROJECT FILTER TABS
  ─────────────────────────────────────────────── */
  const filterTabs = document.querySelectorAll('.filter-tab');
  const projectCards = document.querySelectorAll('.project-card');

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      // Update active tab
      filterTabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      const filter = tab.dataset.filter;

      projectCards.forEach(card => {
        const tags = card.dataset.tags || '';
        const show = filter === 'all' || tags.includes(filter);
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        if (show) {
          card.style.opacity   = '1';
          card.style.transform = 'translateY(0)';
          card.style.display   = '';
        } else {
          card.style.opacity   = '0';
          card.style.transform = 'translateY(12px)';
          setTimeout(() => { if (!tags.includes(filter) && filter !== 'all') card.style.display = 'none'; }, 320);
        }
      });
    });
  });

  /* ───────────────────────────────────────────────
     3. INTERSECTION OBSERVER — Scroll Animations
  ─────────────────────────────────────────────── */
  const animTargets = document.querySelectorAll(
    '.timeline-item, .skill-category, .project-card, .info-card, .match-card'
  );

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Stagger each visible element
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, 80 * (Array.from(animTargets).indexOf(entry.target) % 5));
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  animTargets.forEach(el => observer.observe(el));

  /* ───────────────────────────────────────────────
     4. SMOOTH NAV ACTIVE STATE
  ─────────────────────────────────────────────── */
  const sections = document.querySelectorAll('section[id], .zypit-section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.style.color = '';
          link.style.background = '';
          if (link.getAttribute('href') === `#${entry.target.id}`) {
            link.style.color = 'var(--violet-light)';
            link.style.background = 'var(--violet-dim)';
          }
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(sec => navObserver.observe(sec));

  /* ───────────────────────────────────────────────
     5. CURSOR GLOW TRAIL (subtle, non-distracting)
  ─────────────────────────────────────────────── */
  const glow = document.createElement('div');
  glow.style.cssText = `
    position: fixed;
    pointer-events: none;
    z-index: 9999;
    width: 300px; height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 70%);
    transform: translate(-50%, -50%);
    transition: left 0.08s linear, top 0.08s linear;
    left: -200px; top: -200px;
  `;
  document.body.appendChild(glow);

  document.addEventListener('mousemove', (e) => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  });

  /* ───────────────────────────────────────────────
     6. ZYPIT BADGE TOOLTIP — welcoming interaction
  ─────────────────────────────────────────────── */
  const badge = document.querySelector('.zypit-badge');
  badge.title = '👋 This CV was crafted exclusively for the Zypit team!';
  badge.style.cursor = 'pointer';
  badge.addEventListener('click', () => {
    const el = document.getElementById('why-zypit');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  });

  /* ───────────────────────────────────────────────
     7. INITIAL STATE — ensure video overlay visible
  ─────────────────────────────────────────────── */
  setPlaying(false);

  /* ───────────────────────────────────────────────
     8. PAGE LOAD — title animation
  ─────────────────────────────────────────────── */
  document.title = '⚡ Pushkar Jain × Zypit — Full-Stack & AI Developer';

  console.log('%c 👋 Hey Zypit Team! ', 'background:#8B5CF6;color:white;font-size:18px;font-weight:bold;padding:8px 16px;border-radius:8px;');
  console.log('%c Welcome to Pushkar\'s interactive CV! ', 'color:#06B6D4;font-size:13px;');

})();
