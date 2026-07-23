#!/usr/bin/env bash
set -Eeuo pipefail

monitor_interval="${DOCS_REPRO_MONITOR_INTERVAL_SECONDS:-20}"
turbo_cache_dir="${DOCS_REPRO_TURBO_CACHE_DIR:-/tmp/remotion-turbo-cache}"
build_command="${DOCS_REPRO_BUILD_COMMAND:-bunx turbo run build-docs --no-update-notifier --force --cache-dir=/tmp/remotion-turbo-cache --summarize}"
export REMOTION_DOCS_DISABLE_GIT_LAST_UPDATE="${REMOTION_DOCS_DISABLE_GIT_LAST_UPDATE:-1}"

print_cgroup_file() {
	local label="$1"
	local file="$2"
	if [[ -f "$file" ]]; then
		printf '%s=%s\n' "$label" "$(cat "$file")"
	fi
}

print_limits() {
	echo "== Environment =="
	echo "date=$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
	echo "bun=$(bun --version)"
	echo "node=$(node --version 2>/dev/null || true)"
	echo "pwd=$(pwd)"
	print_cgroup_file "cgroup.memory.max" "/sys/fs/cgroup/memory.max"
	print_cgroup_file "cgroup.memory.current" "/sys/fs/cgroup/memory.current"
	print_cgroup_file "cgroup.memory.swap.max" "/sys/fs/cgroup/memory.swap.max"
	print_cgroup_file "cgroup.cpu.max" "/sys/fs/cgroup/cpu.max"
	echo
}

monitor_memory() {
	while true; do
		echo
		echo "== Memory sample $(date -u +"%Y-%m-%dT%H:%M:%SZ") =="
		print_cgroup_file "cgroup.memory.current" "/sys/fs/cgroup/memory.current"
		free -m || true
		ps -eo pid,ppid,rss,vsz,comm,args --sort=-rss | head -16 || true
		sleep "$monitor_interval"
	done
}

cleanup_outputs() {
	rm -rf \
		"$turbo_cache_dir" \
		.turbo \
		packages/*/.turbo \
		packages/*/dist \
		packages/*/tsconfig.tsbuildinfo \
		packages/docs/.docusaurus \
		packages/docs/build \
		packages/docs/node_modules/.cache/twoslash \
		packages/convert/spa-dist \
		packages/brand/build \
		packages/example/build-testbed
}

print_limits
if [[ ! -d .git ]]; then
	git init -q
fi
git config --global --add safe.directory "$(pwd)"
cleanup_outputs

monitor_memory &
monitor_pid="$!"
trap 'kill "$monitor_pid" 2>/dev/null || true' EXIT

echo "== Installing dependencies =="
if [[ "${DOCS_REPRO_SKIP_INSTALL:-0}" == "1" ]]; then
	echo "Skipping dependency install; image already contains node_modules."
else
	bun install
fi

echo
echo "== Building docs =="
echo "$build_command"
mkdir -p "$turbo_cache_dir"
/usr/bin/time -v bash -lc "$build_command"
