import { useEffect, useState } from "react";
import { WalletWarning } from "../WalletWarning";
import {
  Button,
  Card,
  TextField,
  Slider,
  Alert,
  Collapse,
  IconButton,
} from "@mui/material";
import { CloseOutlined } from "@mui/icons-material";

export default function Control({
  account,
  network,
  contract,
  web3,
  bot,
  readBotContract,
  readBalance,
}) {
  const [state, setState] = useState(false);
  const [error, setError] = useState(false);
  const [data, setData] = useState(false);
  const [addBalance, setAddBalance] = useState(0);

  const handleChange = (e) => {
    setAddBalance(parseFloat(e.target.value));
  };

  const handleChangeSlider = (event, value) => {
    setAddBalance((data.wallet.usdc * value) / 100);
  };

  useEffect(() => {
    if (bot) {
      getBotData();
    }
  }, [bot, state]);

  const getBotData = async () => {
    const botContract = readBotContract(bot.botAddress);
    const usdcContract = await botContract.methods.getBalanceStable().call();
    const pairContract = await botContract.methods
      .getBalanceTradeableToken()
      .call();
    const wallet = await readBalance();
    const allowance = await contract.usdcMock.methods
      .allowance(account, bot.botAddress)
      .call();
    setData({
      bot: { usdc: usdcContract, pair: pairContract },
      wallet,
      allowance,
    });
  };

  const approveBalance = () => {
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
        setState(!state);
      })
      .on("error", (err, receipt) => {
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
    if (
      addBalance <= 0 ||
      addBalance > data.wallet.usdc ||
      isNaN(parseFloat(addBalance))
    ) {
      setError(true);
      return false;
    }

    contract.usdcMock.methods
      .transferFrom(
        account,
        bot.botAddress,
        web3.quickNode.utils.toWei(addBalance.toString(), "ether")
      )
      .send({
        from: account,
        // gasPrice: web3.utils.toWei(gas.fastest.toString(), "gwei"),
        // gasLimit: 500000,
      })
      .on("receipt", (receipt) => {
        setState(!state);
      })
      .on("error", (err, receipt) => {
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

  console.log(data);
  return (
    <>
      {account && network && contract && web3 && bot && data ? (
        <>
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
            <h4>{bot.name}</h4>
            <img
              className="nft-profile-image"
              src={`https://nftstorage.link/ipfs/${bot.image.substring(
                7,
                bot.image.length
              )}`}
              alt="nft"
            />
            <div className="bot-description">
              <small>{bot.description}</small>
            </div>
            &nbsp;
            <h5>Bot</h5>
            <div className="balance">
              <span>Available balance:</span>
              <span className="bold">{data.bot.usdc} USDC</span>
            </div>
            <div className="balance">
              <span>Purchased balance:</span>
              <span className="bold">{data.bot.pair} WBTC</span>
            </div>
            <Button
              onClick={() => setState(!state)}
              variant="contained"
              color={state ? "error" : "success"}
              disableElevation
              fullWidth
            >
              {state ? "Stop" : "Start"}
            </Button>
            &nbsp;
            <h5>Wallet</h5>
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
              getAriaValueText={0}
              valueLabelDisplay="auto"
              step={20}
              marks
              min={0}
              max={100}
            />
            <div className="balance">
              <span>Available balance:</span>
              <span className="bold">{data.wallet.usdc} USDC</span>
            </div>
            <Button
              variant="contained"
              color="primary"
              disableElevation
              fullWidth
              onClick={data.allowance === "0" ? approveBalance : depositBalance}
            >
              {data.allowance === "0" ? "Approve" : "Deposit"}
            </Button>
            <Collapse in={error}>
              <Alert
                severity="error"
                action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => {
                      setError(false);
                    }}
                  >
                    <CloseOutlined fontSize="inherit" />
                  </IconButton>
                }
                sx={{ mt: 2 }}
              >
                Insufficient balance
              </Alert>
            </Collapse>
          </Card>
        </>
      ) : (
        <WalletWarning />
      )}
    </>
  );
}
