import io
import json
import os
import sys
import base64
import urllib.request

from PIL import Image
from reportlab.graphics.barcode import code128
from reportlab.lib.colors import HexColor
from reportlab.lib.utils import ImageReader
from reportlab.pdfgen import canvas

try:
    import qrcode
except Exception:
    qrcode = None


WIDTH = 1200
HEIGHT = 850


def load_image(path, fallback_path=None):
    try:
        if path and str(path).startswith("data:image/"):
            _header, encoded = str(path).split(",", 1)
            return Image.open(io.BytesIO(base64.b64decode(encoded))).convert("RGB")
        if path and str(path).startswith(("http://", "https://")):
            with urllib.request.urlopen(path, timeout=10) as response:
                return Image.open(io.BytesIO(response.read())).convert("RGB")
        if path and os.path.exists(path):
            return Image.open(path).convert("RGB")
    except Exception:
        pass
    if fallback_path and os.path.exists(fallback_path):
        return Image.open(fallback_path).convert("RGB")
    raise FileNotFoundError(f"Template image not found: {path}")


def draw_text(pdf, text, x, y, size=28, color="#000000", font="Helvetica", width=None):
    if text is None or text == "":
        return
    text = str(text)
    if width:
        next_size = size
        while next_size > 8 and pdf.stringWidth(text, font, next_size) > width:
            next_size -= 1
        size = next_size
    pdf.setFont(font, size)
    pdf.setFillColor(HexColor(color))
    pdf.drawString(x, HEIGHT - y - size, text)


def draw_qr(pdf, value, x, y, size=118):
    if qrcode is None or not value:
        return
    image = qrcode.make(str(value)).convert("RGB")
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    buffer.seek(0)
    pdf.drawImage(ImageReader(buffer), x, HEIGHT - y - size, width=size, height=size)


def draw_barcode(pdf, value, x, y, height=46):
    if not value:
        return
    barcode = code128.Code128(str(value), barHeight=height, barWidth=1.1)
    barcode.drawOn(pdf, x, HEIGHT - y - height)


def field_value(name, config, fields):
    value = config.get("value") or config.get("text")
    if value:
        value = str(value)
        for key, field in fields.items():
            value = value.replace("{{" + key + "}}", str(field or ""))
            value = value.replace("{{ " + key + " }}", str(field or ""))
        return value
    return str(fields.get(name, "") or "")


def draw_fields(pdf, field_config, fields, side):
    for name, config in (field_config or {}).items():
        if not isinstance(config, dict):
            continue
        if config.get("visible") is False:
            continue
        if config.get("enabled") is False:
            continue
        if config.get("side", "front") != side:
            continue
        x = float(config.get("x") or 0)
        y = float(config.get("y") or 0)
        width = float(config.get("width") or 180)
        height = float(config.get("height") or 42)
        field_type = config.get("type") or name
        if field_type == "qr" or name == "qr":
            draw_qr(pdf, field_value("verification_code", config, fields), x, y, min(width, height))
        elif field_type == "barcode" or name == "barcode":
            draw_barcode(pdf, field_value("verification_code", config, fields), x, y, height)
        else:
            draw_text(
                pdf,
                field_value(name, config, fields),
                x,
                y,
                float(config.get("fontSize") or config.get("font_size") or 22),
                config.get("color") or "#000000",
                config.get("font") or "Helvetica-Bold",
                width,
            )


def draw_page(pdf, image, fields, field_config, side):
    pdf.drawImage(ImageReader(image), 0, 0, width=WIDTH, height=HEIGHT)
    draw_fields(pdf, field_config, fields, side)


def main():
    payload = json.loads(sys.stdin.buffer.read().decode("utf-8"))
    fields = payload.get("fields") or {}
    field_config = payload.get("fieldConfig") or {}
    front = load_image(payload.get("frontTemplatePath"), payload.get("fallbackFrontTemplatePath"))
    back = load_image(payload.get("backTemplatePath"), payload.get("fallbackBackTemplatePath"))

    output = io.BytesIO()
    pdf = canvas.Canvas(output, pagesize=(WIDTH, HEIGHT))
    draw_page(pdf, front, fields, field_config, "front")
    pdf.showPage()
    draw_page(pdf, back, fields, field_config, "back")
    pdf.save()
    sys.stdout.buffer.write(output.getvalue())


if __name__ == "__main__":
    main()
