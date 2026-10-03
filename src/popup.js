let checkBoxShowNA = document.getElementById("showNA");
checkBoxShowNA.checked = (await chrome.storage.local.get("showNA")).showNA;
checkBoxShowNA.addEventListener("change", async (e) => {
  await chrome.storage.local.set({showNA: e.target.checked});
});

let user = document.getElementById("clistUser");
let key = document.getElementById("clistKey");
let status = document.getElementById("status");
let save = document.getElementById("save");

const showStatus = () => {
  let on = Boolean(user.value && key.value);
  status.textContent = on ? "Enabled" : "Off";
  status.classList.toggle("on", on);
};

let saved = await chrome.storage.local.get(["clistUser", "clistKey"]);
user.value = saved.clistUser ?? "";
key.value = saved.clistKey ?? "";
showStatus();

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
  showStatus();
  save.textContent = "Saved";
  setTimeout(() => (save.textContent = "Save"), 1500);
});
