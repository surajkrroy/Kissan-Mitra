"""Local mock of the Orders service for the reproducible curl demo only."""
from fastapi import FastAPI
app = FastAPI(title="Mock Orders Eligibility API")
@app.get("/orders/{order_id}/delivery-eligibility")
def eligibility(order_id: str):
    if order_id == "404":
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=404, content={"detail": "Order not found"})
    if order_id == "unpaid":
        return {"eligible": False}
    return {"eligible": True}
