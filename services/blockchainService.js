// backend/src/services/blockchainService.js
const { Web3 } = require('web3');
const contractABI = require('../config/contractABI.json');

class BlockchainService {
  constructor() {
    this.web3 = null;
    this.contract = null;
    this.wallet = null;
    this.isInitialized = false;
    this.initPromise = null;
  }
  
  async initialize() {
    // Jika sudah diinisialisasi, return
    if (this.isInitialized) return;
    
    // Jika sedang dalam proses inisialisasi, tunggu
    if (this.initPromise) return this.initPromise;
    
    this.initPromise = this._doInitialize();
    return this.initPromise;
  }
  
  async _doInitialize() {
    try {
      const rpcUrl = process.env.BLOCKCHAIN_RPC_URL;
      const privateKey = process.env.BLOCKCHAIN_PRIVATE_KEY;
      const contractAddress = process.env.CONTRACT_ADDRESS;
      
      if (!rpcUrl || !privateKey || !contractAddress) {
        console.warn('⚠️ Blockchain credentials not complete, skipping initialization');
        console.warn('   RPC URL:', rpcUrl ? '✅' : '❌');
        console.warn('   Private Key:', privateKey ? '✅' : '❌');
        console.warn('   Contract Address:', contractAddress ? '✅' : '❌');
        return;
      }
      
      console.log('🔗 Connecting to blockchain...');
      console.log(`   RPC URL: ${rpcUrl.substring(0, 30)}...`);
      console.log(`   Contract: ${contractAddress}`);
      
      this.web3 = new Web3(rpcUrl);
      
      // Format private key
      let formattedKey = privateKey;
      if (!formattedKey.startsWith('0x')) {
        formattedKey = `0x${formattedKey}`;
      }
      
      this.wallet = this.web3.eth.accounts.privateKeyToAccount(formattedKey);
      this.web3.eth.accounts.wallet.add(this.wallet);
      
      this.contract = new this.web3.eth.Contract(contractABI, contractAddress);
      
      this.isInitialized = true;
      console.log('✅ Blockchain service initialized on Sepolia');
      console.log(`👤 Wallet address: ${this.wallet.address}`);
      
      // Cek balance
      const balance = await this.web3.eth.getBalance(this.wallet.address);
      const balanceEth = this.web3.utils.fromWei(balance, 'ether');
      console.log(`💰 Wallet balance: ${balanceEth} ETH`);
      
      if (parseFloat(balanceEth) === 0) {
        console.warn('⚠️ Warning: Wallet balance is 0 ETH!');
        console.warn('   Get Sepolia ETH from faucet: https://sepoliafaucet.com');
      }
      
    } catch (error) {
      console.error('❌ Blockchain init error:', error.message);
      this.isInitialized = false;
    } finally {
      this.initPromise = null;
    }
  }
  
  async storeHash(recordId, dataHash, recordType, patientId, createdBy, version) {
    if (!this.isInitialized) {
      console.log('⚠️ Blockchain not initialized, skipping storeHash');
      return {
        success: false,
        error: 'Blockchain not initialized',
        skipped: true
      };
    }
    
    try {
      console.log(`🔗 Storing hash to blockchain: ${dataHash.substring(0, 20)}...`);
      
      const tx = await this.contract.methods
        .storeHash(recordId, dataHash, recordType, patientId, createdBy, version.toString())
        .send({
          from: this.wallet.address,
          gas: 3000000
        });
      
      console.log(`✅ Blockchain transaction completed: ${tx.transactionHash}`);
      
      return {
        success: true,
        transactionHash: tx.transactionHash,
        blockNumber: tx.blockNumber
      };
      
    } catch (error) {
      console.error('❌ Blockchain transaction error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  async verifyHash(recordId, dataHash) {
    if (!this.isInitialized) {
      return {
        success: false,
        error: 'Blockchain not initialized'
      };
    }
    
    try {
      const result = await this.contract.methods
        .verifyHash(recordId, dataHash)
        .call();
      
      return {
        success: true,
        isValid: result[0],
        version: Number(result[1]),
        timestamp: Number(result[2])
      };
      
    } catch (error) {
      console.error('Verify error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  isReady() {
    return this.isInitialized;
  }
}

module.exports = new BlockchainService();