let checkBoxShowNA = document.getElementById("showNA");
checkBoxShowNA.checked = (await chrome.storage.local.get("showNA")).showNA;
checkBoxShowNA.addEventListener("change", async (e) => {
  await chrome.storage.local.set({showNA: e.target.checked});
});

for (const id of ["clistUser", "clistKey"]) {
  let input = document.getElementById(id);
  input.value = (await chrome.storage.local.get(id))[id] ?? "";
  input.addEventListener("change", async (e) => {
    // force refresh cache so new credentials take effect
    await chrome.storage.local.set({[id]: e.target.value.trim(), cacheTime: 0});
  });
}
