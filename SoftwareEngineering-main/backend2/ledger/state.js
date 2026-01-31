class StateStore {
  constructor() {
    this.prescriptions = {};   // id -> status
    this.modelVersions = [];   // { roundId, modelHash }
  }

  /* ---------- Prescription ---------- */
  createPrescription(id) {
    if (this.prescriptions[id]) {
      throw new Error("Prescription already exists");
    }
    this.prescriptions[id] = "Active";
  }

  verifyPrescription(id) {
    const state = this.prescriptions[id];
    if (!state) throw new Error("Prescription not found");
    if (state !== "Active") {
      throw new Error(`Cannot verify prescription in state: ${state}`);
    }
  }

  dispensePrescription(id) {
    const state = this.prescriptions[id];
    if (!state) throw new Error("Prescription not found");
    if (state === "Dispensed") {
      throw new Error("Replay attack detected: already dispensed");
    }
    this.prescriptions[id] = "Dispensed";
  }

  getPrescriptionState(id) {
    return this.prescriptions[id] || "NOT_FOUND";
  }

  /* ---------- FL Model ---------- */
  recordModelVersion(roundId, modelHash) {
    this.modelVersions.push({
      roundId,
      modelHash,
      timestamp: Date.now()
    });
  }

  getModelVersions() {
    return this.modelVersions;
  }
}

module.exports = { StateStore };
