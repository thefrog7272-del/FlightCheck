chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'toggle-voice') return;
  console.log('[FlightCheck ext] toggle-voice command received');

  const tabs = await chrome.tabs.query({});
  console.log('[FlightCheck ext] total tabs found:', tabs.length);

  for (const tab of tabs) {
    if (!tab.id) continue;
    const url = tab.url ?? '';
    if (
      url.includes('main.d2m1s5v9i0w5nr.amplifyapp.com') ||
      url.includes('localhost:5173')
    ) {
      console.log('[FlightCheck ext] injecting into tab', tab.id, url);
      chrome.scripting
        .executeScript({
          target: { tabId: tab.id },
          world: 'MAIN',
          func: () => {
            console.log('[FlightCheck ext] postMessage fired from injected script');
            window.postMessage({ type: 'FLIGHTCHECK_TOGGLE_VOICE' }, '*');
          },
        })
        .then(() => console.log('[FlightCheck ext] executeScript succeeded for tab', tab.id))
        .catch((err) =>
          console.warn('[FlightCheck ext] executeScript failed for tab', tab.id, err),
        );
    }
  }
});
