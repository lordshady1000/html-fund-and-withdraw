//if you are using frontend javascript and not nodejs require wont work
//const { ethers } = require("ethers"); this wont work, infront end just download ethers code and import it
import { ethers } from "./ethers5.2.esm.min.js";
import { abi, contractAddress } from "./constants.js";
//
const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fund");
const balanceButton = document.getElementById("balanceButton");
const withdrawButton = document.getElementById("withdraw");
connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;
//
// connect
async function connect() {
  if (typeof window.ethereum !== "undefined") {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    console.log("metamask connected");
    connectButton.innerHTML = "connected";
  } else {
    connectButton.innerHTML = "please install metamask";
  }
}
//get balance
async function getBalance() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    console.log(ethers.utils.formatEther(balance));
  } else {
    connectButton.innerHTML = "please install metamask";
  }
}
//fund function
async function fund() {
  const ethAmount = document.getElementById("ethAmount").value;
  console.log(`funding with .${ethAmount}.....`);
  if (typeof window.ethereum !== "undefined") {
    //to fund you would need
    //provider/ connection to the blockchain
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    //signer/wallet/someone with gas
    const signer = provider.getSigner();
    //contract that we are interacting with. you would need the ABI and adress
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      // listen for it to finish, for tx to be mined
      await listenForTransactionMine(transactionResponse, provider);
      console.log("done...");
    } catch (error) {
      console.log(error);
    }
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}.....`);
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReciept) => {
      console.log(
        `completed with ${transactionReciept.confirmations} confirmations`
      );
      resolve();
    });
  });
}

//withdraw
async function withdraw() {
  if (typeof window.ethereum !== "undefined") {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    const balance = await provider.getBalance(contractAddress);
    const withdrawBalance = ethers.utils.formatEther(balance);
    console.log(`withdrawing...${withdrawBalance}`);
    try {
      const transactionResponse = await contract.withdraw();
      await listenForTransactionMine(transactionResponse, provider);
    } catch (error) {
      console.log(error);
    }
  } else {
    connectButton.innerHTML = "please install metamask";
  }
}
