class Contracts {
  constructor(blockchain, state) {
    this.blockchain = blockchain;
    this.state = state;
  }

  CreatePrescription(prescriptionId, hash) {
    this.state.createPrescription(prescriptionId);

    return this.blockchain.addBlock([
      {
        type: "CreatePrescription",
        prescriptionId,
        hash
      }
    ]);
  }

  VerifyPrescription(prescriptionId) {
    this.state.verifyPrescription(prescriptionId);

    return this.blockchain.addBlock([
      {
        type: "VerifyPrescription",
        prescriptionId
      }
    ]);
  }

  DispensePrescription(prescriptionId) {
    this.state.dispensePrescription(prescriptionId);

    return this.blockchain.addBlock([
      {
        type: "DispensePrescription",
        prescriptionId
      }
    ]);
  }

  RecordModelVersion(roundId, modelHash) {
    this.state.recordModelVersion(roundId, modelHash);

    return this.blockchain.addBlock([
      {
        type: "RecordModelVersion",
        roundId,
        modelHash
      }
    ]);
  }
}

module.exports = { Contracts };
