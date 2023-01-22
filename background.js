chrome.runtime.onInstalled.addListener(async () => {
  chrome.storage.local.set({
    // set from saved value, default to true if not saved yet
    showNA: (await chrome.storage.local.get({showNA: true})).showNA,
  });
});
