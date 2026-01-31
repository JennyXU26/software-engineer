# Backend Integration Guide

## Purpose
This document describes **how the backend should call and integrate Algorithm 1 and Algorithm 2**, and how the overall algorithmic structure is organized at runtime.

The goal is to provide a **clear, implementation-oriented guide** for backend engineers, without requiring them to understand federated learning or agent theory details.

---

## High-Level Architecture

The system consists of **three logical components**, deployed within the same backend service or as separate services:

1. **Coordinator (Entry Point)**
2. **Algorithm 2: Agent Coordination Layer**
3. **Algorithm 1: Model Aggregation Service (FedAvg)**

```
Client / Agent
      │
      ▼
Coordinator  (backend entry point)
      │
      ├── Algorithm 2: validation / decision / reward
      │
      └── Algorithm 1: aggregation (FedAvg)
      │
      ▼
Global Model State
```

**Important:**
- Backend code interacts **only with the Coordinator**.
- Algorithm 1 and Algorithm 2 are internal modules and are never called directly by backend routing logic.

---

## Responsibilities by Component

### Coordinator

**Role:** Orchestrator / Controller

Responsibilities:
- Accept update requests from backend routes
- Invoke Algorithm 2 for validation and decision-making
- Conditionally invoke Algorithm 1 for aggregation
- Normalize and return responses to backend

The Coordinator contains **no training or aggregation logic**.

---

### Algorithm 2: Agent Coordination Layer

**Role:** Policy enforcement and incentive logic

Responsibilities:
- Validate updates against current policy constraints
- Verify proofs or claims (mock or real)
- Decide whether an update is accepted or rejected
- Compute rewards or incentives (if applicable)

Algorithm 2 **does not aggregate models** and **does not store global state**.

---

### Algorithm 1: Model Aggregation Service

**Role:** Pure federated aggregation engine

Responsibilities:
- Maintain round-level aggregation state
- Perform FedAvg over accepted updates
- Output global model parameters and statistics

Algorithm 1 is **policy-agnostic** and **agent-agnostic**.

---

## Backend Call Flow

### Backend Entry Point

Backend routes (e.g. HTTP handlers) should call:

```python
from coordinator import handle_update

result = handle_update(update_json)
```

No other algorithm module should be imported or called by backend code.

---

### Internal Execution Order

Inside `handle_update(update)` the execution order is strictly:

1. **Algorithm 2 – Verification**
   - Policy validation
   - Proof / metadata checks

2. **Decision Branch**
   - If verification fails → return `rejected`
   - If verification succeeds → continue

3. **Algorithm 1 – Aggregation**
   - Submit update to FedAvg aggregator
   - Possibly trigger aggregation completion

4. **Algorithm 2 – Post-processing (optional)**
   - Reward calculation
   - Settlement trigger

5. **Unified response returned to backend**

---

## Data Structures

### Incoming Update (from client or agent)

```json
{
  "roundId": "round1",
  "clientId": "HospitalA",
  "weights": [...],
  "samples": 120,
  "localAcc": 0.83,

  "policyHash": "0xabc...",
  "proof": { "type": "mock_zk" }
}
```

Notes:
- `policyHash` and `proof` are used **only by Algorithm 2**.
- Algorithm 1 ignores all policy-related fields.

---

### Forwarded Update (Algorithm 2 → Algorithm 1)

Only the following fields are forwarded internally:

```json
{
  "roundId": "round1",
  "clientId": "HospitalA",
  "weights": [...],
  "samples": 120,
  "localAcc": 0.83
}
```

---

## Unified Response Format

Coordinator always returns a normalized response:

```json
{
  "status": "rejected | waiting | aggregated",
  "roundId": "round1",
  "reward": 12.5,
  "aggregationResult": { ... }
}
```

Field behavior:
- `reward` is optional and only present if Algorithm 2 computes incentives
- `aggregationResult` is present only when aggregation completes

---

## Design Guarantees

- Algorithm 1 and Algorithm 2 are **independent and decoupled**
- Algorithm 1 can be reused without Algorithm 2
- Algorithm 2 can evolve without modifying Algorithm 1
- Backend integration remains stable even if algorithms change

---



## Summary

- Backend calls **only the Coordinator**
- Coordinator orchestrates Algorithm 2 and Algorithm 1
- Algorithm 2 governs *who can participate*
- Algorithm 1 governs *how models are aggregated*
- The design ensures clean separation and long-term extensibility

