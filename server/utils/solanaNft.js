import * as web3 from "@solana/web3.js";
import User from "../models/User.js";
import {
  Metaplex,
  keypairIdentity,
  bundlrStorage,
  toMetaplexFile,
} from "@metaplex-foundation/js";
import * as fs from "fs";
import dotenv from "dotenv";
dotenv.config();

export async function initializeKeypair(connection) {
  let signer;
  if (!process.env.PRIVATE_KEY) {
    console.log("Creating .env file");
    signer = web3.Keypair.generate();
    fs.writeFileSync(".env", `PRIVATE_KEY=${JSON.stringify(signer.secretKey)}`);
  } else {
    const secret = JSON.parse(process.env.PRIVATE_KEY ?? "");
    const secretKey = Uint8Array.from(secret);
    signer = web3.Keypair.fromSecretKey(secretKey);
  }

  await airdropSolIfNeeded(signer, connection);
  return signer;
}

async function airdropSolIfNeeded(signer, connection) {
  const balance = await connection.getBalance(signer.publicKey);
  console.log("Current balance is", balance / web3.LAMPORTS_PER_SOL);

  if (balance < web3.LAMPORTS_PER_SOL) {
    console.log("Airdropping 1 SOL...");
    const airdropSignature = await connection.requestAirdrop(
      signer.publicKey,
      web3.LAMPORTS_PER_SOL
    );

    const latestBlockHash = await connection.getLatestBlockhash();

    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: airdropSignature,
    });

    const newBalance = await connection.getBalance(signer.publicKey);
    console.log("New balance is", newBalance / web3.LAMPORTS_PER_SOL);
  }
}

export async function uploadMetadata(metaplex, nftData) {
  console.log("File path:", "server/public/assets/" + nftData.imageFile);
  const buffer = fs.readFileSync("public/assets/" + nftData.imageFile);
  const file = toMetaplexFile(buffer, nftData.imageFile);
  const imageUri = await metaplex.storage().upload(file);
  console.log("image uri:", imageUri);

  const { uri } = await metaplex.nfts().uploadMetadata({
    name: nftData.name,
    symbol: nftData.symbol,
    description: nftData.description,
    image: imageUri,
  });

  console.log("metadata uri:", uri);
  return uri;
}

export async function getImageUri(metaplex, nftData) {
  const buffer = fs.readFileSync("public/assets/" + nftData.imageFile);
  const file = toMetaplexFile(buffer, nftData.imageFile);
  const imageUri = await metaplex.storage().upload(file);

  return imageUri;
}

export async function createNft(metaplex, uri, nftData) {
  const { nft } = await metaplex.nfts().create(
    {
      uri: uri,
      name: nftData.name,
      sellerFeeBasisPoints: nftData.sellerFeeBasisPoints,
      symbol: nftData.symbol,
    },
    { commitment: "finalized" }
  );

  console.log(
    `Token Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`
  );

  return nft;
}

export async function updateNftUri(metaplex, uri, mintAddress) {
  const nft = await metaplex.nfts().findByMint({ mintAddress });
  const { response } = await metaplex.nfts().update(
    {
      nftOrSft: nft,
      uri: uri,
    },
    { commitment: "finalized" }
  );

  console.log(
    `Token Mint: https://explorer.solana.com/address/${nft.address.toString()}?cluster=devnet`
  );

  console.log(
    `Transaction: https://explorer.solana.com/tx/${response.signature}?cluster=devnet`
  );
}
