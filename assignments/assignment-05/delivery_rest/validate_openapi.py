"""Offline OpenAPI structural check; use openapi-spec-validator for full spec validation."""
from pathlib import Path
import sys
import yaml

path = Path(__file__).with_name("openapi.yaml")
errors = []
try:
    spec = yaml.safe_load(path.read_text(encoding="utf-8"))
except Exception as exc:
    print(f"ERROR: YAML parse failed: {exc}")
    sys.exit(1)
if not isinstance(spec, dict): errors.append("document root must be an object")
if spec.get("openapi") != "3.0.3": errors.append("openapi version must be 3.0.3")
for key in ("info", "servers", "paths", "components"):
    if key not in spec: errors.append(f"missing top-level field: {key}")
components = spec.get("components", {})
schemas = components.get("schemas", {})
if not schemas: errors.append("components.schemas is empty")

def walk(value, where="root"):
    if isinstance(value, dict):
        ref = value.get("$ref")
        if isinstance(ref, str) and ref.startswith("#/"):
            parts = ref[2:].split("/")
            target = spec
            try:
                for part in parts: target = target[part]
            except (KeyError, TypeError): errors.append(f"unresolved local ref {ref} at {where}")
        for k, v in value.items(): walk(v, f"{where}.{k}")
    elif isinstance(value, list):
        for i, v in enumerate(value): walk(v, f"{where}[{i}]")
walk(spec)
methods = {"get", "post", "put", "patch", "delete", "options", "head", "trace"}
operation_count = 0
for route, path_item in spec.get("paths", {}).items():
    for method, operation in path_item.items():
        if method.lower() not in methods: continue
        operation_count += 1
        if not isinstance(operation, dict) or not operation.get("responses"):
            errors.append(f"{method.upper()} {route} has no responses")
        if method.lower() in {"post", "put", "patch"} and not operation.get("requestBody") and not operation.get("parameters"):
            errors.append(f"{method.upper()} {route} has no requestBody or parameters")
        if method.lower() != "options" and route != "/health" and not operation.get("security", spec.get("security")):
            errors.append(f"{method.upper()} {route} does not declare security")
if operation_count < 8: errors.append("expected at least eight documented operations")
if errors:
    print(f"OpenAPI structural validation: FAILED ({len(errors)} error(s))")
    for error in errors: print(f"- {error}")
    sys.exit(1)
print("OpenAPI YAML parse: PASS")
print(f"Local structural checks: PASS ({operation_count} operations, {len(schemas)} schemas, local refs resolved)")
print("Errors: 0")
print("For full specification validation, run: python -m openapi_spec_validator openapi.yaml")
