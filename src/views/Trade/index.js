import React from "react";
import NavBar from "../../components/NavBar";
import Bots from "../../components/Bots";
import Chart from "../../components/Chart";
import Control from "../../components/Control";
import Transactions from "../../components/Transactions";
import useWeb3 from "../../hooks/useWeb3";
import "./index.css";

export default function Trade() {
  const { account, network, contract, web3, connectWallet } = useWeb3();
  return (
    <div className="trade-grid-container">
      <header className="header">
        <NavBar account={account} connectWallet={connectWallet} />
      </header>
      <nav className="bots">
        <Bots
          account={account}
          network={network}
          contract={contract}
          web3={web3}
        />
      </nav>
      <section className="chat">
        <Chart />
      </section>
      <article className="transactions">
        <Transactions
          account={account}
          network={network}
          contract={contract}
          web3={web3}
        />
      </article>
      <aside className="control">
        <Control
          account={account}
          network={network}
          contract={contract}
          web3={web3}
        />
      </aside>
    </div>
  );
}
