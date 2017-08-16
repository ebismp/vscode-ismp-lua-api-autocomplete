
build: clean
	vsce package

deps:
	rm -rf node_modules
	npm install

vsce:
	npm install -g vsce

install:
	@echo "xxx"

.PHONY: clean

clean:
	rm -f *.vsix
