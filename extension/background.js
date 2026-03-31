chrome.commands.onCommand.addListener(async (command) => {
  if (command !== 'toggle-voice') return;
  // Query ALL tabs — no URL filtering needed (avoids host_permissions requirement).
  // sendMessage will throw for tabs without the content script; we swallow those errors.
  const tabs = await chrome.tabs.query({});
  for (const tab of tabs) {
    if (tab.id != null) {
      chrome.tabs.sendMessage(tab.id, { type: 'FLIGHTCHECK_TOGGLE_VOICE' })
        .catch(() => {}); // not a FlightCheck tab — ignore
    }
  }
});
