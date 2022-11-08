import { useState } from "react";

export default function useNFTStorage() {
  const [nftUserList, setNftUserList] = useState(false);
  const [nftGlobalList, setNftGlobalList] = useState([]);
  const [cidsGlobalList, setCidsGlobalList] = useState(false);

  const getCidUrl = (uri) => {
    return /^(\w+):\/\/([^\/]+)([^]+)$/.exec(uri);
  };

  const randomPosition = (max) => {
    const number = Math.floor(Math.random() * max);
    let className = "content";
    if (number === 1) {
      className = "content horizontal";
    }
    if (number === 2) {
      className = "content vertical";
    }
    return className;
  };

  const getUserNfts = ({ contract, account, setBot }) => {
    const api = `${process.env.REACT_APP_API_URL}/api/v1/nft/metadata`;

    contract.quickNode.gridBotFactory.methods
      .getTotalNumberOfGrid(account)
      .call()
      .then((amount) => {
        const bots = Array.apply(null, Array(parseInt(amount)));
        Promise.all(
          bots.map((data, index) => {
            return contract.quickNode.gridBotFactory.methods
              .listOfGridsPerUser(account, index)
              .call()
              .then((data) => {
                return contract.quickNode.nftGridData.methods
                  .tokenURI(data.nftID)
                  .call()
                  .then((uri) => {
                    const metadataCid = getCidUrl(uri);
                    return fetch(`${api}/${metadataCid[2]}`, {
                      method: "GET",
                      headers: {
                        "Content-Type": "application/json",
                      },
                    }).then((res) => {
                      return res.json().then((metadata) => {
                        const imageCid = getCidUrl(metadata.image);
                        return {
                          botAddress: data.gridBotAddress,
                          buyPrice: data.buyPrice_,
                          sellPrice: data.sellPrice_,
                          cid: metadataCid[2],
                          name: metadata.name,
                          description: metadata.description,
                          image: imageCid[2],
                        };
                      });
                    });
                  });
              });
          })
        ).then((data) => {
          setBot(data[0]);
          setNftUserList(data);
        });
      });
  };

  const getGlobalNfts = (account) => {
    const date = encodeURI(new Date().toISOString());
    const limit = 1000;
    const gateway = "https://api.nft.storage/";

    fetch(`${gateway}?before=${date}&limit=${limit}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.REACT_APP_NFT_STORAGE_KEY}`,
      },
    }).then((res) => {
      res.json().then((cids) => {
        setCidsGlobalList(cids.value);
      });
    });
  };

  const readLimitNFT = ({ cids, from, to, actualData, account }) => {
    const api = `${process.env.REACT_APP_API_URL}/api/v1/nft/metadata`;

    Promise.all(
      cids.slice(from, to).map((data) => {
        const position = randomPosition(3);
        return fetch(`${api}/${data.cid}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }).then((res) => {
          return res.json().then((metadata) => {
            const imageCid = getCidUrl(metadata.image);
            const { value, wallets } = metadata.likes;
            const isWallet = wallets.find(
              (wallet) => wallet.toLowerCase() === account
            );
            return {
              cid: metadata._id,
              name: metadata.name,
              description: metadata.description,
              image: imageCid[2],
              position,
              createdAt: new Date(data.created).toISOString(),
              likes: value,
              isWallet: isWallet !== undefined ? true : false,
            };
          });
        });
      })
    ).then((nfts) => setNftGlobalList([...actualData, ...nfts]));
  };

  return {
    nftUserList,
    nftGlobalList,
    cidsGlobalList,
    getUserNfts,
    getGlobalNfts,
    readLimitNFT,
    randomPosition,
  };
}
