from io import BytesIO
import re

from fastapi import APIRouter, File, HTTPException, UploadFile

router = APIRouter(prefix="/resume", tags=["Resume"])

MAX_FILE_SIZE = 5 * 1024 * 1024


def extract_text(filename: str, content: bytes) -> str:
    extension = filename.lower().rsplit(".", 1)[-1] if "." in filename else ""

    if extension == "txt":
        return content.decode("utf-8", errors="ignore")

    if extension == "pdf":
        try:
            from pypdf import PdfReader
        except ImportError:
            raise HTTPException(
                status_code=500,
                detail="pypdf is not installed. Run: pip install pypdf",
            )

        reader = PdfReader(BytesIO(content))
        return "\n".join(page.extract_text() or "" for page in reader.pages)

    if extension == "docx":
        try:
            from docx import Document
        except ImportError:
            raise HTTPException(
                status_code=500,
                detail="python-docx is not installed. Run: pip install python-docx",
            )

        document = Document(BytesIO(content))
        paragraphs = [p.text for p in document.paragraphs]
        return "\n".join(paragraphs)

    raise HTTPException(
        status_code=400,
        detail="Only PDF, DOCX, and TXT resumes are supported.",
    )


def calculate_ats_score(text: str):
    normalized = re.sub(r"\s+", " ", text.lower()).strip()
    words = re.findall(r"\b[a-zA-Z][a-zA-Z+#.-]{1,}\b", normalized)
    word_count = len(words)

    score = 0
    suggestions = []

    # Contact information - 15 points
    has_email = bool(re.search(r"[\w.+-]+@[\w-]+\.[\w.-]+", normalized))
    has_phone = bool(re.search(r"(?:\+?\d[\d\s().-]{8,}\d)", normalized))
    if has_email:
        score += 8
    else:
        suggestions.append("Add a professional email address.")
    if has_phone:
        score += 7
    else:
        suggestions.append("Add a reachable phone number.")

    # Standard resume sections - 30 points
    sections = {
        "experience": ["experience", "work experience", "employment"],
        "education": ["education", "academic", "qualification"],
        "skills": ["skills", "technical skills", "core skills"],
        "projects": ["projects", "personal projects", "academic projects"],
        "certifications": ["certifications", "certificates", "licenses"],
    }

    section_hits = 0
    for name, variants in sections.items():
        if any(v in normalized for v in variants):
            section_hits += 1
        else:
            suggestions.append(f"Consider adding a clear {name.title()} section.")

    score += min(section_hits * 6, 30)

    # Skills / keyword density - 20 points
    skill_keywords = [
        "python", "java", "javascript", "typescript", "react", "node",
        "fastapi", "django", "flask", "sql", "mysql", "postgresql",
        "mongodb", "git", "github", "docker", "aws", "azure", "gcp",
        "machine learning", "deep learning", "data analysis", "pandas",
        "numpy", "scikit-learn", "tensorflow", "pytorch", "api", "rest",
    ]
    matched_skills = sum(1 for skill in skill_keywords if skill in normalized)
    score += min(matched_skills * 2, 20)
    if matched_skills < 5:
        suggestions.append("Add more relevant technical skills and job-specific keywords.")

    # Action verbs - 15 points
    action_verbs = [
        "developed", "built", "created", "implemented", "designed",
        "automated", "optimized", "led", "managed", "improved",
        "analyzed", "deployed", "engineered", "integrated",
    ]
    action_hits = sum(1 for verb in action_verbs if re.search(rf"\b{re.escape(verb)}\b", normalized))
    score += min(action_hits * 2, 15)
    if action_hits < 4:
        suggestions.append("Use stronger action verbs such as Built, Developed, Implemented, and Optimized.")

    # Length - 10 points
    if 350 <= word_count <= 1000:
        score += 10
    elif 250 <= word_count < 350 or 1000 < word_count <= 1300:
        score += 6
        suggestions.append("Aim for a concise resume of roughly 350–1000 words.")
    else:
        suggestions.append("Your resume appears too short or too long for a typical ATS-friendly format.")

    score = min(score, 100)

    if not text.strip():
        score = 0
        suggestions = ["No readable text was found. Make sure the resume contains selectable text rather than only scanned images."]

    if score >= 80:
        label = "Strong ATS readiness"
    elif score >= 60:
        label = "Good, but can improve"
    else:
        label = "Needs improvement"

    return score, label, suggestions[:6], word_count


@router.post("/ats-score")
async def ats_score(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="Please select a resume file.")

    content = await file.read()

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="Resume must be smaller than 5 MB.")

    text = extract_text(file.filename, content)
    score, label, suggestions, word_count = calculate_ats_score(text)

    return {
        "filename": file.filename,
        "score": score,
        "label": label,
        "word_count": word_count,
        "suggestions": suggestions,
    }