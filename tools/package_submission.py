"""Create the two assessment source ZIPs from a strict source-file allowlist."""

from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED


ROOT = Path(__file__).resolve().parents[1]
DEST = ROOT / "delivery"
PACKAGES = {
    "api": [
        ".env.example", ".gitignore", "README.md", "app.js", "create_reader.sql",
        "event_db.js", "integration-check.js", "package-lock.json", "package.json",
        "schema.sql", "seed.sql", "server.js", "test/api.test.js", "test/core.test.js",
    ],
    "clientside": [
        "README.md", "app.js", "event.html", "index.html", "package-lock.json",
        "package.json", "search.html", "server.js", "styles.css",
        "test/filter-state.test.js", "test/server.test.js",
    ],
}


def main():
    DEST.mkdir(exist_ok=True)
    for name, files in PACKAGES.items():
        target = DEST / f"USERNAMEA2-{name}.zip"
        with ZipFile(target, "w", ZIP_DEFLATED, compresslevel=9) as archive:
            for relative in files:
                source = ROOT / name / relative
                if not source.is_file():
                    raise FileNotFoundError(source)
                archive.write(source, f"{name}/{relative}")
        print(f"Created {target.name} ({target.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
