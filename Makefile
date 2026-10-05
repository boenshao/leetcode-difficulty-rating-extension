files = icons src manifest.json LICENSE
version := $(shell sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' manifest.json)

build:
	mkdir -p build
	zip -r build/leetcode-difficulty-rating-v$(version).zip $(files)
	cp manifest-firefox.json manifest.json
	zip -r build/leetcode-difficulty-rating-v$(version)-firefox.zip $(files)
	git checkout -- manifest.json
.PHONY: build
