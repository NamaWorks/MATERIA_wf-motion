// ─── Overlay in ──────────────────────────────────────────────────────────────
// Runs when the overlay needs to appear — on exit page transitions and loader.
// If _config.animateIn is provided, delegates to that. Otherwise uses the
// default fade with an optional text slide-up.

function _overlayIn(overlay, onComplete) {
  overlay.el.classList.add('is-active');

  if (_config.animateIn) {
    _config.animateIn(overlay, onComplete || function () {});
    return;
  }

  // ─── Default fade ───────────────────────────────────────────────────────────
  const hasText = overlay.text.textContent.trim().length > 0;
  const tl = gsap.timeline({ onComplete });

  tl.to(overlay.el, {
    opacity: 1,
    duration: _config.duration,
    ease: _config.ease
  });

  if (hasText) {
    tl.to(overlay.text, {
      opacity: 1,
      y: 0,
      duration: _config.duration * 0.7,
      ease: _config.ease
    }, `-=${_config.duration * 0.5}`);
  }

  return tl;
}

// ─── Overlay out ─────────────────────────────────────────────────────────────
// Runs when the overlay needs to disappear — on entry page reveal and loader exit.
// If _config.animateOut is provided, delegates to that. Otherwise uses the
// default fade with an optional text slide-up exit.

function _overlayOut(overlay, onComplete) {
  if (_config.animateOut) {
    _config.animateOut(overlay, function () {
      overlay.el.classList.remove('is-active');
      gsap.set(overlay.el, { opacity: 0 });
      gsap.set(overlay.text, { opacity: 0, y: 15 });
      if (onComplete) onComplete();
    });
    return;
  }

  // ─── Default fade ───────────────────────────────────────────────────────────
  const hasText = overlay.text.textContent.trim().length > 0;

  const tl = gsap.timeline({
    onComplete() {
      overlay.el.classList.remove('is-active');
      gsap.set(overlay.el, { opacity: 0 });
      gsap.set(overlay.text, { opacity: 0, y: 15 });
      if (onComplete) onComplete();
    }
  });

  if (hasText) {
    tl.to(overlay.text, {
      opacity: 0,
      y: -15,
      duration: _config.duration * 0.5,
      ease: _config.ease
    });
  }

  tl.to(overlay.el, {
    opacity: 0,
    duration: _config.duration,
    ease: _config.ease
  }, hasText ? `-=${_config.duration * 0.3}` : 0);

  return tl;
}
