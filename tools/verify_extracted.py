"""Smoke-test both source ZIPs after extraction against an already running MySQL."""

import json
import os
import shutil
import subprocess
import tempfile
import time
from pathlib import Path
from urllib.request import urlopen
from zipfile import ZipFile


ROOT = Path(__file__).resolve().parents[1]
QA = ROOT / "qa-output"


def get(url):
    with urlopen(url, timeout=3) as response:
        return response.status, response.read()


def wait_for(url, process):
    for _ in range(40):
        if process.poll() is not None:
            raise RuntimeError(f"Server exited early: {process.returncode}")
        try:
            return get(url)
        except Exception:
            time.sleep(0.25)
    raise TimeoutError(url)


def main():
    if not (ROOT / "api" / ".env").exists():
        raise RuntimeError("Configure api/.env and a local MySQL server first")
    QA.mkdir(exist_ok=True)
    base = Path(tempfile.mkdtemp(prefix="extracted-", dir=QA))
    for kind in ("api", "clientside"):
        with ZipFile(ROOT / "delivery" / f"USERNAMEA2-{kind}.zip") as archive:
            archive.extractall(base)
    api = base / "api"
    client = base / "clientside"
    shutil.copyfile(ROOT / "api" / ".env", api / ".env")
    npm = shutil.which("npm.cmd" if os.name == "nt" else "npm")
    node = shutil.which("node.exe" if os.name == "nt" else "node")
    if not npm or not node:
        raise RuntimeError("Node.js and npm are required on PATH")
    for folder in (api, client):
        subprocess.run([npm, "ci", "--offline", "--ignore-scripts", "--no-audit", "--no-fund"], cwd=folder, check=True, stdout=subprocess.DEVNULL)
    flags = subprocess.CREATE_NO_WINDOW if os.name == "nt" else 0
    processes = []
    log_handles = []
    try:
        for folder, env_update, name in (
            (api, {"PORT": "4102"}, "api"),
            (client, {"PORT": "3001", "API_ORIGIN": "http://127.0.0.1:4102"}, "clientside"),
        ):
            log = (base / f"{name}.log").open("w", encoding="utf-8")
            log_handles.append(log)
            process = subprocess.Popen([node, "server.js"], cwd=folder, env={**os.environ, **env_update}, stdout=log, stderr=subprocess.STDOUT, creationflags=flags)
            processes.append(process)
            wait_for("http://127.0.0.1:4102/api/categories" if name == "api" else "http://127.0.0.1:3001/", process)
        status, body = get("http://127.0.0.1:3001/api/events")
        events = json.loads(body)["data"]
        assert status == 200 and len(events) == 10
        status, body = get("http://127.0.0.1:3001/api/categories")
        assert status == 200 and len(json.loads(body)["data"]) == 5
        status, body = get("http://127.0.0.1:3001/event.html?id=1")
        assert status == 200 and b"Register" in body
        print(f"Extracted ZIP smoke test passed: {len(events)} events, five categories, detail page. QA directory: {base}")
    finally:
        for process in reversed(processes):
            process.terminate()
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()
        for handle in log_handles:
            handle.close()


if __name__ == "__main__":
    main()
