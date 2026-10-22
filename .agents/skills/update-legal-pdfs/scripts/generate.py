from html import escape
from pathlib import Path
import re

from reportlab import rl_config
from reportlab.lib import colors
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    HRFlowable,
    ListFlowable,
    ListItem,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[4]
rl_config.invariant = 1
SOURCES = ROOT / "packages/docs/docs"
OUTPUT = ROOT / "packages/docs/static/docs"
OUTPUT.mkdir(parents=True, exist_ok=True)
DOCUMENTS = ("terms", "privacy", "dpa", "dpia")
current_document = ""


def inline(value: str) -> str:
    value = escape(value.strip())
    value = re.sub(
        r"\[([^]]+)\]\(([^)]+)\)",
        lambda match: '<link href="{}" color="#135f9c">{}</link>'.format(
            escape(
                "https://www.remotion.dev" + match.group(2)
                if match.group(2).startswith("/")
                else "https://www.remotion.dev/docs/" + current_document + match.group(2)
                if match.group(2).startswith("#")
                else match.group(2),
                quote=True,
            ),
            match.group(1),
        ),
        value,
    )
    value = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", value)
    value = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r"<i>\1</i>", value)
    value = re.sub(r"(?<!\w)_([^_]+)_(?!\w)", r"<i>\1</i>", value)
    value = re.sub(r"&lt;br\s*/?&gt;", "<br/>", value)
    return value


styles = getSampleStyleSheet()
styles.add(ParagraphStyle(name="LegalTitle", fontName="Helvetica-Bold", fontSize=19, leading=23, textColor=colors.HexColor("#172b42"), spaceAfter=11))
styles.add(ParagraphStyle(name="LegalBody", fontName="Helvetica", fontSize=9.2, leading=13.5, spaceAfter=8))
styles.add(ParagraphStyle(name="LegalH2", fontName="Helvetica-Bold", fontSize=11.6, leading=15, textColor=colors.HexColor("#172b42"), spaceBefore=11, spaceAfter=6, keepWithNext=True))
styles.add(ParagraphStyle(name="LegalH3", parent=styles["LegalH2"], fontSize=10, leading=13, spaceBefore=8))
styles.add(ParagraphStyle(name="LegalNote", parent=styles["LegalBody"], backColor=colors.HexColor("#edf4f8"), borderPadding=9, spaceBefore=4, spaceAfter=12))
styles.add(ParagraphStyle(name="LegalBullet", parent=styles["LegalBody"], spaceAfter=3))
styles.add(ParagraphStyle(name="LegalCell", fontName="Helvetica", fontSize=7.1, leading=9.2))
styles.add(ParagraphStyle(name="LegalCellHead", parent=styles["LegalCell"], fontName="Helvetica-Bold", textColor=colors.white))


for name in DOCUMENTS:
    current_document = name
    lines = (SOURCES / f"{name}.mdx").read_text().splitlines()
    frontmatter_end = lines.index("---", 1)
    title_line = next(line for line in lines[1:frontmatter_end] if line.startswith("title:"))
    title = title_line.removeprefix("title:").strip().strip("'\"")
    lines = lines[frontmatter_end + 1 :]
    story = [Paragraph(escape(title), styles["LegalTitle"])]
    paragraph = []
    bullets = []

    def flush_paragraph():
        if paragraph:
            story.append(Paragraph(inline(" ".join(paragraph)), styles["LegalBody"]))
            paragraph.clear()

    def flush_bullets():
        if bullets:
            story.append(ListFlowable(
                [ListItem(Paragraph(inline(item), styles["LegalBullet"]), leftIndent=16 + indent * 12) for indent, item in bullets],
                bulletType="bullet", start="circle", leftIndent=16, bulletFontSize=5,
            ))
            story.append(Spacer(1, 5))
            bullets.clear()

    i = 0
    while i < len(lines):
        raw = lines[i]
        line = raw.strip()
        i += 1
        if line == f"[Download PDF](/docs/{name}.pdf)":
            continue
        if line.startswith(":::info"):
            note = []
            while i < len(lines) and lines[i].strip() != ":::":
                if lines[i].strip():
                    note.append(lines[i].strip())
                i += 1
            i += 1
            story.append(Paragraph(inline(" ".join(note)), styles["LegalNote"]))
            continue
        if not line:
            flush_paragraph()
            flush_bullets()
            continue
        if re.match(r"^#{2,4} ", line):
            flush_paragraph()
            flush_bullets()
            level = "LegalH3" if line.startswith("###") else "LegalH2"
            story.append(Paragraph(inline(re.sub(r"\s*\{#.*\}$", "", line.lstrip("# "))), styles[level]))
            continue
        if line.startswith("- "):
            flush_paragraph()
            bullets.append((len(raw) - len(raw.lstrip()), line[2:]))
            continue
        if line.startswith("| "):
            flush_paragraph()
            flush_bullets()
            rows = []
            while True:
                cells = [cell.strip() for cell in line.strip("|").split("|")]
                if not all(re.fullmatch(r"[-: ]+", cell) for cell in cells):
                    rows.append(cells)
                if i >= len(lines) or not lines[i].strip().startswith("|"):
                    break
                line = lines[i].strip()
                i += 1
            widths = {3: [153, 64, 264], 4: [120, 120, 210, 31]}.get(len(rows[0]))
            if widths is None:
                widths = [481 / len(rows[0])] * len(rows[0])
            table = Table(
                [[Paragraph(inline(cell), styles["LegalCellHead"] if row_idx == 0 else styles["LegalCell"]) for cell in row] for row_idx, row in enumerate(rows)],
                colWidths=widths, repeatRows=1, hAlign="LEFT",
            )
            table.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#253d56")),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#f3f6f8")]),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 5),
                ("RIGHTPADDING", (0, 0), (-1, -1), 5),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
                ("LINEBELOW", (0, -1), (-1, -1), 0.5, colors.HexColor("#c9d4dd")),
            ]))
            story.append(table)
            story.append(Spacer(1, 9))
            continue
        if line == "---":
            flush_paragraph()
            flush_bullets()
            story.append(HRFlowable(width="100%", thickness=0.5, color=colors.HexColor("#b9c4cf")))
            continue
        paragraph.append(line)

    flush_paragraph()
    flush_bullets()

    def footer(canvas, doc):
        canvas.saveState()
        canvas.setStrokeColor(colors.HexColor("#d4dce3"))
        canvas.line(20 * mm, 16 * mm, 190 * mm, 16 * mm)
        canvas.setFont("Helvetica", 7)
        canvas.setFillColor(colors.HexColor("#687786"))
        canvas.drawString(20 * mm, 11 * mm, f"Remotion AG  |  {title}")
        canvas.drawRightString(190 * mm, 11 * mm, str(doc.page))
        canvas.restoreState()

    pdf = OUTPUT / f"{name}.pdf"
    doc = SimpleDocTemplate(
        str(pdf), pagesize=A4, rightMargin=20 * mm, leftMargin=20 * mm,
        topMargin=19 * mm, bottomMargin=23 * mm,
        title=title, author="Remotion AG",
    )
    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    print(pdf)
