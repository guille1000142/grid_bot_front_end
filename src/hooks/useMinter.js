import { useState } from "react";
import { NFTStorage } from "nft.storage";
import b64toBlob from "b64-to-blob";
import { createSigner } from "fast-jwt";

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

  const generateAccessToken = () => {
    const walletSignature = window.localStorage.getItem("signature");
    if (walletSignature !== undefined) {
      const sign = createSigner({ key: process.env.REACT_APP_TOKEN_SECRET });
      const tokenSign = sign({ signature: walletSignature });
      return tokenSign;
    } else {
      return false;
    }
  };

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
    const jwt = generateAccessToken();
    if (!jwt) {
      return false;
    }

    const api = `${process.env.REACT_APP_API_URL}/api/v1/converter/image`;
    const dimensions = calculateDimensions();
    const { file } = image;

    const formData = new FormData();
    formData.append("image", file, file.name);
    formData.append("dimensions", dimensions);
    console.log(jwt);
    return fetch(api, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
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
    const jwt = generateAccessToken();
    if (!jwt) {
      return false;
    }

    const api = `${process.env.REACT_APP_API_URL}/api/v1/nft/create`;

    return fetch(`${api}?cid=${tokenUri.ipnft}&wallet=${account}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${jwt}`,
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

  const sendTransaction = (web3, account, contract, tokenUri, setList) => {
    contract.metamask.gridBotFactory.methods
      .factoryNewGrid(
        input.name,
        tokenUri.url,
        input.pair,
        parseFloat(input.buyPrice) * 100000000,
        parseFloat(input.sellPrice) * 100000000,
        account
      )
      .send({
        from: account,
        value: web3.quickNode.utils.toWei("0.01", "ether"),
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
        setList("list");
      })
      .on("error", (err, receipt) => {
        setList("list");
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
    resizeImage()
      .then((imageFile) => {
        uploadMetadataNFT(imageFile).then((tokenUri) => {
          createDbDoc(tokenUri, account).then(() =>
            sendTransaction(web3, account, contract, tokenUri, setList)
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
