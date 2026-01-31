const { Blockchain } = require("./ledger/blockchain");
const { StateStore } = require("./ledger/state");
const { Contracts } = require("./ledger/contracts");
const express = require("express");

const blockchain = new Blockchain();
const state = new StateStore();
const contracts = new Contracts(blockchain, state);

const ledger = {
  /* Prescription */
  createPrescription: (id, hash) =>
    contracts.CreatePrescription(id, hash),

  verifyPrescription: (id) =>
    contracts.VerifyPrescription(id),

  dispensePrescription: (id) =>
    contracts.DispensePrescription(id),

  getPrescriptionState: (id) =>
    state.getPrescriptionState(id),

  /* Federated Learning */
  recordModelVersion: (roundId, modelHash) =>
    contracts.RecordModelVersion(roundId, modelHash),

  getModelVersions: () =>
    state.getModelVersions(),

  /* Debug */
  getChain: () =>
    blockchain.getChain()
};

// ======================================
// Self-test
// ======================================
function selfTest() {
  console.log("Ledger self-test start...\n");

  ledger.createPrescription("RX001", "hash123");
  ledger.verifyPrescription("RX001");
  ledger.dispensePrescription("RX001");
  ledger.recordModelVersion(1, "modelhash_abc");

  console.log("\nFinal prescription state:", ledger.getPrescriptionState("RX001"));
  console.log("\nModel versions:", ledger.getModelVersions());
}

// ======================================
// HTTP Service
// ======================================
const app = express();
const port = 4000;

app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// Prescription APIs
app.post("/create", (req, res) => {
  const { prescriptionId, hash } = req.body;
  try {
    ledger.createPrescription(prescriptionId, hash);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

app.post("/verify", (req, res) => {
  const { prescriptionId } = req.body;
  try {
    ledger.verifyPrescription(prescriptionId);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

app.post("/dispense", (req, res) => {
  const { prescriptionId } = req.body;
  try {
    ledger.dispensePrescription(prescriptionId);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

app.post("/record_model", (req, res) => {
  const { roundId, modelHash } = req.body;
  try {
    ledger.recordModelVersion(roundId, modelHash);
    res.json({ success: true });
  } catch (e) {
    res.status(400).json({ success: false, message: e.message });
  }
});

// Start HTTP server
app.listen(port, () => {
  console.log(`Ledger service running on port ${port}`);
});

// Run self-test once at startup
selfTest();

module.exports = ledger;
