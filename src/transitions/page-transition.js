// ─── URL resolution ───────────────────────────────────────────────────────────
// Resolves a potentially relative href against the current page.
// Uses document.baseURI so it respects any <base> tag and correctly handles
// both .html file paths and clean URLs (e.g. /about, /work).

function _resolveUrl(href) {
  return new URL(href, document.baseURI).href;
}

// ─── Page name from URL ───────────────────────────────────────────────────────
// Derives a human-readable page name from a URL path.
// /about → "About", /our-work → "Our work"
// Falls back to "Home" for the root path, empty string on parse error.

function _pageNameFromUrl(href) {
  try {
    const { pathname } = new URL(_resolveUrl(href));
    const segment = pathname.replace(/\/$/, '').split('/').pop();
    if (!segment) return 'Home';
    return segment.charAt(0).toUpperCase() + segment.slice(1).replace(/[-_]/g, ' ');
  } catch {
    return '';
  }
}

// ─── Internal link detection ──────────────────────────────────────────────────
// Returns true only for links that should trigger a page transition.
// Ignores: external URLs, hash anchors, mailto/tel/javascript, new-tab links.

function _isInternalLink(el) {
  if (!el || el.tagName !== 'A') return false;
  const href = el.getAttribute('href');
  if (!href || /^(#|mailto:|tel:|javascript:)/i.test(href)) return false;
  if (el.target === '_blank') return false;
  try {
    return new URL(_resolveUrl(href)).origin === window.location.origin;
  } catch {
    return false;
  }
}

// ─── Click handler ────────────────────────────────────────────────────────────
// Attached to document so it catches dynamically added links (e.g. CMS items).
// Bails out early for modifier keys so browser-native behaviour is preserved
// (Cmd+click opens in a new tab, Shift+click opens in a new window, etc.).

function _handleClick(e) {
  if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
  if (_isTransitioning) return;

  const link = e.target.closest('a');
  if (!_isInternalLink(link)) return;

  const href = link.getAttribute('href');
  const resolvedHref = _resolveUrl(href);
  const dest = new URL(resolvedHref).pathname;
  if (dest === window.location.pathname) return;

  e.preventDefault();
  _isTransitioning = true;

  const pageName = link.getAttribute('data-page') || _pageNameFromUrl(href);

  _setOverlayColor(_transitionOverlay, _config.transitionColor);
  _setOverlayText(_transitionOverlay, _config.showPageName ? pageName : '');
  gsap.set(_transitionOverlay.text, { opacity: 0, y: 15 });

  _overlayIn(_transitionOverlay, () => {
    sessionStorage.setItem('wm_transition', JSON.stringify({
      pageName,
      color: _config.transitionColor,
      timestamp: Date.now()
    }));
    window.location.href = resolvedHref;
  });
}

// ─── Entry reveal ─────────────────────────────────────────────────────────────
// Called on the destination page. Reads the sessionStorage flag set by the
// EXIT page, shows the overlay instantly (matching color and page name),
// holds briefly so the user registers the page name, then fades out.
// Returns true if a transition entry was handled, false if not (loader runs instead).

function _revealOnEntry() {
  const raw = sessionStorage.getItem('wm_transition');
  sessionStorage.removeItem('wm_transition');
  if (!raw) return false;

  let data;
  try { data = JSON.parse(raw); } catch { return false; }

  if (Date.now() - data.timestamp > 10000) return false;

  const pageName = data.pageName || '';
  const color = data.color || _config.transitionColor;

  _showOverlayInstant(_transitionOverlay, color, _config.showPageName ? pageName : '');

  const hold = _config.showPageName ? 0.4 : 0;
  gsap.delayedCall(hold, () => {
    _overlayOut(_transitionOverlay, () => {
      _isTransitioning = false;
    });
  });

  return true;
}

// ─── Init ─────────────────────────────────────────────────────────────────────
// Attaches the click listener. Called once from init.js setup().

function _initTransitions() {
  document.addEventListener('click', _handleClick);

  // When the browser restores this page from bfcache (back/forward button),
  // the overlay is frozen at full opacity from the transition that preceded
  // the navigation — reset and fade it out so the page is usable again.
  window.addEventListener('pageshow', (e) => {
    if (!e.persisted || !_transitionOverlay) return;
    _isTransitioning = false;
    _overlayOut(_transitionOverlay);
  });
}
