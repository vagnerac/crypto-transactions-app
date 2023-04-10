import Provider from './provider.js';
import Signer from './signer.js';
import Transaction from './transaction.js';
import ValidateFormData from './validateFormData.js';

// app class to process main functions from the system
export class App {
  constructor() {
    // get elements from html
    this.form = document.getElementById('form');
    this.toWalletAddress = document.getElementById('toWalletAddress');
    this.amount = document.getElementById('amount');
    this.connectBtn = document.getElementById('connect-btn');
    this.fromWalletAddressSpan = document.getElementById(
      'fromWalletAddressSpan',
    );
    //declare signer variable to be used under "this" context.
    this.signer;
  }

  // method to call internal methods in the correct order to process the app.
  // it checks if wallet is connected, listen submit button and process all
  // methods to connect wallet and process transaction
  async runApp() {
    try {
      await this.isConnected();

      this.connectBtn.onclick = async () => {
        await this.signerConnection();
        await this.isConnected();
      };

      this.form.addEventListener('submit', async (event) => {
        event.preventDefault();
        await this.transactionProcessing(this.signer);
      });
    } catch (err) {
      console.log(err.message);
    }
  }

  // method to check the connection of Metamask with the site
  async isConnected() {
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    if (accounts.length) {
      const cutWallet = accounts[0].slice(35);
      const spanConnectedWallet = document.createElement('span');
      this.connectBtn.parentElement.appendChild(spanConnectedWallet);
      spanConnectedWallet.innerText = `Connected with ...${cutWallet}`;
      this.connectBtn.style.visibility = 'hidden';
      this.fromWalletAddressSpan.innerText = accounts[0];

      await this.signerConnection();
    }
  }

  // method to connect signer
  async signerConnection() {
    // Connection to the provider
    const provider = new Provider();
    console.log(`Provider: ${provider}`);
    const providerConnected = await provider.blockchainConnection();

    // connection to signer
    const signerInstance = new Signer();
    this.signer = await signerInstance.setSigner(providerConnected);
  }

  // this method is responsible to process the transaction and teturn the
  // response from blockchain
  async transactionProcessing(signer) {
    const toWalletAddress = this.toWalletAddress.value;
    const transactionAmount = this.amount.value;

    try {
      if (toWalletAddress && transactionAmount) {
        const validateFormData = new ValidateFormData(
          toWalletAddress,
          transactionAmount,
        );
        const isFormDataValid = validateFormData.validateData();

        if (!signer) {
          window.alert('Metamask is not connected');
          return;
        }
        if (isFormDataValid) {
          const tx = new Transaction(
            signer,
            toWalletAddress,
            transactionAmount,
          );

          const transaction = await tx.createTransaction();
          console.log(transaction);

          // Wait for the transaction to be written in the blockchain
          const receipt = await transaction.wait();
          console.log(receipt);
        }
      } else {
        window.alert('Dados inválidos.');
      }
    } catch (err) {
      console.log(err.message);
    }
  }
}

const app = new App();
app.runApp();
