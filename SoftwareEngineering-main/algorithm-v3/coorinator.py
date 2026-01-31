
from typing import Dict, Any

# Algorithm 2 imports
from algorithm2.verifier import verify_update
from algorithm2.reward import compute_reward

# Algorithm 1 import
# 假设 aggregator.py 中暴露的是 submit_update(update: dict) -> dict
from algorithm1.aggregator import submit_update


def _strip_agent_metadata(update: Dict[str, Any]) -> Dict[str, Any]:
    """
    Remove Algorithm 2–specific fields before forwarding
    the update to Algorithm 1.
    """
    forwarded = dict(update)
    forwarded.pop("policyHash", None)
    forwarded.pop("agentClaim", None)
    forwarded.pop("proof", None)
    return forwarded


def handle_update(update: Dict[str, Any]) -> Dict[str, Any]:
    """
    Unified backend entry point.

    Execution order:
    1. Algorithm 2 verification
    2. Algorithm 1 aggregation (if accepted)
    3. Algorithm 2 reward computation
    4. Unified response
    """

    # -----------------------------
    # Step 1: Algorithm 2 – Verify
    # -----------------------------
    accepted, reason = verify_update(update)

    if not accepted:
        return {
            "status": "rejected",
            "reason": reason,
            "roundId": update.get("roundId"),
            "clientId": update.get("clientId")
        }

    # --------------------------------
    # Step 2: Forward to Algorithm 1
    # --------------------------------
    clean_update = _strip_agent_metadata(update)

    aggregation_result = submit_update(clean_update)

    # --------------------------------
    # Step 3: Algorithm 2 – Incentive
    # --------------------------------
    reward = compute_reward(update)

    # --------------------------------
    # Step 4: Normalize response
    # --------------------------------
    response = {
        "status": aggregation_result.get("status"),
        "roundId": update.get("roundId"),
        "clientId": update.get("clientId"),
        "reward": reward
    }

    # 仅在聚合完成时返回全局模型
    if aggregation_result.get("status") == "aggregated":
        response["aggregationResult"] = aggregation_result.get("result")

    return response
