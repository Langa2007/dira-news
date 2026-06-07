import json
from typing import Any, cast
from urllib.error import HTTPError
from urllib.request import Request, urlopen

from .models import ExtractedDocument, FetchLog

JsonObject = dict[str, Any]


class BackendClient:
    def __init__(self, api_base_url: str, token: str):
        self.api_base_url = api_base_url.rstrip("/")
        self.token = token

    @classmethod
    def login(cls, api_base_url: str, email: str, password: str) -> "BackendClient":
        data = cls._anonymous_request(
            api_base_url.rstrip("/"),
            "POST",
            "/auth/login",
            {"email": email, "password": password},
        )
        token = str(data.get("accessToken") or "")

        if not token:
            raise RuntimeError("Backend login did not return an access token")

        return cls(api_base_url, token)

    def list_sources(self) -> list[JsonObject]:
        data = self._request("GET", "/sources")
        sources = data.get("sources", [])
        return cast(list[JsonObject], sources if isinstance(sources, list) else [])

    def create_source(self, payload: JsonObject) -> JsonObject:
        data = self._request("POST", "/sources", payload)
        return cast(JsonObject, data.get("source", data))

    def list_source_documents(self, source_id: str) -> list[JsonObject]:
        data = self._request("GET", f"/sources/documents?sourceId={source_id}")
        documents = data.get("documents", [])
        return cast(list[JsonObject], documents if isinstance(documents, list) else [])

    def create_source_document(self, source_id: str, document: ExtractedDocument) -> JsonObject:
        return self._request(
            "POST",
            f"/sources/{source_id}/documents",
            document.to_backend_payload(),
        )

    def update_fetch_status(self, fetch_id: str, log: FetchLog) -> JsonObject:
        payload: JsonObject = {
            "status": log.status,
            "httpStatus": log.http_status,
            "error": log.error,
        }
        return self._request("PATCH", f"/sources/fetches/{fetch_id}", payload)

    def _request(self, method: str, path: str, payload: JsonObject | None = None) -> JsonObject:
        data = json.dumps(payload).encode("utf-8") if payload is not None else None
        request = Request(
            self.api_base_url + path,
            data=data,
            method=method,
            headers={
                "Authorization": f"Bearer {self.token}",
                "Content-Type": "application/json",
            },
        )

        try:
            with urlopen(request, timeout=20) as response:
                parsed = json.loads(response.read().decode("utf-8"))
                return cast(JsonObject, parsed)
        except HTTPError as exc:
            raise RuntimeError(_error_message(exc)) from exc

    @staticmethod
    def _anonymous_request(api_base_url: str, method: str, path: str, payload: JsonObject | None = None) -> JsonObject:
        data = json.dumps(payload).encode("utf-8") if payload is not None else None
        request = Request(
            api_base_url + path,
            data=data,
            method=method,
            headers={"Content-Type": "application/json"},
        )

        try:
            with urlopen(request, timeout=20) as response:
                parsed = json.loads(response.read().decode("utf-8"))
                return cast(JsonObject, parsed)
        except HTTPError as exc:
            raise RuntimeError(_error_message(exc)) from exc


def _error_message(error: HTTPError) -> str:
    body = error.read().decode("utf-8", errors="replace")

    try:
        data = json.loads(body)
        message = data.get("error", {}).get("message") or data.get("message")

        if message:
            return f"Backend returned {error.code}: {message}"
    except json.JSONDecodeError:
        pass

    return f"Backend returned {error.code}: {body or error.reason}"
