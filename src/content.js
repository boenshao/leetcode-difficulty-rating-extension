const parse = (csv) => {
  /*
  Rating	ID	Title	Title ZH	Title Slug	Contest Slug	Problem Index
  3018.4940165727	1719	Number Of Ways To Reconstruct A Tree	重构一棵树的方案数	number-of-ways-to-reconstruct-a-tree	biweekly-contest-43	Q4
  2872.0290327119	1982	Find Array Given Subset Sums	从子集的和还原数组	find-array-given-subset-sums	weekly-contest-255	Q4
  */

  let lines = csv.split("\n"); // split rows by newline
  let headers = lines[0].split(/\s+/); // first row is headers, split cols by spaces

  let json = {};
  for (let i = 1; i < lines.length; i++) {
    let row = lines[i].split(/\s+/); // data, split cols by spaces
    // ID as key
    json[row[1]] = Object.fromEntries(headers.map((k, i) => [k, row[i]]));
  }

  return json;
};

const getRatings = async () => {
  const expire = 3600 * 24 * 1000; // cache for 1 day

  let items = await chrome.storage.local.get(["ratings", "cacheTime"]);
  if (
    items.ratings &&
    items.cacheTime &&
    Date.now() < items.cacheTime + expire
  ) {
    return items.ratings;
  }

  let ratings = parse(
    await fetch(
      "https://raw.githubusercontent.com/zerotrac/leetcode_problem_rating/main/ratings.txt"
    ).then((res) => res.text())
  );

  await chrome.storage.local.set({ratings: ratings, cacheTime: Date.now()});

  return ratings;
};

const replace = (ratings, title, difficulty, showNA) => {
  if (!title || !difficulty) return;

  let id = title.textContent.split(".")[0];

  if (!ratings[id]?.Rating && !showNA) return;

  difficulty.textContent = difficulty.textContent.replace(
    /([Hh]ard|[Mm]edium|[Ee]asy|\d{3,4}|N\/A)/,
    ratings[id]?.Rating
      ? ratings[id].Rating.split(".")[0] // truncate to integer
      : "N/A" // no data available
  );
};

const update = async () => {
  let ratings = await getRatings();
  let showNA = (await chrome.storage.local.get("showNA")).showNA;

  let title;
  let difficulty;

  // leetcode.com/problemset/*
  document.querySelectorAll('[role="row"]').forEach((ele) => {
    title = ele.querySelector('[role="cell"]:nth-child(2) a');
    difficulty = ele.querySelector('[role="cell"]:nth-child(5) span');
    replace(ratings, title, difficulty, showNA);
  });

  // new leetcode.com/problems/*/
  title = document.querySelector("div span.text-lg.text-label-1.font-medium");
  difficulty = document.querySelector("div div.text-xs.font-medium.capitalize");
  replace(ratings, title, difficulty, showNA);

  // old leetcode.com/problems/*/
  title = document.querySelector('div[data-cy="question-title"]');
  difficulty = document.querySelector(
    'div[diff="easy"],div[diff="medium"],div[diff="hard"]'
  );
  replace(ratings, title, difficulty, showNA);

  // leetcode.com/tag/*/
  document.querySelectorAll("tbody.reactable-data tr").forEach((ele) => {
    title = ele.querySelector('td:nth-child(2)[label="#"]');
    difficulty = ele.querySelector('td:nth-child(5)[label="Difficulty"] span');
    replace(ratings, title, difficulty, showNA);
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
  mutations.forEach(debounce(update, 500));
});

if (
  document.location.href.match(/^https?:\/\/(www.)?leetcode.com\/problemset\//)
) {
  // listen for style change for the very first load
  observer.observe(document.querySelector(".pointer-events-none.opacity-50"), {
    attributes: true,
  });

  // listen for navigation, as the style won't be updated for the second time
  observer.observe(document.querySelector('div [role="navigation"]'), {
    attributes: true,
    characterData: true,
    subtree: true,
  });
}

if (
  document.location.href.match(/^https?:\/\/(www.)?leetcode.com\/problems\//)
) {
  // I can't find a clean selection, so I just use body...
  observer.observe(document.querySelector("body"), {
    childList: true,
  });
}

if (document.location.href.match(/^https?:\/\/(www.)?leetcode.com\/tag\//)) {
  observer.observe(document.querySelector("#app"), {
    childList: true,
  });
}
