import { useState } from "react";
import { NFTStorage } from "nft.storage";

const client = new NFTStorage({
  token: process.env.REACT_APP_NFT_STORAGE_KEY,
});

export default function useMinter() {
  const [image, setImage] = useState("");
  const [input, setInput] = useState({
    name: "",
    description: "",
    pair: "",
    buyPrice: "",
    sellPrice: "",
  });
  const [state, setState] = useState("MINT NFT BOT");
  const [tx, setTx] = useState(false);

  const mintBot = async ({ web3, account, contract }) => {
    setState("MINTING...");
    client
      .store({
        name: input.name,
        description: input.description,
        image: image,
      })
      .then((metadata) => {
        console.log(contract.metamask.gridBotFactory.methods);
        contract.metamask.gridBotFactory.methods
          .factoryNewGrid(
            input.name,
            metadata.url,
            input.pair,
            input.buyPrice,
            input.sellPrice,
            account
          )
          .send({
            from: account,
            value: web3.quickNode.utils.toWei("0.001", "ether"),
            // gasPrice: web3.utils.toWei(gas.fastest.toString(), "gwei"),
            // gasLimit: 500000,
          })
          .on("receipt", (receipt) => {
            const preview = document.querySelector("#preview-photo");
            preview.src = "reader.result";
            preview.style.visibility = "hidden";
            setImage("");
            setInput({
              name: "",
              description: "",
              pair: "",
              buyPrice: "",
              sellPrice: "",
            });
            setState("MINT NFT BOT");
            setTx(receipt);
          })
          .on("error", (err, receipt) => {
            if (err.code === -32603) {
              console.error("This transaction needs more gas to be executed");
              return false;
            }
            if (err.code === 4001) {
              console.error("Denied transaction signature");
              return false;
            }
            if (!err.code) {
              console.error("Transaction reverted");
              return false;
            }
          });
      });
  };

  return {
    image,
    setImage,
    input,
    setInput,
    state,
    tx,
    setTx,
    mintBot,
  };
}
