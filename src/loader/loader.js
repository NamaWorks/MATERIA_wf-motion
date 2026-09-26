// ─── Page loader ─────────────────────────────────────────────────────────────
// Runs on the initial visit to the site (no sessionStorage transition flag).
// Two modes depending on config:
//
//   Lottie mode  — plays a Lottie animation, then fades the overlay out
//   Text mode    — animates a text label in, then fades the overlay out
//
// Both wait for window.load (or 8 s timeout) before exiting.

function _runLoader() {
  if (_config.loaderLottie && window.lottie) {
    // ─── Lottie mode ───────────────────────────────────────────────────────────
    _showOverlayInstant(_loaderOverlay, _config.loaderColor, '');

    const container = document.createElement('div');
    container.className = 'wm-lottie';
    _loaderOverlay.el.appendChild(container);

    const anim = window.lottie.loadAnimation({
      container,
      renderer: 'svg',
      loop: true,
      autoplay: true,
      path: _config.loaderLottie
    });

    function _exitLoader() {
      gsap.to(_loaderOverlay.el, {
        opacity: 0,
        duration: _config.duration,
        ease: _config.ease,
        onComplete: () => {
          anim.destroy();
          container.remove();
          _loaderOverlay.el.classList.remove('is-active');
          _isTransitioning = false;
        }
      });
    }

    if (_config.loaderWaitForLoop) {
      // Exit only after BOTH the page is ready AND the first loop completes —
      // whichever takes longer wins, so the animation is always seen in full.
      let pageReady = false;
      let loopDone = false;

      anim.addEventListener('loopComplete', () => { loopDone = true; if (pageReady) _exitLoader(); });
      _onPageReady(() => { pageReady = true; if (loopDone) _exitLoader(); });
    } else {
      _onPageReady(_exitLoader);
    }

  } else {
    // ─── Text mode ─────────────────────────────────────────────────────────────
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
}
