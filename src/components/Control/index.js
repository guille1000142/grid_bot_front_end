import { WalletWarning } from "../WalletWarning";

export default function Control({ account, network, contract, web3, bot }) {
  return (
    <>
      {account && network && contract && web3 ? (
        <>
          <div className="control-panel">
            <h4>{bot.name}</h4>
          </div>
        </>
      ) : (
        <WalletWarning />
      )}
    </>
  );
}
