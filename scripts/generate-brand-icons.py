import os
import subprocess
from PIL import Image

def generate_brand_icons():
    edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    if not os.path.exists(edge_path):
        raise FileNotFoundError(f"Edge executable not found at {edge_path}")

    # Specifications: (filename, total_size, inner_size, rx, is_app_dir)
    specs = [
        # Apple touch icons (solid square #050505, iOS applies squircle mask)
        ("public/apple-touch-icon.png", 180, 120, 0),
        ("public/apple-touch-icon-precomposed.png", 180, 120, 0),
        ("src/app/apple-icon.png", 180, 120, 0),

        # Standard Android / PWA raster icons
        ("public/icon-192.png", 192, 132, 0),
        ("public/icon-512.png", 512, 352, 0),
        ("src/app/icon.png", 192, 132, 0),

        # Maskable Android icons (extra safe padding)
        ("public/icon-maskable-192.png", 192, 110, 0),
        ("public/icon-maskable-512.png", 512, 290, 0),

        # Favicon PNGs
        ("public/favicon-32x32.png", 32, 24, 7),
        ("public/favicon-16x16.png", 16, 12, 3),
        ("public/favicon-48x48.png", 48, 36, 10),
    ]

    temp_html = os.path.abspath("temp_icon_render.html")

    for rel_path, total_size, inner_size, rx in specs:
        target_path = os.path.abspath(rel_path)
        os.makedirs(os.path.dirname(target_path), exist_ok=True)

        border_radius_css = f"border-radius: {rx}px;" if rx > 0 else ""
        badge_wrapper_css = ""
        if rx > 0:
            badge_wrapper_css = f"""
            .badge {{
                width: {total_size}px;
                height: {total_size}px;
                background: #050505;
                {border_radius_css}
                display: flex;
                align-items: center;
                justify-content: center;
            }}
            body {{ background: transparent; }}
            """
        else:
            badge_wrapper_css = f"""
            body {{
                background: #050505;
                display: flex;
                align-items: center;
                justify-content: center;
            }}
            """

        html_content = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
html, body {{
    width: {total_size}px;
    height: {total_size}px;
    overflow: hidden;
}}
{badge_wrapper_css}
svg {{
    width: {inner_size}px;
    height: {inner_size}px;
}}
</style>
</head>
<body>
{"<div class='badge'>" if rx > 0 else ""}
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="#00D2FF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M2 12h7" />
  <path d="M15 12h7" />
  <path d="M5 12a7 7 0 0 1 14 0" />
  <path d="m17 10 2 2 2-2" />
  <path d="M19 12a7 7 0 0 1-14 0" />
  <path d="m3 14 2-2 2 2" />
  <circle cx="12" cy="12" r="3" stroke="#FFFFFF" stroke-width="2" fill="#050505" />
</svg>
{"</div>" if rx > 0 else ""}
</body>
</html>"""

        with open(temp_html, "w", encoding="utf-8") as f:
            f.write(html_content)

        cmd = [
            edge_path,
            "--headless",
            "--disable-gpu",
            f"--screenshot={target_path}",
            f"--window-size={total_size},{total_size}",
            "--hide-scrollbars",
            "--force-device-scale-factor=1",
            f"file:///{temp_html}"
        ]
        res = subprocess.run(cmd, capture_output=True, text=True)
        if res.returncode != 0 or not os.path.exists(target_path):
            print(f"Error rendering {rel_path}: {res.stderr}")
        else:
            # Verify and optimize with Pillow
            img = Image.open(target_path)
            # Ensure proper dimensions
            if img.size != (total_size, total_size):
                img = img.resize((total_size, total_size), Image.Resampling.LANCZOS)
                img.save(target_path, "PNG", optimize=True)
            print(f"Generated {rel_path} ({total_size}x{total_size})")

    # Generate Multi-Resolution favicon.ico (16x16, 32x32, 48x48)
    with Image.open("public/favicon-48x48.png") as ico_48:
        for ico_dest in ["public/favicon.ico", "src/app/favicon.ico"]:
            ico_path = os.path.abspath(ico_dest)
            ico_48.save(
                ico_path,
                format="ICO",
                sizes=[(16, 16), (32, 32), (48, 48)],
            )
            print(f"Generated multi-res {ico_dest} (16, 32, 48)")

    # Clean up temp html and 48px temp png
    if os.path.exists(temp_html):
        try:
            os.remove(temp_html)
        except Exception:
            pass
    if os.path.exists("public/favicon-48x48.png"):
        try:
            os.remove("public/favicon-48x48.png")
        except Exception:
            pass

if __name__ == "__main__":
    generate_brand_icons()

