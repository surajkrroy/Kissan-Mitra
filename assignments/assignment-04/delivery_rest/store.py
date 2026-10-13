"""In-process store. Only this service imports/uses this module."""
from __future__ import annotations
from hashlib import sha256
import json
from threading import RLock
from uuid import uuid4
from .models import Delivery, TrackingEvent, utc_now

class DeliveryStore:
    def __init__(self):
        self._deliveries: dict[str, Delivery] = {}
        self._order_index: dict[str, str] = {}
        self._idempotency: dict[str, str] = {}
        self._lock = RLock()
        self._delivery_seq = 1000
        self._event_seq = 1

    @staticmethod
    def fingerprint(payload: dict) -> str:
        raw = json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
        return sha256(raw.encode()).hexdigest()

    def lookup_idempotency(self, key: str, payload: dict) -> tuple[Delivery | None, bool, bool]:
        """Return (record, replayed, key_conflict) without creating anything."""
        fp = self.fingerprint(payload)
        with self._lock:
            previous_id = self._idempotency.get(key)
            if not previous_id:
                return None, False, False
            previous = self._deliveries[previous_id]
            if previous.request_fingerprint != fp:
                return previous, False, True
            return previous, True, False

    def create(self, payload: dict, idempotency_key: str) -> tuple[Delivery, bool, bool]:
        """Return (record, replayed, key_conflict)."""
        fp = self.fingerprint(payload)
        with self._lock:
            previous_id = self._idempotency.get(idempotency_key)
            if previous_id:
                previous = self._deliveries[previous_id]
                if previous.request_fingerprint != fp:
                    return previous, False, True
                return previous, True, False
            existing_id = self._order_index.get(str(payload["orderId"]))
            if existing_id:
                return self._deliveries[existing_id], False, True
            self._delivery_seq += 1
            internal_id = self._delivery_seq
            delivery_id = "del_" + uuid4().hex
            delivery = Delivery(
                delivery_id=delivery_id,
                internal_id=internal_id,
                order_id=str(payload["orderId"]),
                delivery_address=payload["deliveryAddress"],
                package_details=payload.get("packageDetails"),
                status="PENDING",
                tracking_number=f"KM-TRK-{delivery_id}",
                idempotency_key=idempotency_key,
                request_fingerprint=fp,
                partner_reference=payload.get("partnerReference"),
            )
            self._deliveries[delivery_id] = delivery
            self._order_index[delivery.order_id] = delivery_id
            self._idempotency[idempotency_key] = delivery_id
            return delivery, False, False

    def get(self, delivery_id: str) -> Delivery | None:
        with self._lock:
            return self._deliveries.get(delivery_id)

    def list(self, status: str | None = None, order_id: str | None = None) -> list[Delivery]:
        with self._lock:
            items = list(self._deliveries.values())
        if status:
            items = [d for d in items if d.status == status]
        if order_id:
            items = [d for d in items if d.order_id == str(order_id)]
        return sorted(items, key=lambda d: d.created_at)

    def add_event(self, delivery: Delivery, payload: dict) -> TrackingEvent:
        with self._lock:
            event = TrackingEvent(
                event_id="evt_" + uuid4().hex, location=payload.get("location"),
                description=payload["description"], event_time=payload.get("eventTime") or utc_now(),
            )
            self._event_seq += 1
            delivery.tracking_events.append(event)
            delivery.updated_at = utc_now()
            # The event is a state change: update status only inside Delivery ownership.
            next_status = payload.get("status")
            if next_status:
                delivery.status = next_status
            return event

    def reset(self) -> None:
        with self._lock:
            self._deliveries.clear(); self._order_index.clear(); self._idempotency.clear()
            self._delivery_seq = 1000; self._event_seq = 1

store = DeliveryStore()
