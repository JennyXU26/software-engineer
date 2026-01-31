
from typing import Dict, Tuple
from .policy import CURRENT_POLICY


class VerificationError(Exception):
    pass


def _check_policy_hash(update: Dict):
    if update.get("policyHash") != CURRENT_POLICY.hash():
        raise VerificationError("Policy hash mismatch")


def _check_samples(update: Dict):
    samples = update["samples"]
    if samples > CURRENT_POLICY.max_samples:
        raise VerificationError("Sample count exceeds policy bound")


def _check_accuracy(update: Dict):
    acc = update["localAcc"]
    if acc < CURRENT_POLICY.min_accuracy:
        raise VerificationError("Reported accuracy below minimum threshold")


def _check_weight_norm(update: Dict):
    claimed_norm = update["agentClaim"]["weight_norm"]
    if claimed_norm > CURRENT_POLICY.max_weight_norm:
        raise VerificationError("Weight norm exceeds policy limit")


def _check_proof_structure(update: Dict):
    proof = update.get("proof", {})
    if proof.get("scheme") != "zk-mock":
        raise VerificationError("Unsupported proof scheme")
    if proof.get("policy_hash") != CURRENT_POLICY.hash():
        raise VerificationError("Proof-policy mismatch")


def verify_update(update: Dict) -> Tuple[bool, str]:
    """
    Algorithm 2 verification pipeline.
    Returns (accepted, reason).
    """
    try:
        _check_policy_hash(update)
        _check_samples(update)
        _check_accuracy(update)
        _check_weight_norm(update)
        _check_proof_structure(update)
    except VerificationError as e:
        return False, str(e)

    return True, "accepted"
