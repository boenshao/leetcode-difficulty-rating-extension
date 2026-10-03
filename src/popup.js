let checkBoxShowNA = document.getElementById("showNA");
checkBoxShowNA.checked = (await chrome.storage.local.get("showNA")).showNA;
checkBoxShowNA.addEventListener("change", async (e) => {
  await chrome.storage.local.set({showNA: e.target.checked});
});

let clistUser = document.getElementById("clistUser");
let clistKey = document.getElementById("clistKey");
clistUser.value = (await chrome.storage.local.get("clistUser")).clistUser ?? "";
clistKey.value = (await chrome.storage.local.get("clistKey")).clistKey ?? "";

document.getElementById("clistSave").addEventListener("click", async () => {
  let user = clistUser.value.trim();
  let key = clistKey.value.trim();
  // force refresh cache so new credentials take effect
  await chrome.storage.local.set({clistUser: user, clistKey: key, cacheTime: 0});
  // permission prompts need a user gesture
  if (user && key) {
    await chrome.permissions.request({origins: ["https://clist.by/*"]});
  }
});
