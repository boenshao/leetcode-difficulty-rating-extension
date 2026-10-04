chrome.runtime.onInstalled.addListener(async () => {
  await chrome.storage.local.set({
    // set from saved value, default to true if not saved yet
    showNA: (await chrome.storage.local.get({showNA: true})).showNA,
    // force refresh cache
    cacheTime: 0,
  });
});

let nextFetch = 0; // earliest time clist.by may be asked again

// Fetched here, not in the content script, to avoid the page's CORS rules.
// Resolves to the rating ('' if clist has none), or null if it can't be asked.
const getClistRating = async (slug) => {
  const {clistKey, clistEnabled} = await chrome.storage.local.get([
    'clistKey',
    'clistEnabled',
  ]);
  const allowed = await chrome.permissions.contains({
    origins: ['https://clist.by/*'],
  });
  if (!clistEnabled || !clistKey || !allowed) return null;

  // clist allows 10 requests per minute, space them 6s apart
  const slot = Math.max(nextFetch, Date.now());
  nextFetch = slot + 6000;
  await new Promise((resolve) => setTimeout(resolve, slot - Date.now()));

  try {
    // keep the key out of the URL
    const res = await fetch(
      'https://clist.by/api/v4/problem/?' +
        new URLSearchParams({resource: 'leetcode.com', slug}),
      {headers: {Authorization: `ApiKey ${clistKey}`}}
    );
    if (!res.ok) return null;
    const problem = (await res.json()).objects.find((p) => p.slug === slug);
    return problem?.rating ? String(problem.rating) : '';
  } catch (e) {
    return null;
  }
};

chrome.runtime.onMessage.addListener((slug, sender, sendResponse) => {
  getClistRating(slug).then(sendResponse);
  return true; // respond asynchronously
});
