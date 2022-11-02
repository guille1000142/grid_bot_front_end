import { useState } from "react";

export default function useNFTStorage() {
  const [nftUserList, setNftUserList] = useState(false);
  const [nftList, setNftList] = useState(false);

  const getUserNfts = ({ web3, contract, account }) => {
    const api = `http://${process.env.REACT_APP_API_URL}/api/v1/nfts`;

    contract.nftGridData.methods
      .balanceOf(account)
      .call()
      .then((amount) => {
        let cids = [];
        for (let i = 0; i < amount; i++) {
          contract.gridBotFactory.methods
            .listOfGridsPerUser(account, i)
            .call()
            .then((data) => {
              var ipfs = /^(\w+):\/\/([^\/]+)([^]+)$/.exec(data[1]);
              cids.push(ipfs[3]);
            });
        }

        Promise.all(
          cids.map((cid) => {
            return fetch(`${api}/${cid}`, {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
              },
            }).then((res) => {
              return res.json().then((data) => {
                return data;
              });
            });
          })
        ).then((metadata) => setNftUserList(metadata));
      });
  };

  const getAllNfts = () => {
    const date = "2022-11-01T17%3A32%3A28Z";
    const filter = 1000;
    const gateway = "https://api.nft.storage/";
    const api = `http://${process.env.REACT_APP_API_URL}/api/v1/nfts`;

    fetch(`${gateway}?before=${date}&limit=${filter}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.REACT_APP_NFT_STORAGE_KEY}`,
      },
    })
      .then((res) => {
        res.json().then((data) => {
          console.log(data);
          Promise.all(
            data.value.map((data) => {
              return fetch(`${api}/${data.cid}`, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                },
              })
                .then((res) => {
                  return res.json().then((data) => {
                    return data;
                  });
                })
                .catch((error) => {
                  console.log(error);
                });
            })
          ).then((metadata) => setNftList(metadata));
        });
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return { nftUserList, getUserNfts, nftList, getAllNfts };
}
