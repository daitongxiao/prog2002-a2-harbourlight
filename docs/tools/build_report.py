"""Fill a copy of the supplied A2 report template while preserving its package parts."""

from copy import deepcopy
from pathlib import Path
from zipfile import ZipFile, ZIP_DEFLATED
import hashlib
from lxml import etree


ROOT = Path(__file__).resolve().parents[2]
SOURCE = Path(r"D:\OneDrive - Southern Cross University\桌面\web 2\PROG2002 A2 Report.docx")
OUTPUT = ROOT / "delivery" / "PROG2002 A2 Report.docx"
EXPECTED_SHA256 = "1b26e13e83e4531786823d3af959997686c3bcb392ed81f2f52d328b314e5137"
W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
NS = {"w": W}
QN = lambda name: f"{{{W}}}{name}"


ANSWERS = {
    8: [
        "Harbourlight Community Collective is a fictional Australian charity used for this educational project. Its public events invite people to contribute to community meals, environmental care, creative access and wellbeing. Visitors need a dependable way to see what is available, understand each event and compare its fundraising progress before deciding whether to participate.",
        "The project applies the course's client, server and database concepts to that task. The site is a read-only discovery service: it does not take registrations or payments. The organisation, event names, purposes, figures and uses of named venues are fictional; the city names refer to real places."
    ],
    10: [
        "A list of events is difficult to use when dates, locations and categories are scattered or stale. A visitor should be able to find a current or future event using one filter or a combination, open the selected event rather than an unrelated record, and see the full purpose, price and fundraising figures. Suspended and finished events must not appear as available.",
        "The assessed scope is the database, read-only API and three public pages. Register is a placeholder with the required message, not a working enrolment flow. Availability is based on an event's end instant in UTC; the displayed time and date filter follow Australia/Sydney. This distinction matters around midnight and daylight saving changes."
    ],
    13: [
        "The browser requests JSON from a Node.js and Express API through the client server's same-origin /api proxy. The API reads a MySQL database named charityevents_db using mysql2's promise-based connection pool and a SELECT-only account. The browser uses fetch Promises, checks HTTP responses, and creates DOM nodes with textContent for event data. It does not embed event records in HTML or write to the database.",
        "GET /api/events supplies the home and search views; optional date, location and category parameters are combined with AND. GET /api/categories fills the search selector. GET /api/events/:id supplies the selected detail page. The backend parameterises SQL, validates inputs, omits suspended and finished events, and returns JSON errors for invalid or unavailable requests. Loading, empty and failed requests have visible page states and a retry action."
    ],
    16: [
        "A consistent header links Home and Find events on each page; event cards link directly to one detail URL. The search form labels its date, place and category controls, and Clear filters resets both the fields and results. The browser URL reflects filters, so a result can be revisited. An AbortController prevents an older request from replacing a newer search result. Event details place time, venue, price and fundraising progress near the main description.",
        "The layout adapts to narrow screens, uses visible focus styles, and presents Register in a dismissible modal with focus returned to its trigger. DOM messages explain empty results and service errors. Desktop and 390-pixel mobile workflows were checked manually; no formal participant study or complete accessibility certification is claimed. The visual illustrations are original CSS shapes rather than purported photographs of fictional events."
    ],
    19: [
        "The database has organisations, categories and events. Each event has a primary key and required foreign keys to one organisation and one category; an organisation or category can have many events. The event row stores its name, UTC start and end instants, Sydney local start date, venue, city, purpose, full description, ticket price, fundraising goal, amount raised, optional image path and suspension flag. Money uses DECIMAL columns, while checks prevent negative amounts and an end before the start. Indexes support public availability and filtering.",
        "The seed contains one fictional organisation, five categories and eleven events: ten public samples plus one suspended sample. The local start date is stored separately so the date filter has an unambiguous Sydney meaning. The import script's sample dates were checked against their UTC instants; a future edit must update both fields together. The API reads only rows that are not suspended and have not finished."
    ],
    21: [
        "GET /api/events returns all public current and future events for Home and Search. Optional query parameters are date (YYYY-MM-DD Sydney start date), location (case-insensitive substring of venue or city) and category (positive category ID). Multiple filters use AND. GET /api/categories returns the available category IDs and names. GET /api/events/:id returns one public event by positive integer path ID, or 404 when it does not exist or is unavailable. The paths describe resources and every route is read-only."
    ],
    22: [
        "For example, GET /api/categories has no path parameter, query parameter or request body. Its purpose is to populate the category selector without hard-coded options. A local request to http://localhost:4101/api/categories returned HTTP 200 and the following response body on 27 September 2026:",
        '{"data":[{"id":3,"name":"Arts & Culture"},{"id":1,"name":"Community & Family"},{"id":2,"name":"Environment"},{"id":5,"name":"Food Relief"},{"id":4,"name":"Health & Wellbeing"}]}',
        "The client reads data from that JSON response and creates an option for each category. Event list responses use the same data wrapper; an invalid date or ID receives HTTP 400 with an error object, while an unavailable event receives HTTP 404."
    ],
    23: [
        "All three endpoints use GET because each retrieves data without changing server state: the event collection, the category collection or a single event. Filters remain query parameters on the collection, while the selected event ID is a path parameter. This lets browsers and testing tools request a resource directly. POST, PUT and DELETE would change data; this A2 implementation has no registration, administration or other write operation, so those methods are not implemented merely because they appear in the template's examples.",
        "Development note: AI assistance was used to draft and review code, tests, prose and the demo script. Student identity fields remain blank for completion before submission, and the demonstration must be recorded personally. The assessment brief's GenAI Use Level field is blank; this note does not assert course approval."
    ]
}


