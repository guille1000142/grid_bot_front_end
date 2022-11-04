import { useEffect, useState } from "react";
import {
  Button,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Divider,
  IconButton,
  Card,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Link,
  Alert,
  Collapse,
} from "@mui/material";
import { PhotoCamera, CloseOutlined } from "@mui/icons-material";
import useMinter from "../../hooks/useMinter";
import useNFTStorage from "../../hooks/useNFTStorage";
import { WalletWarning } from "../WalletWarning";

const CreateBot = ({ account, network, contract, web3 }) => {
  const [error, setError] = useState({ field: false, account: false });
  const { image, setImage, input, setInput, state, tx, setTx, mintBot } =
    useMinter();

  useEffect(() => {
    const iconButton = document.querySelector("#icon");

    const addOpacity = () => {
      iconButton.style.opacity = "1";
    };

    const removeOpacity = () => {
      iconButton.style.opacity = "0";
    };

    if (image === "") {
      iconButton.style.opacity = "1";
      iconButton.removeEventListener("mouseover", addOpacity);
      iconButton.removeEventListener("mouseleave", removeOpacity);
    } else {
      iconButton.style.opacity = "0";
      iconButton.addEventListener("mouseover", addOpacity);
      iconButton.addEventListener("mouseleave", removeOpacity);
    }

    return () => {
      iconButton.removeEventListener("mouseover", addOpacity);
      iconButton.removeEventListener("mouseleave", removeOpacity);
    };
  }, [image]);

  const handleImage = () => {
    const file = document.querySelector("#input-photo").files[0];
    const preview = document.querySelector("#preview-photo");
    const reader = new FileReader();

    reader.addEventListener("load", () => {
      preview.src = reader.result;
      preview.style.visibility = "visible";
    });

    if (file) {
      setImage(file);
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    setInput({
      ...input,
      [e.target.name]: e.target.value,
    });
  };

  const verifyData = () => {
    if (!account) {
      setError({ field: false, account: true });
      return false;
    }

    if (
      !image ||
      input.name === "" ||
      input.description === "" ||
      input.pair === "" ||
      input.buyPrice === "" ||
      input.sellPrice === ""
    ) {
      setError({ field: true, account: false });
      return false;
    }

    mintBot({ web3, account, contract });
  };

  return (
    <>
      <Card
        sx={{
          padding: "15px",
          display: "flex",
          flexDirection: "column",
          gap: "15px",
        }}
      >
        <div className="container">
          <img id="preview-photo" src="" alt="Upload image" />
          <div id="icon">
            <IconButton
              color="primary"
              aria-label="upload picture"
              component="label"
              sx={{
                width: "100%",
                height: "150px",
                borderRadius: "0px",
              }}
            >
              <input
                onChange={handleImage}
                hidden
                id="input-photo"
                accept="image/*"
                type="file"
              />
              <PhotoCamera
                sx={{
                  color: "#ffffff",
                  fontSize: "32px",
                }}
              />
            </IconButton>
          </div>
        </div>
        <TextField
          onChange={handleChange}
          name="name"
          fullWidth
          id="input-name"
          label="Name"
          type="text"
          size="small"
        />
        <TextField
          onChange={handleChange}
          name="description"
          size="small"
          fullWidth
          id="input-description"
          label="Description"
          rows={1}
          maxRows={1}
          multiline
        />
        <FormControl size="small">
          <InputLabel id="select-pair-label">Pair</InputLabel>
          <Select
            onChange={handleChange}
            name="pair"
            labelId="select-pair-label"
            id="input-pair"
            autoWidth
            label="Pair"
          >
            <MenuItem value={"0x8cdA7F95298418Bb6b5e424c1EEE4B18a0C1139C"}>
              WBTC / USDC
            </MenuItem>
            <MenuItem value={"0x3c2fEc7E0b326C62688D8ee2119c8e26d668DF70"}>
              WETH / USDC
            </MenuItem>
          </Select>
        </FormControl>
        <TextField
          onChange={handleChange}
          name="buyPrice"
          fullWidth
          id="input-buy-price"
          label="Buy Price"
          type="number"
          size="small"
        />
        <TextField
          onChange={handleChange}
          name="sellPrice"
          fullWidth
          id="input-SELL-price"
          label="Sell Price"
          type="number"
          size="small"
        />
        <div>
          <Button
            fullWidth
            type="submit"
            variant="outlined"
            onClick={verifyData}
            disabled={state === "MINTING..."}
          >
            {state}
          </Button>
        </div>
      </Card>
      <Collapse in={error.field || error.account}>
        <Alert
          severity="error"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => {
                setError({ field: false, account: false });
              }}
            >
              <CloseOutlined fontSize="inherit" />
            </IconButton>
          }
          sx={{ mt: 2 }}
        >
          {error.field && "Complete all fields"}
          {error.account && "Connect wallet"}
        </Alert>
      </Collapse>
      {tx && (
        <Collapse in={tx}>
          <Alert
            severity="success"
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => {
                  setTx(false);
                }}
              >
                <CloseOutlined fontSize="inherit" />
              </IconButton>
            }
            sx={{ mt: 2 }}
          >
            Minted! &nbsp;
            <Link
              underline="hover"
              href={`https://mumbai.polygonscan.com/address/${tx.events.RoleGranted[0].address}`}
              target="_blank"
              rel="noopener"
            >
              View Bot
            </Link>
            &nbsp;
            <Link
              underline="hover"
              href={`https://mumbai.polygonscan.com/token/${
                tx.events[1].address
              }?a=${web3.quickNode.utils.hexToNumber(
                tx.events[1].raw.topics[3]
              )}`}
              target="_blank"
              rel="noopener"
            >
              View NFT
            </Link>
          </Alert>
        </Collapse>
      )}
    </>
  );
};

