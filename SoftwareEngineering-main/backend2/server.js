// server.js
const express = require("express");
const ledger = require("./index");

const app = express();

// ✅ Express 自带 JSON parser（不需要安装任何包）
app.use(express.json());

// ========== Create Prescription ==========
app.post("/ledger/create", (req, res) => {
  const { prescriptionId, hash } = req.body;

  if (!prescriptionId || !hash) {
    return res.status(400).json({
      success: false,
      error: "prescriptionId and hash are required",
    });
  }

  try {
    ledger.create_prescription(prescriptionId, hash);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ========== Verify Prescription ==========
app.post("/ledger/verify", (req, res) => {
  const { prescriptionId } = req.body;

  if (!prescriptionId) {
    return res.status(400).json({
      success: false,
      error: "prescriptionId is required",
    });
  }

  try {
    ledger.verify_prescription(prescriptionId);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ========== Dispense Prescription ==========
app.post("/ledger/dispense", (req, res) => {
  const { prescriptionId } = req.body;

  if (!prescriptionId) {
    return res.status(400).json({
      success: false,
      error: "prescriptionId is required",
    });
  }

  try {
    ledger.dispense_prescription(prescriptionId);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ========== Record Model Version ==========
app.post("/ledger/record_model", (req, res) => {
  const { roundId, modelHash } = req.body;

  if (roundId === undefined || !modelHash) {
    return res.status(400).json({
      success: false,
      error: "roundId and modelHash are required",
    });
  }

  try {
    ledger.record_model_version(roundId, modelHash);
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// ========== Health Check ==========
app.get("/health", (req, res) => {
  res.json({ status: "Ledger service is running" });
});

// ========== Start Server ==========
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`Ledger service running on http://localhost:${PORT}`);
});
