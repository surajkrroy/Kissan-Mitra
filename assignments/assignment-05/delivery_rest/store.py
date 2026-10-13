"""Thread-safe in-process Delivery store with idempotency and resource versions."""
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

    @staticmethod
    def fingerprint(payload: dict) -> str:
        raw = json.dumps(payload, sort_keys=True, separators=(",", ":"), ensure_ascii=False)
        return sha256(raw.encode()).hexdigest()

    def lookup_idempotency(self, key: str, payload: dict):
        fp = self.fingerprint(payload)
        with self._lock:
            previous_id = self._idempotency.get(key)
            if not previous_id: return None, False, False
            previous = self._deliveries[previous_id]
            if previous.request_fingerprint != fp: return previous, False, True
            return previous, True, False

    def create(self, payload: dict, idempotency_key: str):
        fp = self.fingerprint(payload)
        with self._lock:
            previous_id = self._idempotency.get(idempotency_key)
            if previous_id:
                previous = self._deliveries[previous_id]
                if previous.request_fingerprint != fp: return previous, False, True
                return previous, True, False
            existing_id = self._order_index.get(str(payload["orderId"]))
            if existing_id: return self._deliveries[existing_id], False, True
            self._delivery_seq += 1
            delivery_id = "del_" + uuid4().hex
            delivery = Delivery(delivery_id=delivery_id, internal_id=self._delivery_seq,
                order_id=str(payload["orderId"]), delivery_address=payload["deliveryAddress"],
                package_details=payload.get("packageDetails"), status="PENDING",
                tracking_number=f"KM-TRK-{delivery_id}", idempotency_key=idempotency_key,
                request_fingerprint=fp, partner_reference=payload.get("partnerReference"))
            self._deliveries[delivery_id] = delivery
            self._order_index[delivery.order_id] = delivery_id
            self._idempotency[idempotency_key] = delivery_id
            return delivery, False, False

    def get(self, delivery_id: str):
        with self._lock: return self._deliveries.get(delivery_id)

    def list(self, status=None, order_id=None, sort="createdAt", order="asc", offset=0, limit=20):
        with self._lock: items = list(self._deliveries.values())
        if status: items = [d for d in items if d.status == status]
        if order_id: items = [d for d in items if d.order_id == str(order_id)]
        keymap = {"createdAt": lambda d: d.created_at, "updatedAt": lambda d: d.updated_at, "status": lambda d: d.status, "orderId": lambda d: d.order_id}
        items.sort(key=keymap.get(sort, keymap["createdAt"]), reverse=(order.lower()=="desc"))
        return items[offset:offset+limit], len(items)

    def update(self, delivery: Delivery, payload: dict):
        with self._lock:
            delivery.delivery_address = payload["deliveryAddress"]
            delivery.package_details = payload.get("packageDetails")
            delivery.updated_at = utc_now()
            return delivery

    def patch(self, delivery: Delivery, payload: dict):
        with self._lock:
            if "deliveryAddress" in payload: delivery.delivery_address = payload["deliveryAddress"]
            if "packageDetails" in payload: delivery.package_details = payload["packageDetails"]
            delivery.updated_at = utc_now()
            return delivery

    def delete(self, delivery_id: str):
        with self._lock:
            delivery = self._deliveries.pop(delivery_id, None)
            if not delivery: return None
            self._order_index.pop(delivery.order_id, None)
            self._idempotency.pop(delivery.idempotency_key, None)
            return delivery

    def add_event(self, delivery: Delivery, payload: dict):
        with self._lock:
            event = TrackingEvent(event_id="evt_" + uuid4().hex, location=payload.get("location"),
                description=payload["description"], event_time=payload.get("eventTime") or utc_now())
            delivery.tracking_events.append(event)
            delivery.updated_at = utc_now()
            if payload.get("status"): delivery.status = payload["status"]
            return event

    def reset(self):
        with self._lock:
            self._deliveries.clear(); self._order_index.clear(); self._idempotency.clear(); self._delivery_seq = 1000

store = DeliveryStore()
