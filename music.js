(() => {
  // The garden shares the audio owned by the outer page.
  if (window.name === 'flower-garden-continuous-music' && window.parent !== window) {
    const resume = () => window.parent.postMessage('flowers:resume-music', '*');
    document.addEventListener('click', resume, true);
    document.addEventListener('touchend', resume, { passive: true });
    document.addEventListener('keydown', resume, true);
    return;
  }

  const audio = new Audio('./assets/background-music.mp3');
  const segmentStart = 127;
  const segmentEnd = 183;
  audio.volume = 0.45;
  audio.preload = 'auto';
  function seekToSegment() {
    if (audio.currentTime < segmentStart || audio.currentTime >= segmentEnd) {
      audio.currentTime = segmentStart;
    }
  }
  async function play() {
    if (!audio.paused) return;
    try {
      if (audio.readyState >= 1) seekToSegment();
      await audio.play();
    } catch {
      // Sound is retried on the next gesture if autoplay is blocked.
    }
  }
  audio.addEventListener('loadedmetadata', seekToSegment);
  audio.addEventListener('timeupdate', seekToSegment);
  audio.addEventListener('ended', () => {
    audio.currentTime = segmentStart;
    void play();
  });
  document.addEventListener('click', play, true);
  document.addEventListener('touchend', play, { passive: true });
  document.addEventListener('keydown', play, true);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) void play();
  });
  window.addEventListener('pageshow', play);
  void play();

  const gardenLink = document.querySelector('a.garden-link');
  if (!gardenLink) return;
  let frame;
  let previousFocus;
  function showGarden() {
    if (frame) return;
    previousFocus = document.activeElement;
    frame = document.createElement('iframe');
    frame.name = 'flower-garden-continuous-music';
    frame.className = 'garden-frame';
    frame.title = 'Vườn hoa dành tặng bạn';
    frame.allow = 'autoplay';
    frame.src = gardenLink.href;
    document.body.classList.add('viewing-garden');
    const main = document.querySelector('main');
    if (main) main.inert = true;
    document.body.append(frame);
    frame.addEventListener('load', () => frame.focus());
  }
  function syncGarden() {
    if (location.hash === '#garden') showGarden();
    else if (frame) {
      frame.remove();
      frame = null;
      document.body.classList.remove('viewing-garden');
      const main = document.querySelector('main');
      if (main) main.inert = false;
      previousFocus?.focus();
    }
  }
  gardenLink.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    void play();
    location.hash = 'garden';
    showGarden();
  });
  window.addEventListener('hashchange', syncGarden);
  window.addEventListener('message', event => {
    if (frame && event.source === frame.contentWindow && event.data === 'flowers:resume-music') void play();
  });
  syncGarden();
})();
