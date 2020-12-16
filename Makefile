install-deps:
	npm ci

lint:
	npx eslint .

test:
	npm run test

test-coverage:
	npm run test -- --coverage

migrate:
	npx knex --debug --knexfile=./knexfile.cjs migrate:latest

migrate-rollback:
	npx knex --debug --knexfile=./knexfile.cjs migrate:rollback

check:
	make lint
	make test

build-front:
	npx webpack

dev:
	nodemon server/bin/server.js
