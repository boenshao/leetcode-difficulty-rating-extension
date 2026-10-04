let checkBoxShowNA = document.getElementById("showNA");
checkBoxShowNA.checked = (await chrome.storage.local.get("showNA")).showNA;
checkBoxShowNA.addEventListener("change", async (e) => {
  await chrome.storage.local.set({showNA: e.target.checked});
});

const clistOrigins = {origins: ["https://clist.by/*"]};
let checkBoxClist = document.getElementById("clistEnabled");
checkBoxClist.checked =
  (await chrome.storage.local.get("clistEnabled")).clistEnabled &&
  (await chrome.permissions.contains(clistOrigins));
checkBoxClist.addEventListener("change", async (e) => {
  // Chrome closes the popup when the permission prompt opens, so save
  // first. Firefox checks for the user gesture when permissions.request
  // is called, so nothing is awaited before it.
  chrome.storage.local.set({clistEnabled: e.target.checked});
  if (e.target.checked) {
    e.target.checked = await chrome.permissions.request(clistOrigins);
    await chrome.storage.local.set({clistEnabled: e.target.checked});
  }
});

let clistKey = document.getElementById("clistKey");
clistKey.value = (await chrome.storage.local.get("clistKey")).clistKey ?? "";
clistKey.addEventListener("input", async (e) => {
  // the whole "Authorization: ApiKey username:key" line may be pasted, keep its last word
  let key = e.target.value.trim().split(/\s+/).pop();
  if (key !== e.target.value) e.target.value = key;
  // force refresh cache so new credentials take effect
  await chrome.storage.local.set({clistKey: key, cacheTime: 0});
});

let toggleKey = document.getElementById("toggleKey");
toggleKey.addEventListener("click", () => {
  let show = clistKey.type === "password";
  clistKey.type = show ? "text" : "password";
  toggleKey.textContent = show ? "Hide" : "Show";
});
