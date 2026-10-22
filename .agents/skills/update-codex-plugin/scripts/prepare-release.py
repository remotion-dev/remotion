#!/usr/bin/env python3
"""Prepare an immutable Remotion Codex release while preserving its public listing."""

import argparse
import hashlib
import io
import json
import re
import subprocess
import tarfile
import tempfile
import zipfile
from pathlib import Path, PurePosixPath


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--published-zip", type=Path, required=True)
    parser.add_argument("--version", help="Released version; defaults to latest stable")
    args = parser.parse_args()

    def api(endpoint):
        result = subprocess.run(["gh", "api", endpoint], capture_output=True)
        if result.returncode:
            raise SystemExit(result.stderr.decode("utf-8", errors="replace"))
        return result.stdout

    version = args.version
    if version is None:
        version = json.loads(api("repos/remotion-dev/remotion/releases/latest"))[
            "tag_name"
        ]
    version = version.removeprefix("v")
    if not re.fullmatch(r"\d+\.\d+\.\d+", version):
        raise ValueError("Expected a stable Remotion version such as 4.0.534")

    manifest_path = ".codex-plugin/plugin.json"
    unsupported = {"plugin.json", "mcp.json", ".mcp.json", ".app.json", "hooks/hooks.json"}
    with zipfile.ZipFile(args.published_zip) as archive:
        candidates = [
            name for name in archive.namelist()
            if name == manifest_path or name.endswith("/" + manifest_path)
        ]
        if len(candidates) != 1:
            raise ValueError("Published ZIP must contain exactly one Codex manifest")
        prefix = candidates[0][:-len(manifest_path)]
        published_files = {
            name[len(prefix):]: archive.read(name)
            for name in archive.namelist()
            if name.startswith(prefix) and not name.endswith("/")
        }

    published = json.loads(published_files[manifest_path])
    if published.get("name") != "remotion":
        raise ValueError("The baseline ZIP is not the published Remotion plugin")
    old_version = published.get("version", "")
    if not re.fullmatch(r"\d+\.\d+\.\d+", old_version):
        raise ValueError("Published version is not a stable semantic version")
    if tuple(map(int, version.split("."))) <= tuple(map(int, old_version.split("."))):
        raise ValueError(f"Target {version} must be newer than published {old_version}")
    if unsupported.intersection(published_files) or any(
        key in published for key in ("mcpServers", "apps", "hooks")
    ):
        raise ValueError("The baseline is not a standalone skills-only Codex package")

    repo = "remotion-dev/codex-plugin"
    commit = json.loads(api(f"repos/{repo}/commits/v{version}"))["sha"]
    files = {}
    with tarfile.open(fileobj=io.BytesIO(api(f"repos/{repo}/tarball/{commit}"))) as archive:
        for entry in archive:
            parts = PurePosixPath(entry.name).parts[1:]
            if not parts or entry.isdir():
                continue
            if not entry.isfile() or ".." in parts:
                raise ValueError(f"Unexpected archive entry: {entry.name}")
            files["/".join(parts)] = archive.extractfile(entry).read()

    manifest = json.loads(files[manifest_path])
    if manifest.get("name") != "remotion" or manifest.get("version") != version:
        raise ValueError("The tagged Codex manifest does not match the requested release")
    if manifest.get("skills") != "./skills/":
        raise ValueError("The skill layout changed; review the packaging workflow")
    if unsupported.intersection(files) or any(
        key in manifest for key in ("mcpServers", "apps", "hooks")
    ):
        raise ValueError("The source is no longer a standalone skills-only Codex package")

    preserved_differences = {}
    for key in ("interface", "id", "extensions"):
        if key in published:
            if manifest.get(key) != published[key]:
                preserved_differences[key] = {
                    "released_source": manifest.get(key), "published": published[key]
                }
            manifest[key] = published[key]

    # Listing image paths may have been normalized by the directory. Copy the
    # exact files those preserved paths reference from the downloaded release.
    pending = [manifest.get("interface", {}), manifest.get("extensions", {})]
    while pending:
        value = pending.pop()
        if isinstance(value, dict):
            pending.extend(value.values())
        elif isinstance(value, list):
            pending.extend(value)
        elif isinstance(value, str) and value.startswith("./"):
            relative = PurePosixPath(value[2:])
            if relative.is_absolute() or ".." in relative.parts:
                raise ValueError(f"Invalid manifest path: {value}")
            key = str(relative)
            if key.startswith("skills/"):
                if key not in files:
                    raise ValueError(f"Preserved metadata references a missing skill: {key}")
            elif key in published_files:
                files[key] = published_files[key]
            else:
                raise ValueError(f"Missing published listing asset: {key}")

    skill_paths = sorted(path for path in files if path.endswith("/SKILL.md"))
    if not skill_paths or any(
        not path.startswith("skills/") or len(PurePosixPath(path).parts) != 3
        for path in skill_paths
    ):
        raise ValueError("Expected discoverable skills directly inside skills/<name>/")
    for path in skill_paths:
        text = files[path].decode("utf-8")
        match = re.match(r"\A---\r?\n(.*?)\r?\n---", text, re.S)
        if not match or not re.search(
            rf"^version:\s*{re.escape(version)}\s*$", match[1], re.M
        ):
            raise ValueError(f"Skill version does not match {version}: {path}")

    files[manifest_path] = (json.dumps(manifest, indent=2) + "\n").encode()
    output = Path(tempfile.mkdtemp(prefix=f"remotion-codex-{version}-"))
    staging = output / "remotion"
    zip_path = output / f"remotion-{version}.zip"
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as archive:
        for name, contents in sorted(files.items()):
            relative = PurePosixPath(name)
            if relative.is_absolute() or ".." in relative.parts:
                raise ValueError(f"Invalid package path: {name}")
            target = staging / name
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(contents)
            archive.writestr(name, contents)

    report = {
        "version": version,
        "previous_version": old_version,
        "source_commit": commit,
        "source_url": f"https://github.com/{repo}/tree/{commit}",
        "staging_directory": str(staging),
        "zip_path": str(zip_path),
        "zip_sha256": hashlib.sha256(zip_path.read_bytes()).hexdigest(),
        "file_count": len(files),
        "skills": [PurePosixPath(path).parts[1] for path in skill_paths],
        "preserved_manifest_differences": preserved_differences,
    }
    (output / "preparation.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
