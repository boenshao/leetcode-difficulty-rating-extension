chrome.runtime.onInstalled.addListener(async () => {
  await chrome.storage.local.set({
    // set from saved value, default to true if not saved yet
    showNA: (await chrome.storage.local.get({showNA: true})).showNA,
    // force refresh cache
    cacheTime: 0,
  });
});

let lastFetch = 0;

// Fetched here, not in the content script, to avoid the page's CORS rules.
// Resolves to the rating ('' if clist has none), or null if it can't be asked.
const getClistRating = async (name) => {
  const {clistUser, clistKey, clistEnabled} = await chrome.storage.local.get([
    'clistUser',
    'clistKey',
    'clistEnabled',
  ]);
  // on by default, the popup switch only turns it off
  if (clistEnabled === false || !clistUser || !clistKey) return null;

  // clist allows 10 requests per minute, space requests 6s apart
  await new Promise((resolve) =>
    setTimeout(resolve, lastFetch + 6000 - Date.now())
  );
  lastFetch = Date.now();

  try {
    const res = await fetch(
      'https://clist.by/api/v4/problem/?' +
        new URLSearchParams({
          username: clistUser,
          api_key: clistKey,
          resource: 'leetcode.com',
          name,
        })
    );
    if (!res.ok) return null;
    const problem = (await res.json()).objects.find((p) => p.name === name);
    return problem?.rating ? String(problem.rating) : '';
  } catch (e) {
    return null;
  }
};

// one lookup at a time
let queue = Promise.resolve();
chrome.runtime.onMessage.addListener((name, sender, sendResponse) => {
  queue = queue.then(() => getClistRating(name)).then(sendResponse);
  return true; // respond asynchronously
});
