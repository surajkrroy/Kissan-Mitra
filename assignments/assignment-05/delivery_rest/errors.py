"""One consistent RFC 9457-style problem response helper."""
from fastapi.responses import JSONResponse

TITLES = {
    400: "Bad Request", 401: "Unauthorized", 403: "Forbidden", 404: "Not Found",
    406: "Not Acceptable", 409: "Conflict", 412: "Precondition Failed",
    422: "Unprocessable Content", 429: "Too Many Requests", 502: "Bad Gateway",
    503: "Service Unavailable",
}


def problem(status: int, detail: str, *, code: str | None = None, headers: dict | None = None) -> JSONResponse:
    body = {
        "type": f"https://httpstatuses.com/{status}",
        "title": TITLES.get(status, "Request Failed"),
        "status": status,
        "detail": detail,
    }
    if code:
        body["code"] = code
    return JSONResponse(status_code=status, content=body, headers=headers or {})
