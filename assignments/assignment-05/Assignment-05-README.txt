Kissan Mitra / CampusEats — Assignment 05 Delivery REST API

Extract this ZIP into your repository, preserving the path:
assignments/assignment-05/delivery_rest/

Do not replace assignments/assignment-04 or unrelated Assignment 1/backend/frontend files.

Run from the repository root in PowerShell:
  python -m pip install -r assignments/assignment-05/delivery_rest/requirements.txt
  $env:PYTHONPATH = (Resolve-Path assignments/assignment-05).Path
  python -m pytest -v assignments/assignment-05/delivery_rest/tests
  python assignments/assignment-05/delivery_rest/validate_openapi.py
  python -m openapi_spec_validator assignments/assignment-05/delivery_rest/openapi.yaml

To run the service from the assignments/assignment-05 directory:
  $env:ORDERS_SERVICE_URL = "http://localhost:8103"
  python -m uvicorn delivery_rest.app:app --host 127.0.0.1 --port 8102

Use the included tests/mock_orders_service.py as the local Orders eligibility mock if needed.
The included curl-transcript.txt was captured with curl -v against a local Delivery API and mock Orders service. The PowerShell capture script can regenerate it when the service is running.

Team ID: 19
Vivek Kumar — 20251651104
Sandeep Parmar — 20251651082
Dipesh Mishra — 20251651036
Suraj Kumar Saw — 20251651092
