(() => {
  const audio = new Audio('./assets/background-music.mp3');
  const segmentStart = 2 * 60 + 7;
  const segmentEnd = 3 * 60 + 3;
  audio.loop = false;
  audio.volume = 0.45;
  audio.preload = 'auto';
  const button = document.createElement('button');
  button.type = 'button';
  button.className = 'music-toggle';
  button.title = 'Beauty and a Beat · Justin Bieber ft. Nicki Minaj';
  document.body.append(button);
  let manuallyPaused = false;
  let unavailable = false;
  function seekToSegment() {
    if (audio.currentTime < segmentStart || audio.currentTime >= segmentEnd) {
      audio.currentTime = segmentStart;
    }
  }
  audio.addEventListener('loadedmetadata', seekToSegment);
  audio.addEventListener('timeupdate', () => {
    if (audio.currentTime >= segmentEnd) audio.currentTime = segmentStart;
  });
  audio.addEventListener('ended', () => {
    audio.currentTime = segmentStart;
    void play();
  });
  function update() {
    const playing = !audio.paused;
    button.textContent = playing ? '♫ Tắt nhạc' : '♫ Bật nhạc';
    button.setAttribute('aria-label', playing ? 'Tắt nhạc nền' : 'Bật nhạc nền');
    button.setAttribute('aria-pressed', String(playing));
  }
  async function play() {
    if (manuallyPaused || !audio.paused) return;
    if (unavailable) {
      unavailable = false;
      audio.load();
    }
    try {
      if (audio.readyState >= 1) seekToSegment();
      await audio.play();
      if (manuallyPaused) audio.pause();
    } catch (error) {
      button.title = error.name === 'NotAllowedError'
        ? 'Trình duyệt yêu cầu bạn bấm Bật nhạc để phát âm thanh.'
        : 'Chưa phát được nhạc. Bấm để thử lại.';
    } finally {
      if (!unavailable) update();
    }
  }
  audio.addEventListener('play', update);
  audio.addEventListener('pause', update);
  audio.addEventListener('error', () => {
    unavailable = true;
    button.textContent = '♫ Không tải được nhạc';
    button.setAttribute('aria-label', 'Không tải được nhạc nền');
    button.setAttribute('aria-pressed', 'false');
    button.title = 'Không đọc được assets/background-music.mp3. Bấm để thử lại.';
  });
  button.addEventListener('click', () => {
    if (audio.paused) {
      manuallyPaused = false;
      void play();
    } else {
      manuallyPaused = true;
      audio.pause();
    }
  });
  function startOnGesture(event) {
    if (!button.contains(event.target)) void play();
  }
  document.addEventListener('click', startOnGesture);
  document.addEventListener('keydown', startOnGesture);
  update();
  void play();
})();
