from __future__ import annotations

import json
import os
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from typing import Any
from urllib.parse import urlparse

from agentic.runtime import run_agentic_compliance_query


class AgenticRequestHandler(BaseHTTPRequestHandler):
    server_version = "OracleAgenticPython/1.0"

    def do_GET(self) -> None:
        parsed = urlparse(self.path)

        if parsed.path == "/health":
            self._json_response({"status": "ok", "service": "python-agentic-backend"})
            return

        self._json_response({"error": "not found"}, status=404)

    def do_POST(self) -> None:
        parsed = urlparse(self.path)

        if parsed.path != "/agentic-query":
            self._json_response({"error": "not found"}, status=404)
            return

        try:
            payload = self._read_json()
        except ValueError as exc:
            self._json_response({"error": str(exc)}, status=400)
            return

        missing = [field for field in ("query", "templateId", "managerEmail") if not payload.get(field)]

        if missing:
            self._json_response({"error": f"missing required fields: {', '.join(missing)}"}, status=400)
            return

        result = run_agentic_compliance_query(
            {
                "query": str(payload["query"]),
                "templateId": str(payload["templateId"]),
                "managerEmail": str(payload["managerEmail"]),
            }
        )
        self._json_response(result)

    def log_message(self, format: str, *args: Any) -> None:
        if os.getenv("AGENTIC_HTTP_ACCESS_LOG") == "1":
            super().log_message(format, *args)

    def _read_json(self) -> dict[str, Any]:
        length = int(self.headers.get("content-length", "0"))
        if length <= 0:
            raise ValueError("request body is required")

        try:
            body = self.rfile.read(length).decode("utf-8")
            payload = json.loads(body)
        except json.JSONDecodeError as exc:
            raise ValueError("request body must be valid JSON") from exc

        if not isinstance(payload, dict):
            raise ValueError("request body must be a JSON object")

        return payload

    def _json_response(self, payload: dict[str, Any], status: int = 200) -> None:
        encoded = json.dumps(payload).encode("utf-8")
        self.send_response(status)
        self.send_header("content-type", "application/json; charset=utf-8")
        self.send_header("content-length", str(len(encoded)))
        self.end_headers()
        self.wfile.write(encoded)


def main() -> None:
    host = os.getenv("PYTHON_AGENTIC_HOST", "0.0.0.0")
    port = int(os.getenv("PYTHON_AGENTIC_PORT", "8000"))
    server = ThreadingHTTPServer((host, port), AgenticRequestHandler)
    print(f"Python agentic backend running at http://{host}:{port}", flush=True)
    server.serve_forever()


if __name__ == "__main__":
    main()
