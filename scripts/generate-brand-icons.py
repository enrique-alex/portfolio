import os
import subprocess
from PIL import Image, ImageDraw


def apply_squircle_mask(img: Image.Image, rx: float) -> Image.Image:
    """Apply a 4x supersampled anti-aliased rounded rectangle alpha mask so outer corners are 100% transparent."""
    w, h = img.size
    scale = 4
    mask = Image.new("L", (w * scale, h * scale), 0)
    draw = ImageDraw.Draw(mask)
    draw.rounded_rectangle(
        [(0, 0), (w * scale - 1, h * scale - 1)],
        radius=int(round(rx * scale)),
        fill=255,
    )
    mask = mask.resize((w, h), Image.Resampling.LANCZOS)
    out = img.convert("RGBA")
    out.putalpha(mask)
    return out


def generate_brand_icons():
    edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    if not os.path.exists(edge_path):
        raise FileNotFoundError(f"Edge executable not found at {edge_path}")

    # Specifications: (filename, target_size, render_size, inner_ratio, rx, stroke_width, has_rim)
    specs = [
        # Apple touch icons (solid square #050505 with radial glow, iOS applies squircle mask)
        ("public/apple-touch-icon.png", 180, 360, 0.74, 0, "2.25", False),
        ("public/apple-touch-icon-precomposed.png", 180, 360, 0.74, 0, "2.25", False),
        ("src/app/apple-icon.png", 180, 360, 0.74, 0, "2.25", False),

        # Standard Android / PWA raster icons
        ("public/icon-192.png", 192, 384, 0.74, 0, "2.25", False),
        ("public/icon-512.png", 512, 512, 0.74, 0, "2.25", False),

        # Maskable Android icons (extra safe padding within 80% safe zone)
        ("public/icon-maskable-192.png", 192, 384, 0.62, 0, "2.25", False),
        ("public/icon-maskable-512.png", 512, 512, 0.62, 0, "2.25", False),

        # Favicon PNGs (supersampled at 256px then LANCZOS downsampled with pure transparent rounded corners)
        ("public/favicon-32x32.png", 32, 256, 0.80, 7, "2.3", True),
        ("public/favicon-16x16.png", 16, 256, 0.82, 3.5, "2.35", True),
        ("public/favicon-48x48.png", 48, 256, 0.80, 10, "2.3", True),
    ]

    temp_html = os.path.abspath("temp_icon_render.html")

    for rel_path, target_size, render_size, inner_ratio, rx, stroke_w, has_rim in specs:
        target_path = os.path.abspath(rel_path)
        os.makedirs(os.path.dirname(target_path), exist_ok=True)
        inner_px = int(round(render_size * inner_ratio))
        render_rx = (rx / target_size) * render_size if rx > 0 else 0
        rim_px = max(1, int(round(render_size / 32.0)))

        rim_svg = ""
        if has_rim:
            half = rim_px / 2.0
            rect_span = render_size - rim_px
            r_in = max(0.0, render_rx - half)
            rim_svg = f"""
            <svg style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none" viewBox="0 0 {render_size} {render_size}" fill="none">
              <defs>
                <linearGradient id="rimG" x1="0" y1="0" x2="{render_size}" y2="{render_size}" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stop-color="#00D2FF" stop-opacity="0.48" />
                  <stop offset="50%" stop-color="#FFFFFF" stop-opacity="0.14" />
                  <stop offset="100%" stop-color="#00D2FF" stop-opacity="0.28" />
                </linearGradient>
              </defs>
              <rect x="{half}" y="{half}" width="{rect_span}" height="{rect_span}" rx="{r_in}" stroke="url(#rimG)" stroke-width="{rim_px}" />
            </svg>
            """

        html_content = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
