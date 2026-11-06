// ─── Page loader ─────────────────────────────────────────────────────────────
// Runs on the initial visit to the site (no sessionStorage transition flag).
// Two modes depending on config:
//
//   Lottie mode  — plays a Lottie animation, then fades the overlay out
//   Text mode    — animates a text label in, then fades the overlay out
//
// Both wait for window.load (or 8 s timeout) before exiting.
// The 8 s fallback lives in lifecycle.js (_onPageReady).

function _runLoader() {
  // Lottie mode requires both a JSON path in config AND the lottie library loaded
  // on the page. If either is missing it falls through to text mode.
  // To use Lottie: load lottie.min.js (bodymovin) via CDN before this script,
  // then pass loaderLottie: '/path/to/animation.json' to WebflowMotion.init().
  if (_config.loaderLottie && window.lottie) {
    // ─── Lottie mode ───────────────────────────────────────────────────────────
    _showOverlayInstant(_loaderOverlay, _config.loaderColor, '');

    // A dedicated div is created for lottie to render into.
    // Centering is applied as inline styles so Webflow's CSS cannot override it.
    const container = document.createElement('div');
    container.className = 'wm-lottie';
    container.style.position = 'absolute';
    container.style.top = '50%';
    container.style.left = '50%';
    container.style.transform = 'translate(-50%, -50%)';
    _loaderOverlay.el.appendChild(container);

    const anim = window.lottie.loadAnimation({
      container,
      // ⚠️  renderer: 'html' is required when the After Effects composition uses
      //     a 3D camera layer (type 13). The 'svg' renderer ignores camera layers
      //     entirely, producing a blank animation. If you re-export without a
      //     camera (Flatten to 2D in Bodymovin), you can switch back to 'svg'.
      renderer: 'html',
      // loop: true keeps the animation looping internally. The overlay exits
      // after the FIRST loop via the loopComplete event below — the user never
      // sees it loop again. We use loopComplete instead of 'complete' because
      // lottie-web does not reliably fire 'complete' for loop:false animations.
      loop: true,
      autoplay: true,
      path: _config.loaderLottie
    });

    // Fades the overlay out and cleans up once both conditions below are met.
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
      // Both conditions must be true before the overlay exits:
      //   pageReady — window load fired (or 8 s timeout passed)
      //   loopDone  — the animation completed its first full loop
      // Whichever resolves last triggers the exit, ensuring the animation is
      // always seen in full even on fast connections.
      let pageReady = false;
      let loopDone = false;

      // loopComplete fires at the end of each loop cycle.
      // With loop:true this fires reliably; with loop:false it doesn't — that's
      // why loop:true is kept above even though we only want one playthrough.
      // On first loop: freeze on the last frame so the overlay fades out over a
      // still image rather than a mid-animation frame.
      anim.addEventListener('loopComplete', () => {
        anim.goToAndStop(anim.totalFrames - 1, true); // freeze on last frame
        loopDone = true;
        if (pageReady) _exitLoader();
      });
      _onPageReady(() => { pageReady = true; if (loopDone) _exitLoader(); });
    } else {
      // loaderWaitForLoop: false — exit as soon as the page is ready,
      // regardless of where the animation is.
      _onPageReady(_exitLoader);
    }

  } else {
    // ─── Text mode ─────────────────────────────────────────────────────────────
    // Fallback when no Lottie JSON is configured or lottie.js isn't loaded.
    // Shows the loaderText string with a simple fade-in, then fades the overlay out.
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
