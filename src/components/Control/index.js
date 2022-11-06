import { useEffect, useState } from "react";
import { Warning } from "../Warning";
import { Button, Card, TextField, Slider, Link } from "@mui/material";
import { SnackBar } from "../SnackBar";

export default function Control({
  account,
  contract,
  web3,
  bot,
  readBotContract,
  readBalance,
  switchNetwork,
}) {
  const [state, setState] = useState(false);
  const [error, setError] = useState(false);
  const [tx, setTx] = useState(false);
  const [data, setData] = useState(false);
  const [addBalance, setAddBalance] = useState(0);
  const [botContract, setBotContract] = useState(false);
  const [withdraw, setWithdraw] = useState(false);
  const [deposit, setDeposit] = useState({ approve: false, deposit: false });

  useEffect(() => {
    if (bot && web3) {
      getBotData();
    }
  }, [bot, web3, state]);

  const getBotData = async () => {
    const spotContract = readBotContract(bot.botAddress);
    setBotContract(spotContract);

    const usdcBalance = web3.quickNode.utils.fromWei(
      await spotContract.quickNode.spotBotGrid.methods
        .getBalanceStable()
        .call(),
      "ether"
    );
    const pairBalance = web3.quickNode.utils.fromWei(
      await spotContract.quickNode.spotBotGrid.methods
        .getBalanceTradeableToken()
        .call(),
      "ether"
    );
    const walletBalance = await readBalance();
    const allowance = await contract.quickNode.usdcMock.methods
      .allowance(account, bot.botAddress)
      .call();

    setData({
      bot: { usdc: usdcBalance, pair: pairBalance },
      walletBalance,
      allowance,
    });
  };

  const approveBalance = () => {
    if (!account) {
      setError({ field: false, account: true });
      return false;
    }

    const isConnected = switchNetwork();
    if (!isConnected) {
      return false;
    }

    setDeposit({ deposit: false, approve: true });
    contract.usdcMock.methods
      .approve(
        bot.botAddress,
        web3.quickNode.utils.toWei(
          "100000000000000000000000000000000000000000000000000000000000",
          "ether"
        )
      )
      .send({
        from: account,
        // gasPrice: web3.utils.toWei(gas.fastest.toString(), "gwei"),
        // gasLimit: 500000,
      })
      .on("receipt", (receipt) => {
        setDeposit({ deposit: false, approve: false });
        setTx({ withdraw: receipt });
        setState(!state);
      })
      .on("error", (err, receipt) => {
        setDeposit({ deposit: false, approve: false });
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

  const depositBalance = () => {
    if (!account) {
      setError({ field: false, account: true });
      return false;
    }

    const isConnected = switchNetwork();
    if (!isConnected) {
      return false;
    }

    if (
      addBalance <= 0 ||
      addBalance > data.walletBalance.usdc ||
      isNaN(parseFloat(addBalance))
    ) {
      setError({ field: true, account: false });
      return false;
    }

    setDeposit({ deposit: true, approve: false });
    contract.metamask.usdcMock.methods
      .transfer(
        bot.botAddress,
        web3.quickNode.utils.toWei(addBalance.toString(), "ether")
      )
      .send({
        from: account,
        // gasPrice: web3.utils.toWei(gas.fastest.toString(), "gwei"),
        // gasLimit: 500000,
      })
      .on("receipt", (receipt) => {
        setDeposit({ deposit: false, approve: false });
        setTx({ deposit: receipt });
        setState(!state);
      })
      .on("error", (err, receipt) => {
        setDeposit({ deposit: false, approve: false });
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

  const withdrawBalance = () => {
    if (!account) {
      setError({ field: false, account: true });
      return false;
    }

    const isConnected = switchNetwork();
    if (!isConnected) {
      return false;
    }

    if (data.bot.usdc <= 0 && data.bot.pair <= 0) {
      setError({ field: true, account: false });
      return false;
    }

    setWithdraw(true);
    botContract.metamask.spotBotGrid.methods
      .withdraw()
      .send({
        from: account,
        // gasPrice: web3.utils.toWei(gas.fastest.toString(), "gwei"),
        // gasLimit: 500000,
      })
      .on("receipt", (receipt) => {
        setWithdraw(false);
        setState(!state);
      })
      .on("error", (err, receipt) => {
        setWithdraw(false);
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

  const handleChange = (e) => {
    e.preventDefault();
    setAddBalance(parseFloat(e.target.value));
  };

  const handleChangeSlider = (e, value) => {
    e.preventDefault();
    setAddBalance((parseFloat(data.walletBalance.usdc) * value) / 100);
  };

  const getAriaValueText = (value) => {
    return `${value}%`;
  };

  return (
    <>
      {account && contract && web3 ? (
        <>
          {bot && data ? (
            <Card
              sx={{
                padding: "15px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                flexDirection: "column",
                gap: "15px",
              }}
            >
              <h3>{bot.name}</h3>
              <img
                className="nft-profile-image"
                src={`https://nftstorage.link/ipfs/${bot.image.substring(
                  7,
                  bot.image.length
                )}`}
                alt="nft"
              />
              <h4>Grid Bot</h4>
              <div className="balance">
                <span>State: </span>
                <span
                  className={data.bot.usdc > 0 ? "bold orange" : "bold red"}
                >
                  {data.bot.usdc > 0 ? "RUNNING" : "STOPPED"}
                </span>
              </div>
              <div className="balance">
                <span>Gas:</span>
                <span className="bold">{data.bot.pair} LINK</span>
              </div>
              <div className="divider"></div>
              <div className="balance">
                <span>Available balance:</span>
                <span className="bold">{data.bot.usdc} USDC</span>
              </div>
              <div className="balance">
                <span>Purchased balance:</span>
                <span className="bold">{data.bot.pair} WBTC</span>
              </div>
              <Button
                variant="contained"
                color="warning"
                disableElevation
                fullWidth
                onClick={withdrawBalance}
                disabled={
                  (data.bot.usdc <= 0 && data.bot.pair <= 0) || withdraw
                }
              >
                {withdraw ? "WITHDRAWING..." : "WITHDRAW ALL"}
              </Button>
              &nbsp;
              <h4>Wallet</h4>
              <TextField
                onChange={handleChange}
                name="addBalance"
                fullWidth
                id="input-add-balance"
                label="Add Balance"
                type="number"
                size="small"
                value={addBalance}
                InputProps={{
                  endAdornment: "USDC",
                }}
              ></TextField>
              <Slider
                aria-label="%"
                onChange={handleChangeSlider}
                defaultValue={0}
                getAriaValueText={getAriaValueText}
                valueLabelDisplay="auto"
                step={20}
                marks
                min={0}
                max={100}
              />
              <div className="balance">
                <span>Available balance:</span>
                <span className="bold">{data.walletBalance.usdc} USDC</span>
              </div>
              <Button
                disabled={deposit.approve || deposit.deposit}
                variant="contained"
                color="primary"
                disableElevation
                fullWidth
                onClick={
                  data.allowance === "0" ? approveBalance : depositBalance
                }
              >
                {!deposit.deposit && !deposit.approve && (
                  <>{data.allowance === "0" ? "APPROVE" : "DEPOSIT"}</>
                )}
                {deposit.approve && "APPROVING..."}
                {deposit.deposit && "DEPOSITING..."}
              </Button>
              {error && (
                <SnackBar
                  open={error.field || error.account}
                  setOpen={setError}
                  label={
                    (error.field && "Insufficient balance") ||
                    (error.account && "Connect wallet")
                  }
                  state={"error"}
                  position={{ vertical: "bottom", horizontal: "right" }}
                />
              )}
              {tx && (
                <SnackBar
                  open={tx}
                  setOpen={setTx}
                  label={
                    <>
                      {tx.withdraw ? (
                        <span>Successfully withdrawn!</span>
                      ) : (
                        <span>Successfully deposited!</span>
                      )}
                      &nbsp;
                      <Link
                        underline="hover"
                        href={`https://mumbai.polygonscan.com/tx/${
                          tx.withdraw
                            ? tx.withdraw.transactionHash
                            : tx.deposit.transactionHash
                        }`}
                        target="_blank"
                        rel="noopener"
                      >
                        View TX
                      </Link>
                    </>
                  }
                  state={"success"}
                  position={{ vertical: "bottom", horizontal: "right" }}
                />
              )}
            </Card>
          ) : (
            <Warning label={"SELECT BOT"} />
          )}
        </>
      ) : (
        <Warning label={"CONNECT WALLET"} />
      )}
    </>
  );
}
