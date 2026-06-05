import json
from typing import Any, cast
from urllib.request import Request, urlopen

from .models import ExtractedDocument, FetchLog

JsonObject = dict[str, Any]


class BackendClient:
    def __init__(self, api_base_url: str, token: str):
        self.api_base_url = api_base_url.rstrip("/")
        self.token = token

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

    def _request(self, method: str, path: str, payload: JsonObject) -> JsonObject:
        data = json.dumps(payload).encode("utf-8")
        request = Request(
            self.api_base_url + path,
            data=data,
            method=method,
            headers={
                "Authorization": f"Bearer {self.token}",
                "Content-Type": "application/json",
            },
        )

        with urlopen(request, timeout=20) as response:
            parsed = json.loads(response.read().decode("utf-8"))
            return cast(JsonObject, parsed)
