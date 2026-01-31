from __future__ import annotations

import argparse
import json
import sys
from pprint import pprint

from client_lib import generate_update, send_update
import requests


def main():
    parser = argparse.ArgumentParser(description="Hospital B FL client")
    parser.add_argument("--round", required=True, help="round id, e.g. R1")
    parser.add_argument("--base_url", default="http://127.0.0.1:8000")
    args = parser.parse_args()

    payload = generate_update(args.round, "HospitalB")

    print(f"localAcc: {payload['localAcc']}")
    print(f"samples: {payload['samples']}")
    head = ", ".join(f"{w:.6f}" for w in payload["weights"][:3])
    print(f"weights head: {head}")

    try:
        resp = send_update(args.base_url, payload)
    except requests.RequestException as e:
        print(f"Failed to reach aggregator: {e}", file=sys.stderr)
        sys.exit(1)

    print(f"HTTP status: {resp.status_code}")
    try:
        body = resp.json()
        pprint(body)
    except Exception:
        print(resp.text)

    if resp.status_code != 200:
        print("Aggregator returned non-200 status", file=sys.stderr)
        sys.exit(1)


if __name__ == "__main__":
    main()
