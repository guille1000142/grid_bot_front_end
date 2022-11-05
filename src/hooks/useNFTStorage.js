import { useState } from "react";

export default function useNFTStorage() {
  const [nftUserList, setNftUserList] = useState(false);
  const [nftGlobalList, setNftGlobalList] = useState(false);

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

  const getUserNfts = ({ web3, contract, account, setBot }) => {
    const api = `http://${process.env.REACT_APP_API_URL}/api/v1/nfts`;

    contract.gridBotFactory.methods
      .getTotalNumberOfGrid(account)
      .call()
      .then((amount) => {
        const bots = Array.apply(null, Array(parseInt(amount)));
        Promise.all(
          bots.map((data, index) => {
            return contract.gridBotFactory.methods
              .listOfGridsPerUser(account, index)
              .call()
              .then((data) => {
                return contract.nftGridData.methods
                  .tokenURI(data.nftID)
                  .call()
                  .then((uri) => {
                    const cid = /^(\w+):\/\/([^\/]+)([^]+)$/.exec(uri);
                    return fetch(`${api}/${cid[2]}`, {
                      method: "GET",
                      headers: {
                        "Content-Type": "application/json",
                      },
                    }).then((res) => {
                      return res.json().then((metadata) => {
                        return {
                          botAddress: data.gridBotAddress,
                          buyPrice: data.buyPrice_,
                          sellPrice: data.sellPrice_,
                          cid: cid[2],
                          ...metadata,
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

  const getGlobalNfts = () => {
    const date = encodeURI(new Date().toISOString());
    const filter = 500;
    const gateway = "https://api.nft.storage/";
    const api = `http://${process.env.REACT_APP_API_URL}/api/v1/nfts`;

    fetch(`${gateway}?before=${date}&limit=${filter}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.REACT_APP_NFT_STORAGE_KEY}`,
      },
    }).then((res) => {
      res.json().then((nfts) => {
        Promise.all(
          nfts.value.map((nft) => {
            const position = randomPosition(3);
            return fetch(`${api}/${nft.cid}`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }).then((res) => {
              return res.json().then((metadata) => {
                return { ...metadata, position };
              });
            });
          })
        ).then((data) => setNftGlobalList(data));
      });
    });
  };

  return {
    nftUserList,
    nftGlobalList,
    getUserNfts,
    getGlobalNfts,
    randomPosition,
  };
}
