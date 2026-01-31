
from typing import Dict
from .policy import CURRENT_POLICY


def compute_reward(update: Dict) -> float:
    """
    Reward function designed to incentivize:
    - higher accuracy
    - reasonable sample usage
    - policy compliance
    """

    samples = update["samples"]
    acc = update["localAcc"]

    # 基础贡献
    base_reward = samples * acc

    # accuracy bonus
    if acc > 0.8:
        base_reward *= 1.2

    # efficiency penalty
    if samples > 0.8 * CURRENT_POLICY.max_samples:
        base_reward *= 0.9

    return round(base_reward, 4)
