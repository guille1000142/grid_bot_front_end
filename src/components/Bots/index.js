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
  const { image, setImage, input, setInput, state, mintBot } = useMinter();

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
      {/* <Collapse in={}>
        <Alert
          severity="success"
          action={
            <IconButton aria-label="close" color="inherit" size="small">
              <CloseOutlined fontSize="inherit" />
            </IconButton>
          }
          sx={{ mt: 2 }}
        >
          Minted! &nbsp;
          <Link
            underline="hover"
            href={`https://ipfs.io/ipfs/${mint.data.ipnft}/metadata.json`}
            target="_blank"
            rel="noopener"
          >
            View on explorer
          </Link>
        </Alert>
      </Collapse> */}
    </>
  );
};

const ListBot = ({ account, network, contract, web3 }) => {
  const { nftUserList, getUserNfts } = useNFTStorage();

  console.log(nftUserList);

  useEffect(() => {
    getUserNfts({ web3, contract, account });
  }, [web3, contract, account]);

  return (
    <List
      sx={{
        width: "100%",
        maxWidth: 360,
        color: "#ffffff",
      }}
    >
      {/* {nftList &&
        nftList.map((data, index) => {
          return (
            <>
              <ListItem button key={index}>
                <ListItemAvatar>
                  <Avatar>
                    <img
                      src={`https://nftstorage.link/ipfs/${data.image.substring(
                        7,
                        data.image.length
                      )}`}
                      alt="nft"
                    />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  sx={{
                    color: "#ffffff",
                  }}
                  primary={data.name}
                  secondary={data.description}
                />
              </ListItem>
              <Divider />
            </>
          );
        })} */}
    </List>
  );
};

export default function Bots({ account, network, contract, web3 }) {
  const [bot, setBot] = useState(false);

  return (
    <>
      {account && network && contract && web3 ? (
        <>
          <Button
            onClick={() => setBot(!bot)}
            variant="contained"
            color="success"
            disableElevation
            fullWidth
          >
            {bot ? "SHOW BOTS" : "CREATE BOT"}
          </Button>
          {bot ? (
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
            />
          )}
        </>
      ) : (
        <WalletWarning />
      )}
    </>
  );
}
