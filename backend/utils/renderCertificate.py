import io
import json
import os
import sys
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


DEFAULT_WIDTH = 1200
DEFAULT_HEIGHT = 850


def load_image(source_path, url):
    if source_path and os.path.exists(source_path):
        return Image.open(source_path).convert("RGB")
    with urllib.request.urlopen(url, timeout=20) as response:
        data = response.read()
    image = Image.open(io.BytesIO(data)).convert("RGB")
    return image


def color(value):
    try:
        return HexColor(str(value or "#000000"))
    except Exception:
        return HexColor("#000000")


def value_for(field_name, field_config, variables):
    raw = field_config.get("text") or field_config.get("value")
    if raw:
        text = str(raw)
        for key, value in variables.items():
            text = text.replace("{{" + key + "}}", str(value or ""))
            text = text.replace("{{ " + key + " }}", str(value or ""))
        return text
    if field_name in ("barcode", "qr"):
        return str(variables.get("verification_code") or variables.get("certificate_id") or "")
    return str(variables.get(field_name, "") or "")


def draw_text(pdf, name, config, variables):
    text = value_for(name, config, variables)
    if not text:
        return
    font_size = float(config.get("fontSize") or config.get("font_size") or 22)
    font_name = config.get("font") or "Helvetica"
    max_width = config.get("width") or config.get("maxWidth") or config.get("max_width")
    pdf.setFont(font_name, font_size)
    pdf.setFillColor(color(config.get("color")))
    x = float(config.get("x") or 0)
    y = float(config.get("y") or 0)

    if max_width:
        max_width = float(max_width)
        while font_size > 8 and pdf.stringWidth(text, font_name, font_size) > max_width:
            font_size -= 1
        pdf.setFont(font_name, font_size)

    pdf.drawString(x, DEFAULT_HEIGHT - y - font_size, text)


def draw_barcode(pdf, config, variables):
    code = value_for("barcode", config, variables) or str(variables.get("verification_code") or variables.get("certificate_id") or "")
    if not code:
        return
    barcode = code128.Code128(code, barHeight=float(config.get("height") or 42), barWidth=float(config.get("barWidth") or 1.1))
    barcode.drawOn(pdf, float(config.get("x") or 0), DEFAULT_HEIGHT - float(config.get("y") or 0) - float(config.get("height") or 42))


def draw_qr(pdf, config, variables):
    if qrcode is None:
        return
    data = value_for("qr", config, variables) or str(variables.get("verification_code") or variables.get("certificate_id") or "")
    if not data:
        return
    size = int(config.get("size") or min(float(config.get("width") or 96), float(config.get("height") or 96)))
    image = qrcode.make(data).convert("RGB")
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    buffer.seek(0)
    pdf.drawImage(ImageReader(buffer), float(config.get("x") or 0), DEFAULT_HEIGHT - float(config.get("y") or 0) - size, width=size, height=size)


def draw_page(pdf, image, field_config, variables, side):
    pdf.drawImage(ImageReader(image), 0, 0, width=DEFAULT_WIDTH, height=DEFAULT_HEIGHT)
    for name, config in field_config.items():
        if not isinstance(config, dict):
            continue
        if config.get("enabled") is False:
            continue
        if config.get("side", "front") != side:
            continue
        field_type = config.get("type") or name
        if field_type == "barcode" or name == "barcode":
            draw_barcode(pdf, config, variables)
        elif field_type == "qr" or name == "qr":
            draw_qr(pdf, config, variables)
        else:
            draw_text(pdf, name, config, variables)


def main():
    payload = json.loads(sys.stdin.buffer.read().decode("utf-8"))
    variables = payload.get("variables") or {}
    field_config = payload.get("fieldConfig") or {}
    front = load_image(payload.get("frontTemplatePath"), payload["frontTemplateUrl"])
    back = load_image(payload.get("backTemplatePath"), payload["backTemplateUrl"])

    output = io.BytesIO()
    pdf = canvas.Canvas(output, pagesize=(DEFAULT_WIDTH, DEFAULT_HEIGHT))
    draw_page(pdf, front, field_config, variables, "front")
    pdf.showPage()
    draw_page(pdf, back, field_config, variables, "back")
    pdf.save()

    sys.stdout.buffer.write(output.getvalue())


if __name__ == "__main__":
    main()
