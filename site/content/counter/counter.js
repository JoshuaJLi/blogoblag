// state (attempt to restore from localStorage)
let c = 0;
let r = 0;

const countEl = document.getElementById("count");
const roundEl = document.getElementById("round");
const roundTargetEl = document.getElementById("roundTarget");
const stitchEl = document.getElementById("stitch");

function loadState() {
  try {
    const sc = parseInt(localStorage.getItem('counter.count'), 10);
    if (Number.isFinite(sc) && sc >= 0) c = sc;
    const sr = parseInt(localStorage.getItem('counter.round'), 10);
    if (Number.isFinite(sr) && sr >= 0) r = sr;
    const sStitch = localStorage.getItem('counter.stitch');
    if (sStitch !== null) stitchEl.value = sStitch;
    const sRoundTarget = localStorage.getItem('counter.roundTarget');
    if (sRoundTarget !== null) roundTargetEl.value = sRoundTarget;
  } catch (e) {
    // ignore storage errors
    console.warn('loadState failed', e);
  }
}

function saveState() {
  try {
    localStorage.setItem('counter.count', String(c));
    localStorage.setItem('counter.round', String(r));
    localStorage.setItem('counter.stitch', String(stitchEl.value));
    localStorage.setItem('counter.roundTarget', String(roundTargetEl.value));
  } catch (e) {
    console.warn('saveState failed', e);
  }
}

function parseStitch() {
  const v = parseInt(stitchEl.value, 10);
  return Number.isFinite(v) && v > 0 ? v : 0;
}

function parseRoundTarget() {
  const v = parseInt(roundTargetEl.value, 10);
  return Number.isFinite(v) && v > 0 ? v : 0;
}

// Audio: create/resume AudioContext on first use and play a short beep
let audioCtx = null;
function playBeep(duration = 0.12, frequency = 880, volume = 0.2) {
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    // resume in case the context is suspended (browser autoplay policies)
    audioCtx.resume().then(() => {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = "sine";
      o.frequency.value = frequency;
      g.gain.value = volume;
      o.connect(g);
      g.connect(audioCtx.destination);
      o.start();
      // fade out quickly
      g.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);
      o.stop(audioCtx.currentTime + duration + 0.02);
    }).catch(() => {});
  } catch (e) {
    console.warn("beep failed", e);
  }
}

// load saved values and keep displayed values in sync initially
loadState();
countEl.textContent = c;
roundEl.textContent = r;

// save when inputs change
stitchEl.addEventListener('input', () => saveState());
roundTargetEl.addEventListener('input', () => saveState());

function onSpace() {
  c++;
  const stitchCount = parseStitch();
  if (stitchCount > 0 && c >= stitchCount) {
    // reached a full round
    r++;
    c = 0;
    roundEl.textContent = r;
    // play a short beep to signal the round/stitch target reached
    playBeep();
    // if round target is set and reached, play a separate sound
    const roundTarget = parseRoundTarget();
    if (roundTarget > 0 && r >= roundTarget) {
      // lower pitch longer beep to differentiate
      playBeep(0.28, 440, 0.28);
    }
  }
  countEl.textContent = c;
  saveState();
}

function onBackspace() {
  if (c > 0) {
    c--;
  } else {
    // if count is already 0, allow backing up a round (optional behavior)
    const stitchCount = parseStitch();
    if (r > 0 && stitchCount > 0) {
      r--;
      c = stitchCount - 1;
      roundEl.textContent = r;
    }
  }
  countEl.textContent = c;
  saveState();
}

// Key handling
document.addEventListener("keydown", (e) => {
  if (e.code === "Space") {
    // if the stitch or round target input is focused, ignore space to allow normal typing there
    if (document.activeElement === stitchEl || document.activeElement === roundTargetEl) return;
    e.preventDefault();
    onSpace();
  }

  if (e.code == "Backspace") {
    // If the stitch or round target input is focused, allow normal Backspace behaviour there
    if (document.activeElement === stitchEl || document.activeElement === roundTargetEl) {
      return;
    }
    e.preventDefault();
    onBackspace();
  }
});
