import { WalletWarning } from "../WalletWarning";

export default function Market({ account, network, contract, web3 }) {
  return (
    <>{account && network && contract && web3 ? <></> : <WalletWarning />}</>
  );
}
