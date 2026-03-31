chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'toggle-voice') return;
  const tabs = await chrome.tabs.query({
    url: [
      '*://main.d2m1s5v9i0w5nr.amplifyapp.com/*',
      '*://localhost:5173/*'
    ]
  });
  for (const tab of tabs) {
    if (tab.id != null) {
      chrome.tabs.sendMessage(tab.id, { type: 'FLIGHTCHECK_TOGGLE_VOICE' });
    }
  }
});
