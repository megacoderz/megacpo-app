# Mega Partner — Expo app do sócio / investidor
.DEFAULT_GOAL := help

ROOT := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))
SCRIPTS := $(ROOT)/scripts

define RUN_WITH_ENV
. "$(SCRIPTS)/lib/load-env.sh"; \
load_project_env "$(ROOT)"
endef

.PHONY: help
help: ## Lista targets
	@printf "Mega Partner — make <target>\n\n"
	@awk 'BEGIN {FS = ":.*## "} \
		/^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5); next } \
		/^[a-zA-Z0-9_.-]+:.*?## / { printf "  \033[36m%-22s\033[0m %s\n", $$1, $$2 }' \
		$(MAKEFILE_LIST)

##@ Setup

.PHONY: env-init install
env-init: ## Copia env.example.dist → .env (se ausente)
	@if [ ! -f "$(ROOT)/.env" ]; then \
		cp "$(ROOT)/env.example.dist" "$(ROOT)/.env"; \
		echo "Criado $(ROOT)/.env"; \
	else \
		echo "$(ROOT)/.env já existe"; \
	fi

install: ## bun install
	@$(RUN_WITH_ENV); cd "$(ROOT)" && bun install

##@ Dev / Quality

.PHONY: start format lint typecheck test test-cov i18n-check expo-doctor verify verify-release
start: ## Expo start
	@$(RUN_WITH_ENV); cd "$(ROOT)" && bun run start

format: ## Prettier write
	@$(RUN_WITH_ENV); cd "$(ROOT)" && bun run format

lint: ## Expo lint
	@$(RUN_WITH_ENV); cd "$(ROOT)" && bun run lint

typecheck: ## tsc --noEmit
	@$(RUN_WITH_ENV); cd "$(ROOT)" && bun run typecheck

test: ## Vitest
	@$(RUN_WITH_ENV); cd "$(ROOT)" && bun run test

test-cov: ## Vitest coverage
	@$(RUN_WITH_ENV); cd "$(ROOT)" && bun run test:cov

i18n-check: ## Auditoria i18n pt-BR / en-US / es-ES
	@$(RUN_WITH_ENV); cd "$(ROOT)" && bun run i18n:check

expo-doctor: ## expo-doctor
	@$(RUN_WITH_ENV); cd "$(ROOT)" && bun run expo:doctor

verify: ## lint → typecheck → test:cov
	@$(RUN_WITH_ENV); cd "$(ROOT)" && bun run verify

verify-release: ## verify + i18n + expo-doctor
	@$(RUN_WITH_ENV); cd "$(ROOT)" && bun run verify:release

##@ EAS

.PHONY: validate-eas-preview validate-eas build-preview-ios build-preview-android build-production-ios build-production-android
validate-eas-preview: ## Valida envs preview
	@$(RUN_WITH_ENV); cd "$(ROOT)" && bun run validate:eas:preview

validate-eas: ## Valida envs production
	@$(RUN_WITH_ENV); cd "$(ROOT)" && bun run validate:eas

build-preview-ios: ## EAS preview iOS
	@$(RUN_WITH_ENV); cd "$(ROOT)" && bun run build:preview:ios

build-preview-android: ## EAS preview Android
	@$(RUN_WITH_ENV); cd "$(ROOT)" && bun run build:preview:android

build-production-ios: ## EAS production iOS
	@$(RUN_WITH_ENV); cd "$(ROOT)" && bun run build:production:ios

build-production-android: ## EAS production Android
	@$(RUN_WITH_ENV); cd "$(ROOT)" && bun run build:production:android
