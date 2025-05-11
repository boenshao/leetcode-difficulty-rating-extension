files = icons src manifest.json LICENSE

build:
	mkdir -p build
	zip -r build/leetcode-difficulty-rating.zip $(files)
	cp manifest-firefox.json manifest.json
	zip -r build/leetcode-difficulty-rating-firefox.zip $(files)
	git checkout -- manifest.json
.PHONY: build
