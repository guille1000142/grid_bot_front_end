import { useState } from "react";
import { NFTStorage } from "nft.storage";
import b64toBlob from "b64-to-blob"; //importing these two in react

const client = new NFTStorage({
  token: process.env.REACT_APP_NFT_STORAGE_KEY,
});

export default function useMinter() {
  const [image, setImage] = useState({ file: "", width: "", height: "" });
  const [input, setInput] = useState({
    name: "",
    description: "",
    pair: "",
    buyPrice: "",
    sellPrice: "",
  });
  const [state, setState] = useState("MINT GRID BOT");
  const [tx, setTx] = useState(false);

  const calculateDimensions = () => {
    const { width, height } = image;

    let dimensions;
    const defaultDimension = 1000;
    if (width >= defaultDimension) {
      dimensions = {
        width: defaultDimension,
        height: Math.round((height * defaultDimension) / width),
      };
    } else {
      if (height >= defaultDimension) {
        dimensions = {
          width: Math.round((width * defaultDimension) / height),
          height: defaultDimension,
        };
      } else {
        dimensions = {
          width: width,
          height: height,
        };
      }
    }
    return JSON.stringify(dimensions);
  };

  const resizeImage = () => {
    const dimensions = calculateDimensions();
    const { file } = image;
    const api = `${process.env.REACT_APP_API_URL}/api/v1/converter/image`;

    const formData = new FormData();
    formData.append("image", file, file.name);
    formData.append("dimensions", dimensions);

    return fetch(api, {
      method: "POST",
      body: formData,
    }).then((res) => {
      return res.json().then((data) => {
        const blob = b64toBlob(data.b64Data, data.contentType);
        const imageFile = new File([blob], "nft-image.avif", {
          type: "image/avif",
        });
        return imageFile;
      });
    });
  };

  const uploadMetadataNFT = (imageFile) => {
    return client.store({
      name: input.name,
      description: input.description,
      image: imageFile,
    });
  };

  const createDbDoc = (tokenUri, account) => {
    const api = `${process.env.REACT_APP_API_URL}/api/v1/nft/create`;

    return fetch(`${api}?cid=${tokenUri.ipnft}&wallet=${account}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        return res;
      })
      .catch((err) => {
        return err;
      });
  };

  const sendTransaction = (web3, account, contract, tokenUri) => {
    contract.metamask.gridBotFactory.methods
      .factoryNewGrid(
        input.name,
        tokenUri.url,
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
        setState("MINT GRID BOT");
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
  };

  const mintBot = (web3, account, contract, setList) => {
    setState("MINTING...");
    // que primero acepte la transaccion antes de nada!!
    resizeImage()
      .then((imageFile) => {
        uploadMetadataNFT(imageFile).then((tokenUri) => {
          createDbDoc(tokenUri, account).then(() =>
            sendTransaction(web3, account, contract, tokenUri).then(() =>
              setList(false)
            )
          );
        });
      })
      .catch((error) => console.error(error));
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
