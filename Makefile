install-deps:
	npm ci

lint:
	npx eslint .

test:
	npm run test

test-coverage:
	npm run test -- --coverage

check:
	make lint
	make test

build-front:
	npx webpack

dev:
	nodemon server/bin/server.js
