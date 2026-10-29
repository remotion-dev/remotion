#!/usr/bin/env python3
"""Smoke-test the private Remotion shared-memory CDP commands.

The script intentionally uses only the Python standard library so it can run on
macOS and Linux build hosts. It starts the supplied headless shell, attaches to
a page over CDP, and exercises both pool backends of the v3 patch:

1. ``preferredBackend: "auto"`` with a backing directory. Hosts with POSIX
   shared memory must answer ``backend: "posix-shm"``; hosts without ``/dev/shm``
   (for example a container started with ``--ipc=none``, or AWS Lambda) must
   answer ``backend: "file"``.
2. ``preferredBackend: "file"``, which must create a regular file inside the
   backing directory, and must remove it again when the pool is destroyed.

For each pool it captures one raw frame through the viewport fast path, checks
the published bytes, releases the frame, and destroys the pool.
"""

from __future__ import annotations

import argparse
import base64
import hashlib
import json
import os
from pathlib import Path
import secrets
import socket
import struct
import subprocess
import sys
import tempfile
import time


class WebSocket:
    def __init__(self, host: str, port: int, path: str) -> None:
        self.socket = socket.create_connection((host, port), timeout=10)
        self.socket.settimeout(10)
        key = base64.b64encode(secrets.token_bytes(16)).decode()
        request = (
            f"GET {path} HTTP/1.1\r\n"
            f"Host: {host}:{port}\r\n"
            "Upgrade: websocket\r\n"
            "Connection: Upgrade\r\n"
            f"Sec-WebSocket-Key: {key}\r\n"
            "Sec-WebSocket-Version: 13\r\n\r\n"
        )
        self.socket.sendall(request.encode())
        response = bytearray()
        while b"\r\n\r\n" not in response:
            chunk = self.socket.recv(4096)
            if not chunk:
                raise RuntimeError("CDP WebSocket closed during handshake")
            response.extend(chunk)
        headers, self.buffer = bytes(response).split(b"\r\n\r\n", 1)
        if not headers.startswith(b"HTTP/1.1 101"):
            raise RuntimeError(f"CDP WebSocket handshake failed: {headers!r}")
        expected = base64.b64encode(
            hashlib.sha1((key + "258EAFA5-E914-47DA-95CA-C5AB0DC85B11").encode()).digest()
        )
        if b"sec-websocket-accept: " + expected.lower() not in headers.lower():
            raise RuntimeError("CDP WebSocket returned an invalid accept key")

    def _read_exactly(self, count: int) -> bytes:
        while len(self.buffer) < count:
            chunk = self.socket.recv(max(4096, count - len(self.buffer)))
            if not chunk:
                raise RuntimeError("CDP WebSocket closed unexpectedly")
            self.buffer += chunk
        result, self.buffer = self.buffer[:count], self.buffer[count:]
        return result

    def send_json(self, message: dict[str, object]) -> None:
        payload = json.dumps(message, separators=(",", ":")).encode()
        header = bytearray([0x81])
        if len(payload) < 126:
            header.append(0x80 | len(payload))
        elif len(payload) < 65536:
            header.append(0x80 | 126)
            header.extend(struct.pack("!H", len(payload)))
        else:
            header.append(0x80 | 127)
            header.extend(struct.pack("!Q", len(payload)))
        mask = secrets.token_bytes(4)
        header.extend(mask)
        masked = bytes(value ^ mask[index % 4] for index, value in enumerate(payload))
        self.socket.sendall(header + masked)

    def receive_json(self) -> dict[str, object]:
        fragments = bytearray()
        while True:
            first, second = self._read_exactly(2)
            final = bool(first & 0x80)
            opcode = first & 0x0F
            length = second & 0x7F
            if length == 126:
                length = struct.unpack("!H", self._read_exactly(2))[0]
            elif length == 127:
                length = struct.unpack("!Q", self._read_exactly(8))[0]
            mask = self._read_exactly(4) if second & 0x80 else None
            payload = self._read_exactly(length)
            if mask is not None:
                payload = bytes(
                    value ^ mask[index % 4] for index, value in enumerate(payload)
                )
            if opcode == 0x8:
                raise RuntimeError("CDP WebSocket closed before the probe completed")
            if opcode == 0x9:
                self._send_control(0xA, payload)
                continue
            if opcode not in (0x0, 0x1):
                continue
            fragments.extend(payload)
            if final:
                return json.loads(fragments)

    def _send_control(self, opcode: int, payload: bytes) -> None:
        mask = secrets.token_bytes(4)
        masked = bytes(value ^ mask[index % 4] for index, value in enumerate(payload))
        self.socket.sendall(bytes([0x80 | opcode, 0x80 | len(payload)]) + mask + masked)

    def close(self) -> None:
        self.socket.close()


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("browser", type=Path)
    args = parser.parse_args()
    browser = args.browser.resolve()
    if not browser.is_file() or not os.access(browser, os.X_OK):
        raise SystemExit(f"Browser is not executable: {browser}")

    with tempfile.TemporaryDirectory(prefix="remotion-chromium-probe-") as temp:
        profile = Path(temp) / "profile"
        log_path = Path(temp) / "browser.log"
        with log_path.open("wb") as browser_log:
            process = subprocess.Popen(
                [
                    str(browser),
                    "--headless",
                    "--no-first-run",
                    "--no-default-browser-check",
                    "--remote-debugging-port=0",
                    f"--user-data-dir={profile}",
                    "--remotion-shared-memory-capture",
                    # Chromium's own IPC otherwise aborts on hosts without /dev/shm;
                    # Remotion passes the same flag on Linux.
                    *(["--disable-dev-shm-usage"] if sys.platform == "linux" else []),
                    *(["--no-sandbox"] if sys.platform == "linux" and os.geteuid() == 0 else []),
                    "about:blank",
                ],
                stdout=browser_log,
                stderr=subprocess.STDOUT,
            )
            websocket = None
            try:
                active_port = profile / "DevToolsActivePort"
                deadline = time.monotonic() + 20
                while time.monotonic() < deadline and not active_port.exists():
                    if process.poll() is not None:
                        break
                    time.sleep(0.05)
                if not active_port.exists():
                    browser_log.flush()
                    details = log_path.read_text(errors="replace")[-4000:]
                    raise RuntimeError(f"Browser did not open a CDP port:\n{details}")

                port_text, websocket_path = active_port.read_text().splitlines()[:2]
                websocket = WebSocket("127.0.0.1", int(port_text), websocket_path)
                next_id = 0

                def command(
                    method: str,
                    params: dict[str, object] | None = None,
                    session_id: str | None = None,
                ) -> dict[str, object]:
                    nonlocal next_id
                    next_id += 1
                    message: dict[str, object] = {
                        "id": next_id,
                        "method": method,
                        "params": params or {},
                    }
                    if session_id is not None:
                        message["sessionId"] = session_id
                    websocket.send_json(message)
                    while True:
                        response = websocket.receive_json()
                        if response.get("id") != next_id:
                            continue
                        if "error" in response:
                            raise RuntimeError(
                                f"{method} failed: {json.dumps(response['error'])}"
                            )
                        result = response.get("result")
                        if not isinstance(result, dict):
                            raise RuntimeError(f"{method} returned no result")
                        return result

                target = command("Target.createTarget", {"url": "about:blank"})
                attached = command(
                    "Target.attachToTarget",
                    {"targetId": target["targetId"], "flatten": True},
                )
                session_id = str(attached["sessionId"])
                width = 64
                height = 64
                slot_capacity = width * height * 4 + 64
                command(
                    "Emulation.setDeviceMetricsOverride",
                    {
                        "width": width,
                        "height": height,
                        "deviceScaleFactor": 1,
                        "mobile": False,
                    },
                    session_id,
                )
                backing_directory = Path(temp) / "pools"
                backing_directory.mkdir(mode=0o700)
                expected_auto_backend = (
                    "file"
                    if sys.platform == "linux" and not Path("/dev/shm").is_dir()
                    else "posix-shm"
                )

                def probe_pool(preferred_backend: str) -> dict[str, object]:
                    pool = command(
                        "Page.remotionCreateFramePool",
                        {
                            "slotCount": 1,
                            "slotCapacity": slot_capacity,
                            "backingDirectory": str(backing_directory),
                            "preferredBackend": preferred_backend,
                        },
                        session_id,
                    )
                    name = str(pool.get("sharedMemoryName", ""))
                    backend = pool.get("backend")
                    expected_backend = (
                        expected_auto_backend
                        if preferred_backend == "auto"
                        else preferred_backend
                    )
                    if (
                        backend != expected_backend
                        or pool.get("slotCount") != 1
                        or pool.get("slotCapacity") != slot_capacity
                    ):
                        raise RuntimeError(
                            f"Unexpected {preferred_backend} frame-pool response: {pool!r}"
                        )
                    if backend == "file":
                        pool_path = Path(name)
                        if (
                            pool_path.parent != backing_directory
                            or not pool_path.name.startswith("rmshm-")
                            or pool_path.is_symlink()
                            or not pool_path.is_file()
                            or pool_path.stat().st_size != slot_capacity
                            or pool_path.stat().st_mode & 0o777 != 0o600
                        ):
                            raise RuntimeError(f"Unexpected file-backed pool: {pool!r}")
                    elif not name.startswith("/rmshm-") or "/" in name[1:]:
                        raise RuntimeError(f"Unexpected POSIX shm name: {pool!r}")
                    frame_id = f"build-probe-{preferred_backend}"
                    capture = command(
                        "Page.captureScreenshot",
                        {
                            "format": "png",
                            "fromSurface": True,
                            "captureBeyondViewport": False,
                            "clip": {
                                "x": 0,
                                "y": 0,
                                "width": width,
                                "height": height,
                                "scale": 1,
                            },
                            "remotionFrameSlot": 0,
                            "remotionFrameId": frame_id,
                            "remotionFastViewport": True,
                        },
                        session_id,
                    )
                    frame = capture.get("remotionFrame")
                    if not isinstance(frame, dict) or (
                        frame.get("capturePath") != "viewport-redraw"
                        or frame.get("slot") != 0
                        or frame.get("frameId") != frame_id
                        or frame.get("width") != width
                        or frame.get("height") != height
                        or frame.get("byteLength") != width * height * 4
                    ):
                        raise RuntimeError(f"Unexpected raw-frame response: {capture!r}")
                    if backend == "file":
                        published_path: Path | None = Path(name)
                    elif sys.platform == "linux":
                        published_path = Path("/dev/shm") / name.lstrip("/")
                    else:
                        # macOS exposes POSIX shm only through shm_open().
                        published_path = None
                    if published_path is not None:
                        pixels = published_path.read_bytes()[: frame["byteLength"]]
                        if len(pixels) != frame["byteLength"] or not any(pixels):
                            raise RuntimeError(
                                f"{backend} frame is empty or inaccessible"
                            )
                    command(
                        "Page.remotionReleaseFrame",
                        {"slot": 0, "frameId": frame_id},
                        session_id,
                    )
                    command("Page.remotionDestroyFramePool", session_id=session_id)
                    if backend == "file" and Path(name).exists():
                        raise RuntimeError(f"Destroyed pool left {name} behind")
                    return {"backend": backend, "capturePath": frame["capturePath"]}

                auto_pool = probe_pool("auto")
                file_pool = probe_pool("file")
                leftovers = sorted(p.name for p in backing_directory.iterdir())
                if leftovers:
                    raise RuntimeError(f"Backing directory not empty: {leftovers}")
                print(
                    json.dumps(
                        {
                            "supported": True,
                            "method": "Page.remotionCreateFramePool",
                            "slotCount": 1,
                            "slotCapacity": slot_capacity,
                            "capturePath": auto_pool["capturePath"],
                            "autoBackend": auto_pool["backend"],
                            "fileBackend": file_pool["backend"],
                        },
                        separators=(",", ":"),
                    )
                )
            finally:
                if websocket is not None:
                    websocket.close()
                if process.poll() is None:
                    process.terminate()
                    try:
                        process.wait(timeout=5)
                    except subprocess.TimeoutExpired:
                        process.kill()
                        process.wait()


if __name__ == "__main__":
    main()
