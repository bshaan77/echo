//const axios = require("axios");
//const solanaWeb3 = require("@solana/web3.js");

import * as solanaWeb3 from "@solana/web3.js";

const underdogApiEndpoint = "https://dev.underdogprotocol.com";
const connection = new solanaWeb3.Connection(
  "https://devnet.helius-rpc.com/?api-key=12fd782e-02e5-4186-b4de-845070e38855"
);

const config = {
  headers: {
    Authorization: "Bearer 17ca75ab621979.018a7ecf9fcf4185950203000867b2e7",
  },
};

const projectData = {
  name: "Morgan",
  symbol: "MF",
  image: "https://imgur.com/zPn4SYu.jpg",
};

const nftData = {
  name: "Uber",
  symbol: "UBR",
  image: "https://imgur.com/Gy8pmuH.png",
};

// Define a function to handle the form submission
async function handleFormSubmit(event) {
  event.preventDefault(); // Prevent the default form submission behavior

  // Call the mintNft function
  try {
    await mintNft();
  } catch (error) {
    console.error("Error minting NFT:", error);
  }
}

// Add an event listener to the form to trigger the form submission handling

document
  .getElementById("executeForm")
  .addEventListener("submit", handleFormSubmit); //comment docuemnt --> this line out when testing this file alone

async function mintNft() {
  const createProjectResponse = await axios.post(
    `${underdogApiEndpoint}/v2/projects`,
    projectData,
    config
  );

  let projectAccountInfo = null;

  while (!projectAccountInfo) {
    projectAccountInfo = await connection.getAccountInfo(
      new solanaWeb3.PublicKey(createProjectResponse.data.mintAddress)
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  const createNftResponse = await axios.post(
    `${underdogApiEndpoint}/v2/projects/${createProjectResponse.data.projectId}/nfts`,
    nftData,
    config
  );

  let retrieveNft;
  do {
    retrieveNft = await axios.get(
      `${underdogApiEndpoint}/v2/projects/${createNftResponse.data.projectId}/nfts/${createNftResponse.data.nftId}`,
      config
    );
    await new Promise((resolve) => setTimeout(resolve, 1000));
  } while (retrieveNft.data.status !== "confirmed");

  console.log(`Mint address: ${retrieveNft.data.mintAddress}`);
  console.log(`Name: ${retrieveNft.data.name}`);
  console.log(`Image: ${retrieveNft.data.image}`);

  const signatures = await connection.getSignaturesForAddress(
    new solanaWeb3.PublicKey(createProjectResponse.data.mintAddress),
    {
      commitment: "confirmed",
    }
  );
  const transactionDetails = await connection.getParsedTransaction(
    signatures[0].signature,
    {
      commitment: "confirmed",
      encoding: "jsonParsed",
      maxSupportedTransactionVersion: 0,
    }
  );
  console.log(transactionDetails);
}

mintNft();
