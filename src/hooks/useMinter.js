import { NFTStorage } from "nft.storage";
import { useState } from "react";

const client = new NFTStorage({
  token: process.env.REACT_APP_NFT_STORAGE_KEY,
});

export default function useMinter() {
  const [image, setImage] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [pair, setPair] = useState("");
  const [mint, setMint] = useState({ state: "MINT NFT BOT", data: false });

  const uploadNft = async () => {
    setMint({ state: "MINTING...", data: false });
    const metadata = await client.store({
      name: name,
      description: description,
      image: image,
    });
    mintNft(metadata);
  };

  const mintNft = (metadata) => {
    const preview = document.querySelector("#preview-photo");
    preview.src = "reader.result";
    preview.style.visibility = "hidden";
    setImage("");
    setName("");
    setDescription("");
    setPair("");
    setMint({ state: "MINT NFT BOT", data: metadata });
  };

  return {
    image,
    setImage,
    name,
    setName,
    description,
    setDescription,
    pair,
    setPair,
    mint,
    setMint,
    uploadNft,
  };
}
