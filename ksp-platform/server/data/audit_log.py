import csv
import os

AUDIT_LOG_PATH = os.path.join(os.path.dirname(__file__), "audit_log.csv")

AUDIT_LOG_FIELDS = [
    "timestamp",
    "username",
    "role",
    "endpoint",
    "query",
    "response_summary",
]


def log_query(user: dict, endpoint: str, query_text: str, response_summary: str, timestamp: str) -> None:
    os.makedirs(os.path.dirname(AUDIT_LOG_PATH), exist_ok=True)
    file_exists = os.path.exists(AUDIT_LOG_PATH)

    with open(AUDIT_LOG_PATH, "a", newline="", encoding="utf-8") as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=AUDIT_LOG_FIELDS)
        if not file_exists:
            writer.writeheader()

        writer.writerow({
            "timestamp": timestamp,
            "username": user.get("username", "unknown"),
            "role": user.get("role", "unknown"),
            "endpoint": endpoint,
            "query": query_text,
            "response_summary": response_summary,
        })
