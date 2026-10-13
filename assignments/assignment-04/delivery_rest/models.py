"""Domain model for Delivery; internal fields are never serialized directly."""
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any
from uuid import uuid4


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')


@dataclass
class TrackingEvent:
    event_id: str
    location: str | None
    description: str
    event_time: str
    created_at: str = field(default_factory=utc_now)

    def as_json(self) -> dict[str, Any]:
        return {
            "eventId": self.event_id,
            "location": self.location,
            "description": self.description,
            "eventTime": self.event_time,
        }


@dataclass
class Delivery:
    delivery_id: str
    internal_id: int
    order_id: str
    delivery_address: str
    package_details: str | None
    status: str = "PENDING"
    tracking_number: str | None = None
    created_at: str = field(default_factory=utc_now)
    updated_at: str = field(default_factory=utc_now)
    idempotency_key: str = ""       # internal only
    request_fingerprint: str = ""   # internal only
    partner_reference: str | None = None  # internal only
    tracking_events: list[TrackingEvent] = field(default_factory=list)

    def as_json(self, include_events: bool = True) -> dict[str, Any]:
        """Public representation deliberately excludes keys/fingerprints/partner refs."""
        result: dict[str, Any] = {
            "deliveryId": self.delivery_id,
            "orderId": self.order_id,
            "deliveryAddress": self.delivery_address,
            "packageDetails": self.package_details,
            "status": self.status,
            "trackingNumber": self.tracking_number,
            "createdAt": self.created_at,
            "updatedAt": self.updated_at,
        }
        if include_events:
            result["trackingEvents"] = [event.as_json() for event in self.tracking_events]
        return result
