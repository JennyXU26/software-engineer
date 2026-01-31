const { sha256 } = require("./crypto");

class Blockchain {
  constructor() {
    this.chain = [
      {
        index: 0,
        timestamp: Date.now(),
        txs: ["Genesis Block"],
        prevHash: "0",
        hash: "0"
      }
    ];
  }

  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  addBlock(txs) {
    const prev = this.getLatestBlock();

    const block = {
      index: prev.index + 1,
      timestamp: Date.now(),
      txs,
      prevHash: prev.hash
    };

    block.hash = sha256(JSON.stringify(block));

    console.log("====================================");
    console.log(`Generating Block #${block.index}`);
    console.log(`TxHash: ${block.hash}`);
    console.log("Transactions:", txs);
    console.log("====================================");

    this.chain.push(block);
    return block;
  }

  getChain() {
    return this.chain;
  }
}

module.exports = { Blockchain };
