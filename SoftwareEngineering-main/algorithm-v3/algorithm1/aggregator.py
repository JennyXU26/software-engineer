from __future__ import annotations

import datetime
import threading
from typing import Dict, List

from flask import Flask, request, jsonify

app = Flask(__name__)

# =========================
# 全局状态（单轮模拟）
# =========================

STATE = {
    "roundId": None,
    "expected_clients": {"HospitalA", "HospitalB"},
    "updates": {},          # clientId -> payload
    "global_weights": None, # List[float]
    "history": []           # 每轮聚合记录
}

LOCK = threading.Lock()


# =========================
# 工具函数
# =========================

def _validate_payload(p: dict) -> None:
    """严格校验 client 上传的 JSON schema"""
    required = {
        "roundId": str,
        "clientId": str,
        "weights": list,
        "samples": int,
        "localAcc": float,
        "timestamp": str,
    }

    for k, t in required.items():
        if k not in p:
            raise ValueError(f"Missing field: {k}")
        if not isinstance(p[k], t):
            raise ValueError(f"Field `{k}` must be {t}")

    if not p["weights"]:
        raise ValueError("weights cannot be empty")


def _fedavg(updates: List[dict]) -> List[float]:
    """FedAvg: 按 samples 加权平均"""
    total_samples = sum(u["samples"] for u in updates)

    dim = len(updates[0]["weights"])
    agg = [0.0] * dim

    for u in updates:
        w = u["weights"]
        s = u["samples"]
        for i in range(dim):
            agg[i] += w[i] * s / total_samples

    return agg


def _aggregate_round(round_id: str) -> dict:
    """执行一次完整聚合"""
    updates = list(STATE["updates"].values())

    global_weights = _fedavg(updates)

    avg_acc = sum(
        u["localAcc"] * u["samples"] for u in updates
    ) / sum(u["samples"] for u in updates)

    record = {
        "roundId": round_id,
        "numClients": len(updates),
        "globalWeights": global_weights,
        "avgLocalAcc": round(avg_acc, 6),
        "timestamp": datetime.datetime.now(
            datetime.timezone.utc
        ).isoformat()
    }

    STATE["global_weights"] = global_weights
    STATE["history"].append(record)
    STATE["updates"] = {}

    return record


# =========================
# API
# =========================

@app.route("/submit_update", methods=["POST"])
def submit_update():
    payload = request.get_json(force=True)

    try:
        _validate_payload(payload)
    except ValueError as e:
        return jsonify({"error": str(e)}), 400

    with LOCK:
        round_id = payload["roundId"]
        client_id = payload["clientId"]

        if STATE["roundId"] is None:
            STATE["roundId"] = round_id

        if round_id != STATE["roundId"]:
            return jsonify({
                "error": "Round mismatch",
                "currentRound": STATE["roundId"]
            }), 400

        STATE["updates"][client_id] = payload

        # 是否已收齐
        if STATE["expected_clients"].issubset(STATE["updates"].keys()):
            result = _aggregate_round(round_id)
            STATE["roundId"] = None
            return jsonify({
                "status": "aggregated",
                "result": result
            })

        return jsonify({
            "status": "waiting",
            "received": list(STATE["updates"].keys())
        })


@app.route("/status", methods=["GET"])
def status():
    with LOCK:
        return jsonify({
            "currentRound": STATE["roundId"],
            "receivedClients": list(STATE["updates"].keys()),
            "historyRounds": len(STATE["history"])
        })


@app.route("/history", methods=["GET"])
def history():
    with LOCK:
        return jsonify(STATE["history"])


# =========================
# 启动
# =========================

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True)
