from pathlib import Path
from PIL import Image
import json
import subprocess
import zipfile

SCRIPT_PATH = Path(__file__).resolve()

if (SCRIPT_PATH.parent / "src").exists():
    ROOT = SCRIPT_PATH.parent
else:
    ROOT = SCRIPT_PATH.parents[1]

SRC = ROOT / "src"
DIST = ROOT / "dist"
DIST.mkdir(exist_ok=True)

required_files = [
    "manifest.json",
    "background.js",
    "popup.html",
    "popup.js",
    "popup.css",
    "icons/icon16.png",
    "icons/icon32.png",
    "icons/icon48.png",
    "icons/icon128.png",
]

for item in required_files:
    path = SRC / item
    if not path.exists():
        raise SystemExit(f"Missing required file: {item}")

manifest = json.loads((SRC / "manifest.json").read_text(encoding="utf-8"))

if manifest.get("manifest_version") != 3:
    raise SystemExit("manifest_version must be 3")

if manifest.get("version") != "0.0.5":
    raise SystemExit("manifest version must be 0.0.5")

if "http://ip-api.com/*" not in manifest.get("host_permissions", []):
    raise SystemExit("Missing ip-api host permission")

if "https://flagcdn.com/*" not in manifest.get("host_permissions", []):
    raise SystemExit("Missing flagcdn host permission")

for size in [16, 32, 48, 128]:
    path = SRC / "icons" / f"icon{size}.png"
    image = Image.open(path)
    if image.size != (size, size):
        raise SystemExit(f"{path.name} has incorrect size: {image.size}")
    if image.format != "PNG":
        raise SystemExit(f"{path.name} must be PNG")

icon128 = Image.open(SRC / "icons" / "icon128.png").convert("RGBA")
bbox = icon128.getchannel("A").getbbox()

if bbox != (16, 16, 112, 112):
    raise SystemExit(f"icon128 artwork must be 96x96 with 16 px transparent padding. Found bbox: {bbox}")

for js_file in ["background.js", "popup.js"]:
    result = subprocess.run(
        ["node", "--check", str(SRC / js_file)],
        capture_output=True,
        text=True
    )
    if result.returncode != 0:
        raise SystemExit(result.stderr)

package = DIST / "ip_region_flag_0_0_5_chrome_web_store.zip"

if package.exists():
    package.unlink()

with zipfile.ZipFile(package, "w", zipfile.ZIP_DEFLATED) as zf:
    for file in sorted(SRC.rglob("*")):
        if file.is_file():
            zf.write(file, arcname=str(file.relative_to(SRC)))

with zipfile.ZipFile(package, "r") as zf:
    if "manifest.json" not in zf.namelist():
        raise SystemExit("manifest.json must be at ZIP root")

print("Validation passed")
print(package)