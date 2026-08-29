#!/usr/bin/env python3
"""Return the authoritative state of one immutable Vercel deployment."""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from urllib.parse import urlparse


IN_PROGRESS_STATES = {"BUILDING", "QUEUED", "INITIALIZING"}
FAILURE_STATES = {"ERROR", "CANCELED", "CANCELLED"}


def emit(payload: dict[str, object], exit_code: int = 0) -> int:
	print(json.dumps(payload, indent=2, sort_keys=True))
	return exit_code


def normalize_reference(reference: str, scope: str, project: str) -> tuple[str, str | None]:
	parsed = urlparse(reference if "://" in reference else f"https://{reference}")
	if parsed.hostname == "vercel.com" or parsed.hostname == "www.vercel.com":
		parts = [part for part in parsed.path.split("/") if part]
		if len(parts) != 3:
			raise ValueError(
				"Expected a Vercel deployment dashboard URL with /<scope>/<project>/<deployment>."
			)
		url_scope, url_project, suffix = parts
		if url_scope != scope or url_project != project:
			raise ValueError(
				f"Dashboard URL is for {url_scope}/{url_project}, expected {scope}/{project}."
			)
		deployment_id = suffix if suffix.startswith("dpl_") else f"dpl_{suffix}"
		return deployment_id, reference

	if reference.startswith("dpl_"):
		return reference, None

	if parsed.hostname and parsed.hostname.endswith(".vercel.app"):
		return parsed.hostname, None

	raise ValueError("Expected a dpl_ deployment ID, dashboard URL, or vercel.app URL.")


def main() -> int:
	parser = argparse.ArgumentParser(
		description="Read Vercel readyState for one pinned deployment.",
	)
	parser.add_argument("deployment", help="Deployment ID, dashboard URL, or immutable URL")
	parser.add_argument("--scope", default="remotion", help="Vercel team scope")
	parser.add_argument("--project", default="remotion", help="Expected Vercel project")
	args = parser.parse_args()

	try:
		reference, supplied_dashboard_url = normalize_reference(
			args.deployment,
			args.scope,
			args.project,
		)
	except ValueError as error:
		return emit({"state": "UNKNOWN", "error": str(error)}, 2)

	result = subprocess.run(
		[
			"vercel",
			"inspect",
			reference,
			"--scope",
			args.scope,
			"--format=json",
		],
		capture_output=True,
		text=True,
		check=False,
	)
	if result.returncode != 0:
		return emit(
			{
				"state": "UNKNOWN",
				"error": "vercel inspect failed",
				"diagnostic": result.stderr.strip() or result.stdout.strip(),
			},
			2,
		)

	try:
		deployment = json.loads(result.stdout)
	except json.JSONDecodeError as error:
		return emit(
			{
				"state": "UNKNOWN",
				"error": f"vercel inspect returned invalid JSON: {error}",
			},
			2,
		)

	name = deployment.get("name")
	context_name = deployment.get("contextName")
	if name != args.project or (context_name is not None and context_name != args.scope):
		return emit(
			{
				"state": "UNKNOWN",
				"error": "Deployment belongs to a different Vercel project or scope.",
				"actual_project": name,
				"actual_scope": context_name,
			},
			2,
		)

	canonical_hostname = deployment.get("url")
	parsed_input = urlparse(
		args.deployment if "://" in args.deployment else f"https://{args.deployment}"
	)
	if (
		parsed_input.hostname
		and parsed_input.hostname.endswith(".vercel.app")
		and parsed_input.hostname != canonical_hostname
	):
		return emit(
			{
				"state": "UNKNOWN",
				"error": "Refusing to monitor a moving Vercel alias.",
				"alias": parsed_input.hostname,
				"currently_resolves_to": canonical_hostname,
				"deployment_id": deployment.get("id"),
			},
			2,
		)

	state = str(deployment.get("readyState") or "UNKNOWN").upper()
	if state == "READY":
		terminal = True
		outcome = "success"
	elif state in FAILURE_STATES:
		terminal = True
		outcome = "failure"
	elif state in IN_PROGRESS_STATES:
		terminal = False
		outcome = "in_progress"
	else:
		terminal = False
		outcome = "unknown"

	deployment_id = deployment.get("id")
	dashboard_url = supplied_dashboard_url
	if dashboard_url is None and isinstance(deployment_id, str):
		dashboard_url = (
			f"https://vercel.com/{args.scope}/{args.project}/"
			f"{deployment_id.removeprefix('dpl_')}"
		)

	return emit(
		{
			"state": state,
			"terminal": terminal,
			"outcome": outcome,
			"deployment_id": deployment_id,
			"deployment_url": (
				f"https://{canonical_hostname}" if canonical_hostname else None
			),
			"dashboard_url": dashboard_url,
			"preview_aliases": [f"https://{alias}" for alias in deployment.get("aliases", [])],
			"project": name,
			"scope": context_name,
			"created_at": deployment.get("createdAt"),
		}
	)


if __name__ == "__main__":
	raise SystemExit(main())
