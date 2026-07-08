#!/usr/bin/env python3
"""Extract Vercel-related URLs and statuses from command output."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from urllib.parse import urlparse


URL_RE = re.compile(r"https?://[^\s<>'\")\]}]+")
STATUS_RE = re.compile(
    r"\b(READY|BUILDING|QUEUED|INITIALIZING|ERROR|FAILED|CANCELED|CANCELLED)\b",
    re.IGNORECASE,
)
TRAILING_PUNCTUATION = ".,;:"


def unique(values: list[str]) -> list[str]:
    seen: set[str] = set()
    result: list[str] = []
    for value in values:
        if value not in seen:
            seen.add(value)
            result.append(value)
    return result


def clean_url(url: str) -> str:
    return url.rstrip(TRAILING_PUNCTUATION)


def host_for(url: str) -> str:
    return urlparse(url).hostname or ""


def is_preview_url(url: str) -> bool:
    host = host_for(url)
    return host == "vercel.app" or host.endswith(".vercel.app")


def is_dashboard_url(url: str) -> bool:
    host = host_for(url)
    return host == "vercel.com" or host.endswith(".vercel.com")


def read_text(paths: list[str]) -> str:
    if not paths:
        return sys.stdin.read()

    chunks: list[str] = []
    for path in paths:
        chunks.append(Path(path).read_text())
    return "\n".join(chunks)


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Extract Vercel dashboard links, preview links, and statuses.",
    )
    parser.add_argument("paths", nargs="*", help="Files to parse. Reads stdin if omitted.")
    args = parser.parse_args()

    text = read_text(args.paths)
    urls = unique([clean_url(match.group(0)) for match in URL_RE.finditer(text)])
    statuses = [match.group(1).upper() for match in STATUS_RE.finditer(text)]

    payload = {
        "status": statuses[-1] if statuses else None,
        "statuses": unique(statuses),
        "deployment_urls": [url for url in urls if is_dashboard_url(url)],
        "preview_urls": [url for url in urls if is_preview_url(url)],
        "other_urls": [
            url for url in urls if not is_dashboard_url(url) and not is_preview_url(url)
        ],
        "urls": urls,
    }
    print(json.dumps(payload, indent=2, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
