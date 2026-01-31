# Ledger Module (Blockchain-like Audit Log)

## Overview

This module implements a **minimal blockchain-style ledger** used to record immutable events for the prescription lifecycle and ML model versioning. It is designed for **auditability, integrity, and traceability**, not cryptocurrency.

The self-test output confirms that blocks are generated sequentially, transactions are hashed, and business state is derived deterministically from the ledger.

---

## Features

* Append-only block generation
* SHA-256 transaction hashing
* Deterministic prescription state machine
* On-chain style model version recording
* Simple in-memory chain for demo/testing

---

## Block Structure

Each block contains:

* `index`: Block height
* `timestamp`: Creation time
* `transactions`: Array of domain events
* `prevHash`: Hash of previous block
* `txHash`: Hash of current transactions

This ensures **tamper evidence**: changing any historical transaction breaks all subsequent hashes.

---

## Supported Transactions

### 1. CreatePrescription

```json
{ "type": "CreatePrescription", "prescriptionId": "RX001", "hash": "hash123" }
```

Initializes a prescription record.

### 2. VerifyPrescription

```json
{ "type": "VerifyPrescription", "prescriptionId": "RX001" }
```

Marks prescription as verified by a pharmacist/system.

### 3. DispensePrescription

```json
{ "type": "DispensePrescription", "prescriptionId": "RX001" }
```

Finalizes the prescription lifecycle.

### 4. RecordModelVersion

```json
{ "type": "RecordModelVersion", "roundId": 1, "modelHash": "modelhash_abc" }
```

Stores ML model hash for reproducibility and audit.

---

## Prescription State Machine

```
Pending → Verified → Dispensed
```

State is **not stored directly**—it is derived by replaying ledger events.

---

## Self-Test Result

* 4 blocks generated successfully
* Prescription RX001 final state: **Dispensed**
* Model version round 1 recorded correctly

This confirms correct ledger behavior.

---

## Why This Design

* No single point of mutation
* Easy to audit and replay
* Clear separation between business logic and storage
* Suitable for academic demo and system prototype

---

## Limitations

* In-memory only (no persistence)
* No consensus or networking
* No cryptographic signatures

---

## Future Enhancements

* Persistent storage (LevelDB / PostgreSQL)
* Digital signatures for actors
* Merkle root optimization
* REST API integration
