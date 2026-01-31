

import hashlib
import json
from dataclasses import dataclass, asdict
from typing import Dict


@dataclass(frozen=True)
class TrainingPolicy:
    max_samples: int
    max_rounds: int
    min_accuracy: float
    max_weight_norm: float
    policy_version: str

    def to_dict(self) -> Dict:
        return asdict(self)

    def hash(self) -> str:
        """
        Deterministic policy commitment.
        Used by agent to bind its update to a policy.
        """
        payload = json.dumps(self.to_dict(), sort_keys=True)
        return hashlib.sha256(payload.encode()).hexdigest()


# 当前系统激活的 policy（可热更新）
CURRENT_POLICY = TrainingPolicy(
    max_samples=150,
    max_rounds=50,
    min_accuracy=0.50,
    max_weight_norm=25.0,
    policy_version="v1.0"
)
