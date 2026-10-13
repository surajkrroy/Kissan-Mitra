# Assignment 05 — CampusEats Delivery REST API

## Run locally

From this folder's parent directory (`assignments/assignment-05`):

```powershell
python -m pip install -r delivery_rest/requirements.txt
$env:ORDERS_SERVICE_URL = "http://localhost:8103"
python -m uvicorn delivery_rest.app:app --host 127.0.0.1 --port 8102
```

The Orders URL is a dependency for creating a new delivery. For tests, the eligibility call is mocked. Protected endpoints require any non-empty demo header such as `Authorization: Bearer demo-token`; this assignment intentionally validates header presence only, not a real token system.

## Validate

From `assignments/assignment-05` run:

```powershell
python -m pytest -v delivery_rest/tests
python -m openapi_spec_validator delivery_rest/openapi.yaml
```

## Curl transcript

Start the service and run `delivery_rest/scripts/capture_curl_transcript.ps1` in a second PowerShell window. It uses `curl.exe -v` and captures success, idempotent replay, conditional 304, stale 412, malformed 400, missing-resource 404, and missing-token 401 cases.

The in-memory store is for coursework/demo use. Production should use durable storage, authenticated tokens, trusted HTTPS termination, and a distributed rate limiter.