def make_run(text, *, bold=False):
    run = etree.Element(QN("r"))
    props = etree.SubElement(run, QN("rPr"))
    fonts = etree.SubElement(props, QN("rFonts"))
    fonts.set(QN("ascii"), "Arial")
    fonts.set(QN("hAnsi"), "Arial")
    size = etree.SubElement(props, QN("sz"))
    size.set(QN("val"), "24")
    if bold:
        etree.SubElement(props, QN("b"))
    node = etree.SubElement(run, QN("t"))
    node.set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
    node.text = text
    return run


def fill_paragraph(node, text):
    for child in list(node):
        if child.tag != QN("pPr"):
            node.remove(child)
    node.append(make_run(text))


def keep_with_next(node):
    props = node.find("w:pPr", NS)
    if props is None:
        props = etree.Element(QN("pPr"))
        node.insert(0, props)
    if props.find("w:keepNext", NS) is None:
        etree.SubElement(props, QN("keepNext"))


def build():
    if hashlib.sha256(SOURCE.read_bytes()).hexdigest() != EXPECTED_SHA256:
        raise RuntimeError("Template changed; inspect it again before filling")
    OUTPUT.parent.mkdir(parents=True, exist_ok=True)
    with ZipFile(SOURCE) as src:
        xml = etree.fromstring(src.read("word/document.xml"))
        body = xml.find("w:body", NS)
        paragraphs = [child for child in body if child.tag == QN("p")]
        if len(paragraphs) != 26:
            raise RuntimeError("Unexpected template paragraph count")
        paragraphs[5].append(make_run("Harbourlight Community Events", bold=True))
        for index in (7, 9, 11, 12, 14, 15, 17, 18, 20, 21, 22, 23):
            keep_with_next(paragraphs[index])
        blank_pattern = deepcopy(paragraphs[8])
        for index, texts in ANSWERS.items():
            anchor = paragraphs[index]
            if index in (8, 10, 13, 16, 19):
                fill_paragraph(anchor, texts[0])
                texts = texts[1:]
            for text in reversed(texts):
                new_para = deepcopy(blank_pattern)
                fill_paragraph(new_para, text)
                anchor.addnext(new_para)
        for paragraph in body.findall("w:p", NS):
            text = "".join(paragraph.itertext())
            if text.startswith("For example, GET /api/categories has"):
                keep_with_next(paragraph)
        document_bytes = etree.tostring(xml, xml_declaration=True, encoding="UTF-8", standalone=True)
        core = etree.fromstring(src.read("docProps/core.xml"))
        for name in ("{http://purl.org/dc/elements/1.1/}creator", "{http://schemas.openxmlformats.org/package/2006/metadata/core-properties}lastModifiedBy"):
            node = core.find(name)
            if node is not None:
                node.text = ""
        core_bytes = etree.tostring(core, xml_declaration=True, encoding="UTF-8", standalone=True)
        with ZipFile(OUTPUT, "w", ZIP_DEFLATED) as out:
            for entry in src.infolist():
                content = src.read(entry.filename)
                if entry.filename == "word/document.xml":
                    content = document_bytes
                elif entry.filename == "docProps/core.xml":
                    content = core_bytes
                out.writestr(entry, content)
    print(OUTPUT)


if __name__ == "__main__":
    build()
