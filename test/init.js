WebflowMotion.init({
  loader: document.body.dataset.loader === 'true',
  pageTransitions: true,
  showPageName: false,
  animateIn: WebflowMotion.presets.curtain.animateIn,
  animateOut: WebflowMotion.presets.curtain.animateOut
});
