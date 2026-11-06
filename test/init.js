WebflowMotion.init({
  loader: document.body.dataset.loader === 'true',
  loaderLottie: '/src/lotties/03_SR_Materia_logo-animation_big-small.json',
  pageTransitions: true,
  showPageName: false,
  animateIn: WebflowMotion.presets.curtain.animateIn,
  animateOut: WebflowMotion.presets.curtain.animateOut
});
