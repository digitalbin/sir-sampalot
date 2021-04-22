function unlockAudioContext(audioCtx) {
    if (audioCtx.state !== 'suspended') return;
    const b = document.body;
    const events = ['touchstart', 'touchend', 'mousedown', 'keydown'];
    events.forEach((e) => b.addEventListener(e, unlock, false));
    function unlock() {
        audioCtx.resume().then(clean);
    }
    function clean() {
        events.forEach((e) => b.removeEventListener(e, unlock));
    }
}

export default function createAudioContext() {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    unlockAudioContext(ctx);
    return ctx;
}
