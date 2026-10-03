const parse = (csv) => {
  /*
  Rating	ID	Title	Title ZH	Title Slug	Contest Slug	Problem Index
  3018.4940165727	1719	Number Of Ways To Reconstruct A Tree	重构一棵树的方案数	number-of-ways-to-reconstruct-a-tree	biweekly-contest-43	Q4
  2872.0290327119	1982	Find Array Given Subset Sums	从子集的和还原数组	find-array-given-subset-sums	weekly-contest-255	Q4
  */

  let lines = csv.split('\n'); // split rows by newline
  let headers = lines[0].split(/\t+/); // first row is headers, split cols by tab

  let json = {};
  for (let i = 1; i < lines.length; i++) {
    let row = lines[i].split(/\t+/); // data, split cols by tab
    // ID as key
    json[row[1]] = Object.fromEntries(headers.map((k, i) => [k, row[i]]));
  }

  return json;
};

const getRatings = async () => {
  const expire = 3600 * 24 * 1000; // cache for 1 day

  let items = await chrome.storage.local.get(['ratings', 'cacheTime']);
  if (
    items.ratings &&
    items.cacheTime &&
    Date.now() < items.cacheTime + expire
  ) {
    return items.ratings;
  }

  let ratings = parse(
    await fetch(
      'https://raw.githubusercontent.com/zerotrac/leetcode_problem_rating/main/ratings.txt'
    ).then((res) => res.text())
  );

  await chrome.storage.local.set({ ratings: ratings, cacheTime: Date.now() });
  lookups.clear(); // the refresh dropped cached clist.by ratings, ask again

  return ratings;
};

// title -> true while the clist.by lookup is in flight, false once it is done
const lookups = new Map();

// clist.by is queried per problem, only for problems zerotrac lacks.
// Results are cached by title, like zerotrac's rows are cached by ID.
const lookupClist = async (name) => {
  lookups.set(name, true);
  const rating = await chrome.runtime.sendMessage(name); // null if unavailable

  if (rating !== null) {
    // re-read, the cache may have been refreshed meanwhile
    const ratings = await getRatings();
    ratings[name] = {Rating: rating, Source: 'clist.by'};
    await chrome.storage.local.set({ ratings: ratings });
  }
  // only now, so no update sees the lookup done but the rating not cached yet
  lookups.set(name, false);
  update();
};

// the popup switch, off hides clist.by ratings and stops looking them up
let clistOn = true;

// lookup: ask clist.by if this problem has no cached rating, only the main
// problem of a problem page does, so lists never cost a request per row
const replace = (ratings, title, difficulty, showNA, lookup = false) => {
  if (!title || !difficulty) return;

  const [id, ...rest] = title.textContent.split('. ');
  const name = rest.join('. ');
  let entry = ratings[id] ?? ratings[name];
  if (entry?.Source === 'clist.by' && !clistOn) entry = undefined;

  if (!entry) {
    // keep the original difficulty while waiting for clist.by, for every
    // element of this problem (the page lists it in a side panel too)
    if (lookups.get(name)) return;
    if (clistOn && lookup && name && !lookups.has(name)) {
      lookupClist(name);
      return;
    }
  }

  const rating = entry?.Rating;

  if (!rating && !showNA) return;

  // ratings from clist.by get a "c" suffix and a tooltip naming the source
  const clist = entry?.Source === 'clist.by';

  difficulty.textContent = difficulty.textContent.replace(
    /([Hh]ard|[Mm]ed\.|[Mm]edium|[Ee]asy|简单|中等|困难|\d{3,4}c?|N\/A)/,
    rating
      ? rating.split('.')[0] + (clist ? 'c' : '') // truncate to integer
      : 'N/A' // no data available
  );
  if (rating) {
    difficulty.title = `Rating from ${clist ? 'clist.by' : 'zerotrac'}`;
  }
};

const update = async () => {
  observer.disconnect();

  let ratings = await getRatings();
  let options = await chrome.storage.local.get(['showNA', 'clistEnabled']);
  let showNA = options.showNA;
  clistOn = options.clistEnabled !== false;

  let title;
  let difficulty;

  // leetcode.com/problemset/* and leetcode.cn/problemset/*
  document.querySelectorAll('[role="row"]').forEach((ele) => {
    title = ele.querySelector('[role="cell"]:nth-child(2) a');
    difficulty = ele.querySelector('[role="cell"]:nth-child(5) span');
    replace(ratings, title, difficulty, showNA);
  });

  // new leetcode.com/problems/*/
  title = document.querySelector('div > a.text-lg.text-label-1.font-medium');
  difficulty = document.querySelector(
    'div > div.text-sm.font-medium.capitalize'
  );
  replace(ratings, title, difficulty, showNA, true);

  // old leetcode.com/problems/*/
  title = document.querySelector('div[data-cy="question-title"]');
  difficulty = document.querySelector(
    'div[diff="easy"],div[diff="medium"],div[diff="hard"]'
  );
  replace(ratings, title, difficulty, showNA, true);

  // leetcode.cn/problems/*/
  title = document.querySelector('div[class^="text-title-"]');
  difficulty = document.querySelector('div[class*="text-difficulty-"]');
  replace(ratings, title, difficulty, showNA, true);

  // leetcode.com/problem-list/*/
  document
    .querySelectorAll('div > a.group.flex-col, div > div.group.flex-col')
    .forEach((ele) => {
      title = ele.querySelector('.ellipsis.line-clamp-1');
      difficulty = ele.querySelector('p[class*="text-sd-"]');
      replace(ratings, title, difficulty, showNA);
    });

  observer.observe(document.body, {
    subtree: true,
    childList: true,
  });
};

let timer;
const debounce = (func, timeout) => {
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => func.apply(this, args), timeout);
  };
};

const observer = new MutationObserver((mutations) => {
  mutations.forEach(debounce(update, 300));
});

if (
  document.location.href.match(
    /^https?:\/\/(www.)?leetcode.(com|cn)\/(problemset|problems|problem-list)/
  )
) {
  observer.observe(document.body, {
    subtree: true,
    childList: true,
  });
}
