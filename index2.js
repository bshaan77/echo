const axios = require("axios");
const solanaWeb3 = require("@solana/web3.js");

const solanaNodeUrl =
  "https://devnet.helius-rpc.com/?api-key=12fd782e-02e5-4186-b4de-845070e38855";

async function checkSolanaNodeStatus() {
  try {
    const response = await axios.get(`${solanaNodeUrl}/health`);
    const status = response.data;
    console.log("Solana Node Status:", status);
  } catch (error) {
    console.error("Error checking Solana node status:", error.message);
  }
}

// checkSolanaNodeStatus();

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
  image: "https://imgur.com/xD9QHQx",
};

async function mintNft() {
  const createProjectResponse = await axios.post(
    `${underdogApiEndpoint}/v2/projects`,
    projectData,
    config
  );
  console.log("Create Project Response:", createProjectResponse.data);

  let projectAccountInfo = null;

  while (!projectAccountInfo) {
    console.log("Fetching projectAccountInfo...");
    projectAccountInfo = await connection.getAccountInfo(
      new solanaWeb3.PublicKey(createProjectResponse.data.mintAddress)
    );
    if (!projectAccountInfo) {
      console.log("projectAccountInfo is still null. Waiting...");
      await new Promise((resolve) => setTimeout(resolve, 10000));
    }
  }

  const createNftResponse = await axios.post(
    `${underdogApiEndpoint}/v2/projects/${createProjectResponse.data.projectId}/nfts`,
    nftData,
    config
  );
  console.log("Create NFT Response:", createNftResponse.data);

  let retrieveNft;
  do {
    retrieveNft = await axios.get(
      `${underdogApiEndpoint}/v2/projects${createNftResponse.data.projectId}/nfts/${createNftResponse.data.nftId}`,
      config
    );
    await new Promise((resolve) => setTimeout(resolve, 10000));
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
  console.log(transcationDetails);
}

mintNft();
