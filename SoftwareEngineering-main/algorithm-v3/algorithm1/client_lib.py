from __future__ import annotations

import hashlib
import random
import re
import datetime
import typing as t
import requests
import sys


def _derive_seed(round_id: str, client_id: str) -> int:
    h = hashlib.sha256(f"{round_id}:{client_id}".encode()).hexdigest()
    return int(h, 16) % (2 ** 32)


def generate_update(round_id: str, client_id: str, weights_len: int = 20, steps: int = 5) -> dict:
    """生成可复现的本地更新。

    - 使用 round_id 与 client_id 派生 seed，保证同一 round+client 可复现。
    - 返回字典严格匹配要求的 JSON schema（除了 timestamp 可不同）。
    """
    seed = _derive_seed(round_id, client_id)
    rnd = random.Random(seed)

    # init weights ~ N(0,1)
    weights = [rnd.gauss(0, 1) for _ in range(weights_len)]

    # 简单的“伪梯度下降”更新（完全确定性，依赖 rnd）
    lr = 0.1
    for _ in range(steps):
        grads = [w + rnd.gauss(0, 0.1) for w in weights]
        weights = [w - lr * g for w, g in zip(weights, grads)]
        lr *= 0.9

    # 固定样本量
    samples = 120 if client_id == "HospitalA" else 80

    # 解析 round number（若 roundId 末尾包含数字则使用），用于表现 accuracy 随轮次略微上升
    m = re.search(r"(\d+)$", round_id)
    if m:
        round_num = int(m.group(1))
    else:
        # fallback deterministic small number
        round_num = int(hashlib.sha256(round_id.encode()).hexdigest(), 16) % 20

    base = 0.6 if client_id == "HospitalA" else 0.55
    local_acc = base + 0.01 * min(round_num, 20) + rnd.uniform(-0.002, 0.002)
    local_acc = max(0.0, min(1.0, local_acc))

    timestamp = datetime.datetime.now(datetime.timezone.utc).isoformat()

    payload = {
        "roundId": round_id,
        "clientId": client_id,
        "weights": [float(w) for w in weights],
        "samples": int(samples),
        "localAcc": float(round(local_acc, 6)),
        "timestamp": timestamp,
    }

    return payload


def send_update(base_url: str, payload: dict, timeout: int = 10) -> requests.Response:
    """POST 更新到聚合器并返回 Response。发生请求错误则抛出异常。"""
    url = base_url.rstrip("/") + "/fl/upload_update"
    try:
        resp = requests.post(url, json=payload, timeout=timeout)
        return resp
    except requests.RequestException:
        raise


def _fmt_head(weights: t.List[float], n: int = 3) -> str:
    return ", ".join(f"{w:.6f}" for w in weights[:n])


if __name__ == "__main__":
    # quick demo
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("--round", required=True)
    parser.add_argument("--client", choices=("HospitalA", "HospitalB"), required=True)
    parser.add_argument("--base_url", default="http://127.0.0.1:8000")
    args = parser.parse_args()

    payload = generate_update(args.round, args.client)
    print("generated:")
    print("  clientId:", payload["clientId"]) 
    print("  samples:", payload["samples"]) 
    print("  localAcc:", payload["localAcc"]) 
    print("  weights head:", _fmt_head(payload["weights"]))
    try:
        r = send_update(args.base_url, payload)
        print("sent, status:", r.status_code)
        try:
            print(r.json())
        except Exception:
            print(r.text)
    except requests.RequestException as e:
        print("request failed:", e, file=sys.stderr)
        sys.exit(1)
