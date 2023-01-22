await chrome.storage.local.get("showNA").then((res) => {
  document.getElementById("showNA").checked = res.showNA;
});

document.getElementById("showNA").addEventListener("change", async (e) => {
  await chrome.storage.local.set({showNA: e.target.checked});
});
