import { useEffect, useState } from "react";
import Web3 from "web3";
import toast from "react-hot-toast";
import GridBotFactoryAbi from "../abis/mumbai/GridBotFactory.json";
import NFTGridDataAbi from "../abis/mumbai/NFTGridData.json";
import { GridBotFactoryAddress, NFTGridDataAddress } from "../utils/address";

export default function useWeb3() {
  const [maticPrice, setMaticPrice] = useState(false);
  const [account, setAccount] = useState(false);
  const [network, setNetwork] = useState("");
  const [balance, setBalance] = useState(0);
  const [web3, setWeb3] = useState(false);
  const [contract, setContract] = useState(false);

  useEffect(() => {
    // QUICKNODE RPC
    const quickNodeProvider = `wss://${process.env.REACT_APP_QUICKNODE_RPC}`;
    const quickNode = new Web3(
      new Web3.providers.WebsocketProvider(quickNodeProvider)
    );

    // METAMASK WALLET

    if (typeof window.ethereum !== "undefined") {
      const metamask = new Web3(window.ethereum);
      setWeb3({ quickNode, metamask });

      const gridBotFactory = new metamask.eth.Contract(
        JSON.parse(GridBotFactoryAbi.result),
        GridBotFactoryAddress
      );

      const nftGridData = new metamask.eth.Contract(
        JSON.parse(NFTGridDataAbi.result),
        NFTGridDataAddress
      );

      setContract({ gridBotFactory, nftGridData });

      window.ethereum
        .request({ method: "eth_accounts" })
        .then((account) => setAccount(account[0]))
        .catch((err) => console.log(err));

      window.ethereum
        .request({ method: "eth_chainId" })
        .then((chainId) => setNetwork(chainId))
        .catch((err) => console.log(err));

      window.ethereum.on("accountsChanged", (accounts) => {
        setAccount(accounts[0]);
      });

      window.ethereum.on("chainChanged", (_chainId) => {
        setNetwork(_chainId);
      });
    }

    return () => {
      if (typeof window.ethereum !== "undefined") {
        window.ethereum.removeListener("accountsChanged", (accounts) => {
          setAccount(accounts);
        });

        window.ethereum.removeListener("chainChanged", (_chainId) => {
          setNetwork(_chainId);
        });
      }
    };
  }, []);

  const truncateDecimals = function (number, digits) {
    var multiplier = Math.pow(10, digits),
      adjustedNum = number * multiplier,
      truncatedNum = Math[adjustedNum < 0 ? "ceil" : "floor"](adjustedNum);

    return truncatedNum / multiplier;
  };

  const readBalance = () => {
    web3.eth
      .getBalance(account)
      .then((balance) => {
        const walletBalance = web3.utils.fromWei(balance.toString(), "ether");
        const truncate = truncateDecimals(parseFloat(walletBalance), 2);
        setBalance(truncate);
      })
      .catch((err) => console.log(err));
  };

  // useEffect(() => {
  //   if (web3 && account && network !== "") {
  //     readBalance();
  //   }
  // }, [account, network, web3]);

  const connectWallet = (change) => {
    if (typeof window.ethereum === "undefined") {
      toast.error("Metamask not installed");
      return false;
    }

    if (change) {
      setAccount(false);
      window.ethereum
        .request({
          method: "wallet_requestPermissions",
          params: [
            {
              eth_accounts: {},
            },
          ],
        })
        .then((account) => setAccount(account[0].caveats[0].value[0]));
    } else {
      window.ethereum
        .request({
          method: "eth_requestAccounts",
        })
        .then((accounts) => setAccount(accounts[0]));
    }
  };

  const addNetwork = ({ chainId }) => {
    window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          chainId: chainId,
          chainName: chainId === "0x89" ? "POLYGON" : "BSC",
          rpcUrls: [
            chainId === "0x89"
              ? "https://polygon-rpc.com"
              : "https://bscrpc.com",
          ],
          nativeCurrency: {
            name: chainId === "0x89" ? "MATIC" : "BNB",
            symbol: chainId === "0x89" ? "MATIC" : "BNB",
            decimals: 18,
          },
        },
      ],
    });
  };

  const changeNetwork = ({ chainId }) => {
    const change = window.ethereum
      .request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainId }],
      })
      .catch((err) => {
        if (err.code === 4902) {
          addNetwork({ chainId });
        }
      });

    toast.promise(change, {
      loading: "Connecting...",
      success: "Connected",
      error: "Failed",
    });
  };

  return {
    changeNetwork,
    connectWallet,
    readBalance,
    account,
    network,
    balance,
    web3,
    contract,
    maticPrice,
  };
}
