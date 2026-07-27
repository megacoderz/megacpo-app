#!/usr/bin/env bash
# Carrega arquivos .env de forma resiliente (comentários, export, valores com espaço).
# Uso: source .../lib/load-env.sh && load_env_file path && load_project_env [root]

load_env_file() {
  local file="$1"
  local line key val

  [ -f "$file" ] || return 0

  while IFS= read -r line || [ -n "$line" ]; do
    line="${line#"${line%%[![:space:]]*}"}"
    line="${line%"${line##*[![:space:]]}"}"
    [ -z "$line" ] && continue
    case "$line" in
      \#*) continue ;;
      export\ *) line="${line#export }" ;;
    esac
    case "$line" in
      *=*)
        key="${line%%=*}"
        val="${line#*=}"
        key="${key%"${key##*[![:space:]]}"}"
        key="${key#"${key%%[![:space:]]*}"}"
        case "$key" in
          '' | *[!A-Za-z0-9_]*) continue ;;
        esac
        if [ "${#val}" -ge 2 ]; then
          case "$val" in
            \"*\") val="${val#\"}"; val="${val%\"}" ;;
            \'*\') val="${val#\'}"; val="${val%\'}" ;;
          esac
        fi
        export "$key=$val"
        ;;
    esac
  done <"$file"
}

load_project_env() {
  local root="${1:-}"
  if [ -z "$root" ]; then
    root="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
  fi

  load_env_file "$root/.env"
  load_env_file "$root/.env.local"

  export API_PORT="${API_PORT:-${PORT:-3001}}"
  export DEPLOYMENT_ENVIRONMENT="${DEPLOYMENT_ENVIRONMENT:-development}"
}
