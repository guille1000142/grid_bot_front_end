import React from "react";
import NavBar from "../../components/NavBar";
import Market from "../../components/Market";
import useWeb3 from "../../hooks/useWeb3";
import "./index.css";

export default function Marketplace() {
  const { account, network, contract, web3, connectWallet } = useWeb3();
  return (
    <div className="marketplace-grid-container">
      <header className="header">
        <NavBar account={account} connectWallet={connectWallet} />
      </header>
      <section className="section">
        <Market
          account={account}
          network={network}
          contract={contract}
          web3={web3}
        />
      </section>
    </div>
  );
}
