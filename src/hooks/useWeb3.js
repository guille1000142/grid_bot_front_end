import { useEffect, useState } from "react";
import Web3 from "web3";
import GridBotFactoryAbi from "../abis/mumbai/GridBotFactory.json";
import NFTGridDataAbi from "../abis/mumbai/NFTGridData.json";
import UpKeepIDRegisterFactoryAbi from "../abis/mumbai/UpKeepIDRegisterFactory.json";
import SpotBotGridAbi from "../abis/mumbai/SpotBotGrid.json";
import ERC20StandardAbi from "../abis/mumbai/ERC20Standard.json";
import {
  GridBotFactoryAddress,
  NFTGridDataAddress,
  UpKeepIDRegisterFactoryAddress,
  usdcMockAddress,
} from "../utils/address";

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

      const gridBotFactoryQ = new metamask.eth.Contract(
        JSON.parse(GridBotFactoryAbi.result),
        GridBotFactoryAddress
      );

      const nftGridDataQ = new metamask.eth.Contract(
        JSON.parse(NFTGridDataAbi.result),
        NFTGridDataAddress
      );

      const upKeepIDRegisterFactoryQ = new metamask.eth.Contract(
        JSON.parse(UpKeepIDRegisterFactoryAbi.result),
        UpKeepIDRegisterFactoryAddress
      );

      const usdcMockQ = new metamask.eth.Contract(
        ERC20StandardAbi,
        usdcMockAddress
      );

      const gridBotFactoryM = new quickNode.eth.Contract(
        JSON.parse(GridBotFactoryAbi.result),
        GridBotFactoryAddress
      );

      const nftGridDataM = new quickNode.eth.Contract(
        JSON.parse(NFTGridDataAbi.result),
        NFTGridDataAddress
      );

      const upKeepIDRegisterFactoryM = new quickNode.eth.Contract(
        JSON.parse(UpKeepIDRegisterFactoryAbi.result),
        UpKeepIDRegisterFactoryAddress
      );

      const usdcMockM = new quickNode.eth.Contract(
        ERC20StandardAbi,
        usdcMockAddress
      );

      setContract({
        metamask: {
          gridBotFactory: gridBotFactoryM,
          nftGridData: nftGridDataM,
          upKeepIDRegisterFactory: upKeepIDRegisterFactoryM,
          usdcMock: usdcMockM,
        },
        quickNode: {
          gridBotFactory: gridBotFactoryQ,
          nftGridData: nftGridDataQ,
          upKeepIDRegisterFactory: upKeepIDRegisterFactoryQ,
          usdcMock: usdcMockQ,
        },
      });

      window.ethereum
        .request({ method: "eth_accounts" })
        .then((account) => setAccount(account[0]))
        .catch((err) => console.error(err));

      window.ethereum
        .request({ method: "eth_chainId" })
        .then((chainId) => setNetwork(chainId))
        .catch((err) => console.error(err));

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

  const readBotContract = (address) => {
    const spotBotGridM = new web3.metamask.eth.Contract(
      SpotBotGridAbi,
      address
    );
    const spotBotGridQ = new web3.quickNode.eth.Contract(
      SpotBotGridAbi,
      address
    );
    return {
      metamask: { spotBotGrid: spotBotGridM },
      quickNode: { spotBotGrid: spotBotGridQ },
    };
  };

  const readBalance = async () => {
    const usdc = web3.quickNode.utils.fromWei(
      await contract.quickNode.usdcMock.methods.balanceOf(account).call(),
      "ether"
    );
    const native = web3.quickNode.utils.fromWei(
      await web3.metamask.eth.getBalance(account),
      "ether"
    );
    return { usdc, native };
  };

  const connectWallet = (change) => {
    if (typeof window.ethereum === "undefined") {
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

  // PENDIENTE DE TERMINAR : MUMBAI Y POLYGON
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
    window.ethereum
      .request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: chainId }],
      })
      .catch((err) => {
        if (err.code === 4902) {
          addNetwork({ chainId });
        }
      });
  };

  return {
    changeNetwork,
    connectWallet,
    readBotContract,
    readBalance,
    account,
    network,
    balance,
    web3,
    contract,
    maticPrice,
  };
}
