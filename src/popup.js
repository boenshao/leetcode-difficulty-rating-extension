let checkBoxShowNA = document.getElementById("showNA");
checkBoxShowNA.checked = (await chrome.storage.local.get("showNA")).showNA;
checkBoxShowNA.addEventListener("change", async (e) => {
  await chrome.storage.local.set({showNA: e.target.checked});
});

let user = document.getElementById("clistUser");
let key = document.getElementById("clistKey");
let enabled = document.getElementById("clistEnabled");
let save = document.getElementById("save");

let saved = await chrome.storage.local.get([
  "clistUser",
  "clistKey",
  "clistEnabled",
]);
user.value = saved.clistUser ?? "";
key.value = saved.clistKey ?? "";
// on by default, only an explicit false turns it off
enabled.checked = saved.clistEnabled !== false;
enabled.addEventListener("change", async (e) => {
  await chrome.storage.local.set({clistEnabled: e.target.checked});
});

// split a pasted "Authorization: ApiKey username:key" line into both fields
key.addEventListener("input", () => {
  let match = key.value.trim().match(/^(?:Authorization:\s*)?(?:ApiKey\s+)?([^\s:]+):(\S+)$/i);
  if (!match) return;
  user.value = match[1];
  key.value = match[2];
});

document.getElementById("toggleKey").addEventListener("click", (e) => {
  let hidden = key.type === "password";
  key.type = hidden ? "text" : "password";
  e.target.textContent = hidden ? "Hide" : "Show";
});

document.getElementById("clist").addEventListener("submit", async (e) => {
  e.preventDefault();
  // force refresh cache so new credentials take effect
  await chrome.storage.local.set({
    clistUser: user.value.trim(),
    clistKey: key.value.trim(),
    cacheTime: 0,
  });
  save.textContent = "Saved";
  setTimeout(() => (save.textContent = "Save"), 1500);
});
