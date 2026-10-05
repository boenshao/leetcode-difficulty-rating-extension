# leetcode-difficulty-rating-extension

[![chrome web store](https://developer.chrome.com/static/docs/webstore/branding/image/UV4C4ybeBTsZt43U4xis.png)](https://chrome.google.com/webstore/detail/leetcode-difficulty-ratin/hedijgjklbddpidomdhhngflipnibhca)
[![firefox add-on](https://extensionworkshop.com/assets/img/documentation/publish/get-the-addon-178x60px.dad84b42.png)](https://addons.mozilla.org/en-US/firefox/addon/leetcode-difficulty-rating/)

## Introduction

Replace Leetcode problem's difficulty with a more precise contest rating sourced from [zerotrac](https://github.com/zerotrac/leetcode_problem_rating).

The green/yellow/red text color is preserved, so you can still tell the official difficulty.

Problems in 1st-62nd weekly contests and problems that did not come from contests don’t have zerotrac rating data and "N/A" is shown by default. To show the original rating, click the extension icon on the top right of the browser and disable "Show N/A if no rating is available".

Optionally, ratings missing from zerotrac can be looked up from [clist.by](https://clist.by) (rate limited, so it may take a few seconds to show). In the extension popup, turn on "Look up missing ratings on clist.by", paste your clist.by [API key](https://clist.by/api/v4/doc/) (shown as `username:key`), and allow access to clist.by when the browser asks. Ratings from clist.by are shown with a `c` suffix (e.g. `1275c`), and hovering a rating shows where it came from.

Both sources use Elo: a problem's rating is the rating of a person who solves it half the time. clist.by counts people with more past contests more heavily, and also looks at how well each person did in that contest. So a `c` rating and a plain rating can differ for problems of the same difficulty.

## Preview

![screenshot-1](/images/screenshot-1.png)
![screenshot-2](/images/screenshot-2.png)

## Installation

### Chrome Web Store

* [Leetcode Difficulty Rating](https://chrome.google.com/webstore/detail/leetcode-difficulty-ratin/hedijgjklbddpidomdhhngflipnibhca)

### Manually

1. Clone this repository
2. Open the browser and go to `chrome://extensions/`
3. Enable `Developer mode` on the top-right
4. Click `Load unpacked` on the top-left
5. Select the cloned repository

## Acknowledgement

* Ratings are based on <https://github.com/zerotrac/leetcode_problem_rating>
* Optional ratings from <https://clist.by>