const ListBot = ({ account, network, contract, web3, bot, setBot }) => {
  const { nftUserList, getUserNfts } = useNFTStorage();

  useEffect(() => {
    getUserNfts({ web3, contract, account });
  }, [web3, contract, account]);
  console.log(bot);
  return (
    <List>
      {nftUserList &&
        nftUserList.map((data, index) => {
          return (
            <>
              <div
                className={`data-container ${
                  data.botAddress === bot.botAddress ? "selected" : ""
                }`}
                key={index}
                onClick={() => setBot(data)}
              >
                <div className="nft-info">
                  <h4 className="nft-name">{data.name}</h4>
                  <img
                    className="nft-image"
                    src={`https://nftstorage.link/ipfs/${data.image.substring(
                      7,
                      data.image.length
                    )}`}
                    alt="nft"
                  />
                  <small className="nft-description">{data.description}</small>
                </div>

                <div className="bot-info">
                  <span>Buy: {data.buyPrice}</span>
                  <span>Sell: {data.sellPrice}</span>
                </div>
              </div>
              <div className="divider"></div>
            </>
          );
        })}
    </List>
  );
};

export default function Bots({
  account,
  network,
  contract,
  web3,
  bot,
  setBot,
}) {
  const [list, setList] = useState(false);

  return (
    <>
      {account && network && contract && web3 ? (
        <>
          <Button
            onClick={() => setList(!list)}
            variant="contained"
            color="success"
            disableElevation
            fullWidth
          >
            {list ? "SHOW BOTS" : "CREATE BOT"}
          </Button>
          {list ? (
            <CreateBot
              account={account}
              network={network}
              contract={contract}
              web3={web3}
            />
          ) : (
            <ListBot
              account={account}
              network={network}
              contract={contract}
              web3={web3}
              bot={bot}
              setBot={setBot}
            />
          )}
        </>
      ) : (
        <WalletWarning />
      )}
    </>
  );
}
