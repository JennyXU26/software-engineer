

import math
from typing import Dict
from algorithm1.client_lib import generate_update
from .policy import CURRENT_POLICY


def _weight_l2_norm(weights):
    return math.sqrt(sum(w * w for w in weights))


def generate_agent_update(round_id: str, client_id: str) -> Dict:
    """
    Agent-aware client update.
    Wraps Algorithm 1 update with policy commitment and self-claims.
    """

    # Algorithm 1: raw model update
    update = generate_update(round_id, client_id)

    # Agent-side introspection
    weight_norm = _weight_l2_norm(update["weights"])
    policy_hash = CURRENT_POLICY.hash()

    # Agent claim (to be verified by Algorithm 2)
    agent_claim = {
        "samples_used": update["samples"],
        "reported_accuracy": update["localAcc"],
        "weight_norm": round(weight_norm, 6),
        "policy_version": CURRENT_POLICY.policy_version
    }

    # Mock ZK proof placeholder (结构对齐真实系统)
    proof = {
        "scheme": "zk-mock",
        "statement": "training_under_policy",
        "policy_hash": policy_hash
    }

    update.update({
        "policyHash": policy_hash,
        "agentClaim": agent_claim,
        "proof": proof
    })

    return update
