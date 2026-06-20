from datetime import datetime
from io import BytesIO
from typing import List

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from fastapi.responses import JSONResponse

from ai.gemini import ask_gemini
from auth.dependencies import get_current_user
from data.audit_log import log_query

router = APIRouter()

async def summarize_upload(uploaded: UploadFile) -> str:
    filename = uploaded.filename or "unknown"
    try:
        raw_bytes = await uploaded.read()
        if filename.lower().endswith(".pdf"):
            try:
                from pypdf import PdfReader

                pdf = PdfReader(BytesIO(raw_bytes))
                pages = [page.extract_text() or "" for page in pdf.pages]
                extracted_text = "\n".join(pages).strip()
                if extracted_text:
                    return f"PDF '{filename}' extracted text:\n{extracted_text[:2000]}"
                return f"PDF '{filename}' was uploaded but no extractable text was found."
            except Exception as pdf_exc:
                return f"PDF '{filename}' could not be extracted: {str(pdf_exc)}"

        if uploaded.content_type and uploaded.content_type.startswith("text/"):
            text = raw_bytes.decode("utf-8", errors="replace").strip()
            return f"Text file '{filename}' content:\n{text[:2000]}"

        if filename.lower().endswith((".txt", ".md", ".csv", ".json")):
            text = raw_bytes.decode("utf-8", errors="replace").strip()
            return f"Text file '{filename}' content:\n{text[:2000]}"

        return f"Uploaded file '{filename}' is a {uploaded.content_type or 'binary'} file. Content extraction is not available for this type."
    except Exception as exc:
        return f"Uploaded file '{filename}' could not be processed: {str(exc)}"

@router.post("/")
async def chat_endpoint(
    query: str = Form(""),
    language: str = Form("en"),
    files: List[UploadFile] = File(default=[]),
    current_user: dict = Depends(get_current_user),
):
    if current_user.get("role") not in ["officer", "commander", "admin"]:
        raise HTTPException(status_code=403, detail="Insufficient permissions")

    if not query and not files:
        raise HTTPException(status_code=400, detail="Please provide a text query or attach files.")

    try:
        lang = (language or "en").lower()
        if lang not in ("en", "kn"):
            lang = "en"

        file_contexts = []
        for uploaded in files or []:
            if uploaded and uploaded.filename:
                file_contexts.append(await summarize_upload(uploaded))

        prompt = query.strip() or "User uploaded files for review."
        if file_contexts:
            prompt += "\n\nAttached file details:\n" + "\n\n".join(file_contexts)
            prompt += "\n\nPlease answer the question using the uploaded file information."

        resp = await ask_gemini(prompt, language=lang)
        answer = resp.get("answer") if isinstance(resp, dict) else str(resp)
        reasoning = resp.get("reasoning") if isinstance(resp, dict) else ""

        summary = (answer[:200] if answer else (reasoning[:200] if reasoning else ""))
        log_query(
            current_user,
            "/chat",
            query,
            summary,
            datetime.utcnow().isoformat(),
        )

        return {
            "response": answer,
            "reasoning": reasoning,
            "source": "gemini"
        }
    except Exception as e:
        print(f"Chat error: {str(e)}")
        log_query(
            current_user,
            "/chat",
            query,
            f"error: {str(e)}",
            datetime.utcnow().isoformat(),
        )
        return JSONResponse(
            status_code=500,
            content={"error": f"Failed to process AI request: {str(e)}"}
        )
