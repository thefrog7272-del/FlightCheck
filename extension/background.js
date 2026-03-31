// Use chrome.scripting.executeScript (world: 'MAIN') to post directly into the
// page's JS context. This works even if the tab was open before the extension
// was installed — no pre-injected content script required.
chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'toggle-voice') return;

  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    const url = tab.url ?? '';
    if (
      url.includes('main.d2m1s5v9i0w5nr.amplifyapp.com') ||
      url.includes('localhost:5173')
    ) {
      chrome.scripting
        .executeScript({
          target: { tabId: tab.id },
          world: 'MAIN',
          func: () =>
            window.postMessage({ type: 'FLIGHTCHECK_TOGGLE_VOICE' }, '*'),
        })
        .catch((err) =>
          console.warn('[FlightCheck ext] could not inject into tab', tab.id, err),
        );
    }
  }
});
