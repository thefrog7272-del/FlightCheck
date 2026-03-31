chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'FLIGHTCHECK_TOGGLE_VOICE') {
    window.postMessage({ type: 'FLIGHTCHECK_TOGGLE_VOICE' }, '*');
  }
});
