// ─── Page loader ─────────────────────────────────────────────────────────────
// Runs on the initial visit to the site (no sessionStorage transition flag).
// By the time this runs, _hideBody() has already made the body invisible and
// the overlay is about to cover it — so the user never sees a flash of content.
//
// Sequence:
//   1. Show overlay instantly (black, "Loading" text)
//   2. Animate the text in
//   3. Wait for window.load (or 8s timeout)
//   4. Fade the overlay out, revealing the page

function _runLoader() {
  _showOverlayInstant(_loaderOverlay, _config.loaderColor, _config.loaderText);

  gsap.set(_loaderOverlay.text, { opacity: 0, y: 15 });
  gsap.to(_loaderOverlay.text, {
    opacity: 1,
    y: 0,
    duration: _config.duration * 0.7,
    ease: _config.ease,
    delay: 0.15
  });

  _onPageReady(() => {
    _overlayOut(_loaderOverlay, () => {
      _isTransitioning = false;
    });
  });
}
