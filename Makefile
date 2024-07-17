PROJECT = "Tonlink Layer CLI"

ifeq (run-cli, $(firstword $(MAKECMDGOALS)))
  runargs := $(wordlist 2, $(words $(MAKECMDGOALS)), $(MAKECMDGOALS))
  $(eval $(runargs):;@true)
endif

run-cli: 
	npx ts-node cli/cli.ts $(runargs) $(-*-command-variables-*-)
install: ;@echo "Installing ${PROJECT}....."; \
	npm install

clean : ;
	rm -rf node_modules

.PHONY: test server install clean update
.SILENT: