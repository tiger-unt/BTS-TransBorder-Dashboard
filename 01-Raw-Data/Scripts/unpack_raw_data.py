"""
unpack_raw_data.py
==================
Extracts all raw TransBorder data ZIPs into a flat, browsable directory structure
at 01-Raw-Data/unpacked/{modern|legacy}/{year}/.

No data processing or transformation is performed — just extraction.

Handles:
- Modern data (2007–2025): monthly ZIPs with dot1/dot2/dot3 CSVs
- Legacy data (1993–2006): nested ZIP-in-ZIP with DBF/TAB/CSV files
- Special cases: 2017 nested ZIPs, 2011 corrupted inner ZIPs, macOS ._ files

Usage:
    python unpack_raw_data.py
"""

import os
import sys
import zipfile
import io
import shutil
import logging
from pathlib import Path

# ── Paths ────────────────────────────────────────────────────────────────────
SCRIPT_DIR = Path(__file__).resolve().parent
RAW_DATA = SCRIPT_DIR.parent
OUTPUT_ROOT = RAW_DATA / "unpacked"

MODERN_SRC = RAW_DATA / "download" / "modern"
LEGACY_SRC = RAW_DATA / "download" / "legacy"
MODERN_DST = OUTPUT_ROOT / "modern"
LEGACY_DST = OUTPUT_ROOT / "legacy"

# Files to skip during extraction
SKIP_PREFIXES = ("._", "__MACOSX")

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s  %(levelname)-7s  %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger(__name__)


def should_skip(name: str) -> bool:
    """Return True for macOS resource forks and other junk files."""
    basename = os.path.basename(name)
    return (
        basename.startswith("._")
        or name.startswith("__MACOSX")
        or basename == ".DS_Store"
        or basename == ""
    )


def safe_extract_member(zf: zipfile.ZipFile, member: str, dest_dir: Path) -> Path | None:
    """Extract a single ZIP member to dest_dir, returning the output path."""
    if should_skip(member):
        return None
    # Flatten: strip any directory prefixes, put file directly in dest_dir
    basename = os.path.basename(member)
    if not basename:  # directory entry
        return None
    out_path = dest_dir / basename
    # Avoid overwriting — add suffix if collision
    if out_path.exists():
        stem, ext = os.path.splitext(basename)
        i = 2
        while out_path.exists():
            out_path = dest_dir / f"{stem}_{i}{ext}"
            i += 1
    try:
        with zf.open(member) as src, open(out_path, "wb") as dst:
            shutil.copyfileobj(src, dst)
        return out_path
    except Exception as e:
        log.warning("    Failed to extract %s: %s", member, e)
        # Clean up partial file
        if out_path.exists():
            out_path.unlink()
        return None


def extract_zip_recursive(zip_bytes: bytes, dest_dir: Path, depth: int = 0, max_depth: int = 4):
    """
    Extract a ZIP, and recursively extract any inner ZIPs found.
    All non-ZIP files land in dest_dir (flattened).
    """
    try:
        zf = zipfile.ZipFile(io.BytesIO(zip_bytes))
    except zipfile.BadZipFile:
        log.warning("    %sBad ZIP at depth %d — skipping", "  " * depth, depth)
        return

    for member in zf.namelist():
        if should_skip(member):
            continue
        basename = os.path.basename(member).lower()
        if not basename:
            continue

        if basename.endswith(".zip") and depth < max_depth:
            # Recursively extract inner ZIP
            try:
                inner_bytes = zf.read(member)
                log.debug("    %sRecursing into %s", "  " * depth, os.path.basename(member))
                extract_zip_recursive(inner_bytes, dest_dir, depth + 1, max_depth)
            except Exception as e:
                log.warning("    %sFailed to read inner ZIP %s: %s", "  " * depth, member, e)
        else:
            safe_extract_member(zf, member, dest_dir)

    zf.close()


def unpack_modern():
    """Unpack modern (2007–2025+) raw data."""
    if not MODERN_SRC.exists():
        log.warning("Modern source not found: %s", MODERN_SRC)
        return

    for year_dir in sorted(MODERN_SRC.iterdir()):
        if not year_dir.is_dir():
            continue
        year = year_dir.name
        dest = MODERN_DST / year
        dest.mkdir(parents=True, exist_ok=True)

        zip_files = sorted(year_dir.glob("*.zip"))
        if not zip_files:
            log.info("  %s: no ZIPs found", year)
            continue

        file_count = 0
        for zf_path in zip_files:
            log.info("  %s: extracting %s", year, zf_path.name)
            zip_bytes = zf_path.read_bytes()
            before = len(list(dest.iterdir()))
            extract_zip_recursive(zip_bytes, dest)
            after = len(list(dest.iterdir()))
            added = after - before
            file_count += added

        log.info("  %s: %d files extracted total", year, len(list(dest.iterdir())))


def unpack_legacy():
    """Unpack legacy (1993–2006) raw data."""
    if not LEGACY_SRC.exists():
        log.warning("Legacy source not found: %s", LEGACY_SRC)
        return

    for year_dir in sorted(LEGACY_SRC.iterdir()):
        if not year_dir.is_dir():
            continue
        year = year_dir.name
        dest = LEGACY_DST / year
        dest.mkdir(parents=True, exist_ok=True)

        zip_files = sorted(year_dir.glob("*.zip"))
        if not zip_files:
            log.info("  %s: no ZIPs found", year)
            continue

        for zf_path in zip_files:
            log.info("  %s: extracting %s", year, zf_path.name)
            zip_bytes = zf_path.read_bytes()
            extract_zip_recursive(zip_bytes, dest)

        log.info("  %s: %d files extracted total", year, len(list(dest.iterdir())))


def print_summary():
    """Print a summary of what was unpacked."""
    print("\n" + "=" * 70)
    print("UNPACKING SUMMARY")
    print("=" * 70)

    for era, era_dir in [("Modern", MODERN_DST), ("Legacy", LEGACY_DST)]:
        if not era_dir.exists():
            continue
        print(f"\n{era}:")
        for year_dir in sorted(era_dir.iterdir()):
            if not year_dir.is_dir():
                continue
            files = list(year_dir.iterdir())
            by_ext = {}
            for f in files:
                ext = f.suffix.lower()
                by_ext[ext] = by_ext.get(ext, 0) + 1
            ext_str = ", ".join(f"{ext}={n}" for ext, n in sorted(by_ext.items()))
            print(f"  {year_dir.name}: {len(files)} files ({ext_str})")

    print("\n" + "=" * 70)


def main():
    log.info("Output directory: %s", OUTPUT_ROOT)

    if OUTPUT_ROOT.exists():
        log.info("Clearing existing unpacked data...")
        shutil.rmtree(OUTPUT_ROOT, ignore_errors=True)
        # On Windows, retry after a brief pause if directories persist
        if OUTPUT_ROOT.exists():
            import time
            time.sleep(1)
            shutil.rmtree(OUTPUT_ROOT, ignore_errors=True)

    OUTPUT_ROOT.mkdir(parents=True, exist_ok=True)
    MODERN_DST.mkdir(parents=True, exist_ok=True)
    LEGACY_DST.mkdir(parents=True, exist_ok=True)

    log.info("Unpacking modern data (2007–2025)...")
    unpack_modern()

    log.info("Unpacking legacy data (1993–2006)...")
    unpack_legacy()

    print_summary()
    log.info("Done.")


if __name__ == "__main__":
    main()