* {{ margin: 0; padding: 0; box-sizing: border-box; }}
html, body {{
    width: {render_size}px;
    height: {render_size}px;
    overflow: hidden;
    background: radial-gradient(circle at 50% 45%, #0A1926 0%, #050505 75%);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
}}
.mark {{
    width: {inner_px}px;
    height: {inner_px}px;
    position: relative;
    z-index: 2;
}}
</style>
</head>
<body>
{rim_svg}
<svg class="mark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path d="M12 2.5L3.5 7v10L12 21.5" stroke="#00D2FF" stroke-width="{stroke_w}" />
  <path d="M3.5 7L12 11.5" stroke="#00D2FF" stroke-width="{stroke_w}" />
  <path d="M3.5 12L9 15" stroke="#00D2FF" stroke-width="{stroke_w}" />
  <path d="M12 2.5L20.5 7" stroke="#FFFFFF" stroke-width="{stroke_w}" />
  <path d="M12 21.5v-10L20.5 17V7" stroke="#FFFFFF" stroke-width="{stroke_w}" />
</svg>
</body>
</html>"""

        with open(temp_html, "w", encoding="utf-8") as f:
            f.write(html_content)

        cmd = [
            edge_path,
            "--headless",
            "--disable-gpu",
            f"--screenshot={target_path}",
            f"--window-size={render_size},{render_size}",
            "--hide-scrollbars",
            "--force-device-scale-factor=1",
            f"file:///{temp_html}",
        ]
        res = subprocess.run(cmd, capture_output=True, text=True)
        if res.returncode != 0 or not os.path.exists(target_path):
            print(f"Error rendering {rel_path}: {res.stderr}")
        else:
            img = Image.open(target_path).convert("RGBA")
            if img.size != (target_size, target_size):
                img = img.resize((target_size, target_size), Image.Resampling.LANCZOS)
            if rx > 0:
                img = apply_squircle_mask(img, rx)
            img.save(target_path, "PNG", optimize=True)
            print(f"Generated {rel_path} ({target_size}x{target_size}, RGBA)")

    # Generate Multi-Resolution favicon.ico (16x16, 32x32, 48x48) in strict RGBA format
    with Image.open("public/favicon-48x48.png") as ico_48:
        ico_rgba = ico_48.convert("RGBA")
        for ico_dest in ["public/favicon.ico", "src/app/favicon.ico"]:
            ico_path = os.path.abspath(ico_dest)
            ico_rgba.save(
                ico_path,
                format="ICO",
                sizes=[(16, 16), (32, 32), (48, 48)],
            )
            print(f"Generated multi-res {ico_dest} (16, 32, 48, RGBA)")

    # Generate 1200x630 OpenGraph / Social Link Preview Card (public/og-image.png)
    og_target = os.path.abspath("public/og-image.png")
    og_html = """<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
html, body {
  width: 1200px;
  height: 630px;
  overflow: hidden;
  background: #050505;
  font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Inter, system-ui, sans-serif;
  color: #EDEDED;
}
.canvas {
  position: relative;
  width: 1200px;
  height: 630px;
  background:
    radial-gradient(circle at 80% 42%, rgba(0, 210, 255, 0.16) 0%, rgba(59, 130, 246, 0.06) 35%, transparent 68%),
    radial-gradient(circle at 18% 85%, rgba(0, 210, 255, 0.08) 0%, transparent 55%),
    #050505;
  padding: 52px 64px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.grid-overlay {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, rgba(255, 255, 255, 0.028) 1px, transparent 1px),
    linear-gradient(to bottom, rgba(255, 255, 255, 0.028) 1px, transparent 1px);
  background-size: 40px 40px;
  pointer-events: none;
}
.top-laser {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(90deg, #00D2FF 0%, #3B82F6 50%, transparent 100%);
}
.header-bar {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 8px 16px;
  border-radius: 999px;
  background: rgba(16, 185, 129, 0.08);
  border: 1px solid rgba(16, 185, 129, 0.28);
  font-family: 'Consolas', 'SFMono-Regular', monospace;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #10B981;
}
.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10B981;
  box-shadow: 0 0 10px #10B981;
}
.telemetry-coords {
  font-family: 'Consolas', 'SFMono-Regular', monospace;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.14em;
  color: rgba(237, 237, 237, 0.48);
}
.main-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 48px;
  margin: 12px 0;
}
.left-col {
  flex: 1;
  max-width: 690px;
}
.eyebrow {
  font-family: 'Consolas', 'SFMono-Regular', monospace;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: #00D2FF;
  margin-bottom: 14px;
}
.title {
  font-size: 54px;
  font-weight: 800;
  letter-spacing: -0.035em;
  line-height: 1.04;
  color: #FFFFFF;
  margin-bottom: 16px;
}
.title span {
  color: #00D2FF;
}
.subtitle {
  font-size: 21px;
  font-weight: 500;
  line-height: 1.42;
  color: #B4BCD0;
  margin-bottom: 28px;
}
.subtitle strong {
  color: #FFFFFF;
  font-weight: 600;
}
.pillars {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.pillar {
  padding: 9px 16px;
  border-radius: 10px;
  background: rgba(17, 20, 28, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.11);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);
  font-size: 13.5px;
  font-weight: 600;
  color: #E2E8F0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
.pillar-accent {
  border-color: rgba(0, 210, 255, 0.35);
  background: rgba(0, 210, 255, 0.08);
  color: #FFFFFF;
}
.pillar-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #00D2FF;
}
.right-col {
  width: 330px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  background: linear-gradient(145deg, rgba(17, 22, 33, 0.92) 0%, rgba(8, 10, 15, 0.96) 100%);
  border: 1px solid rgba(0, 210, 255, 0.28);
  box-shadow:
    0 24px 60px rgba(0, 0, 0, 0.7),
    inset 0 1px 0 rgba(255, 255, 255, 0.14);
  border-radius: 28px;
  padding: 32px 26px 26px 26px;
  position: relative;
}
.monolith-badge {
  width: 156px;
  height: 156px;
  border-radius: 34px;
  background: radial-gradient(circle at 50% 42%, #0D2235 0%, #050505 74%);
  border: 1.5px solid rgba(0, 210, 255, 0.38);
  box-shadow:
    0 14px 36px rgba(0, 210, 255, 0.14),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
}
.kpi-row {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.09);
  padding-top: 18px;
}
.kpi {
  text-align: center;
}
.kpi-val {
  font-family: 'Consolas', 'SFMono-Regular', monospace;
  font-size: 18px;
  font-weight: 800;
  color: #FFFFFF;
}
.kpi-val.cyan {
  color: #00D2FF;
}
.kpi-lbl {
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #8892B0;
  margin-top: 3px;
}
.footer-bar {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 18px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
.brand-sig {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #FFFFFF;
}
.brand-sig .dot {
  color: #3B82F6;
}
.domain-badge {
  font-family: 'Consolas', 'SFMono-Regular', monospace;
  font-size: 13px;
  font-weight: 600;
  color: #94A3B8;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.09);
  padding: 6px 14px;
  border-radius: 8px;
}
</style>
</head>
<body>
<div class="canvas">
  <div class="grid-overlay"></div>
  <div class="top-laser"></div>

  <div class="header-bar">
    <div class="status-pill">
      <span class="status-dot"></span>
      <span>POLYTECH LILLE · MINAKEM · MOBILITÉ R&amp;D INTERNATIONALE</span>
    </div>
    <div class="telemetry-coords">51.03°N 02.37°E // SYS.01–15</div>
  </div>

  <div class="main-content">
    <div class="left-col">
      <div class="eyebrow">ARCHITECTURE CYBER-PHYSIQUE &amp; MÉCATRONIQUE</div>
      <div class="title">ENRIQUE ALEX<br/><span>NDJAKOU KEMAYOU</span></div>
      <div class="subtitle">
        <strong>Ingénieur en Génie Électrique &amp; Mécatronique</strong> — Systèmes embarqués, robotique autonome, commande temps réel et architecture industrielle &amp; logicielle.
      </div>
      <div class="pillars">
        <div class="pillar pillar-accent"><span class="pillar-dot"></span>Systèmes Embarqués · C/C++ · AVR8</div>
        <div class="pillar"><span class="pillar-dot"></span>Robotique &amp; Commande Temps Réel</div>
        <div class="pillar"><span class="pillar-dot"></span>Architecture Logicielle &amp; SCADA</div>
        <div class="pillar"><span class="pillar-dot"></span>Électronique Active &amp; HIL Speedgoat</div>
      </div>
    </div>

    <div class="right-col">
      <div class="monolith-badge">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="112" height="112" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2.5L3.5 7v10L12 21.5" stroke="#00D2FF" stroke-width="2.2" />
          <path d="M3.5 7L12 11.5" stroke="#00D2FF" stroke-width="2.2" />
          <path d="M3.5 12L9 15" stroke="#00D2FF" stroke-width="2.2" />
          <path d="M12 2.5L20.5 7" stroke="#FFFFFF" stroke-width="2.2" />
          <path d="M12 21.5v-10L20.5 17V7" stroke="#FFFFFF" stroke-width="2.2" />
        </svg>
      </div>
      <div class="kpi-row">
        <div class="kpi">
          <div class="kpi-val cyan">15</div>
          <div class="kpi-lbl">Systèmes</div>
        </div>
        <div class="kpi">
          <div class="kpi-val">4 Axes</div>
          <div class="kpi-lbl">Ingénierie</div>
        </div>
        <div class="kpi">
          <div class="kpi-val cyan">R&amp;D</div>
          <div class="kpi-lbl">Intl. Mobility</div>
        </div>
      </div>
    </div>
  </div>

  <div class="footer-bar">
    <div class="brand-sig">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2.5L3.5 7v10L12 21.5" stroke="#00D2FF" />
        <path d="M3.5 7L12 11.5" stroke="#00D2FF" />
        <path d="M3.5 12L9 15" stroke="#00D2FF" />
        <path d="M12 2.5L20.5 7" stroke="#FFFFFF" />
        <path d="M12 21.5v-10L20.5 17V7" stroke="#FFFFFF" />
      </svg>
      <span>Enrique<span class="dot">.Ndjakou</span></span>
    </div>
    <div class="domain-badge">enrique-alex.pages.dev · portfolio.enriquekemayou.workers.dev</div>
  </div>
</div>
</body>
</html>"""

    with open(temp_html, "w", encoding="utf-8") as f:
        f.write(og_html)

    cmd_og = [
        edge_path,
        "--headless",
        "--disable-gpu",
        f"--screenshot={og_target}",
        "--window-size=1200,630",
        "--hide-scrollbars",
        "--force-device-scale-factor=1",
        f"file:///{temp_html}",
    ]
    res_og = subprocess.run(cmd_og, capture_output=True, text=True)
    if res_og.returncode == 0 and os.path.exists(og_target):
        og_img = Image.open(og_target).convert("RGB")
        if og_img.size != (1200, 630):
            og_img = og_img.resize((1200, 630), Image.Resampling.LANCZOS)
        og_quantized = og_img.quantize(colors=256, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.FLOYDSTEINBERG)
        og_quantized.save(og_target, "PNG", optimize=True)
        size_kb = os.path.getsize(og_target) / 1024.0
        print(f"Generated public/og-image.png (1200x630, {size_kb:.1f} KB)")

    # Clean up temp html and 48px temp png
    for cleanup_path in [temp_html, "public/favicon-48x48.png"]:
        if os.path.exists(cleanup_path):
            try:
                os.remove(cleanup_path)
            except Exception:
                pass


if __name__ == "__main__":
    generate_brand_icons()
