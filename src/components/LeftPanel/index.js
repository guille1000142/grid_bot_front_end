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
  InputAdornment,
  Input,
  Select,
  MenuItem,
  Link,
  Alert,
  Collapse,
} from "@mui/material";
import { ImageAspectRatioRounded } from "@mui/icons-material";
import { PhotoCamera, CloseOutlined, InputA } from "@mui/icons-material";
import useMinter from "../../hooks/useMinter";

const CreateBot = () => {
  const [error, setError] = useState(false);
  const {
    image,
    setImage,
    name,
    setName,
    description,
    setDescription,
    pair,
    setPair,
    mint,
    setMint,
    uploadNft,
  } = useMinter();

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

  const handleName = (event) => {
    setName(event.target.value);
  };

  const handleDescription = (event) => {
    setDescription(event.target.value);
  };

  const handlePair = (event, value) => {
    setPair(value.props.value);
  };

  const verifyData = () => {
    if (!image || name === "" || description === "" || pair === "") {
      setError(true);
      return false;
    }

    uploadNft();
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
          onChange={handleName}
          value={name}
          fullWidth
          id="input-name"
          label="Name"
          type="text"
          size="small"
        />
        <TextField
          onChange={handleDescription}
          value={description}
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
            labelId="select-pair-label"
            id="input-pair"
            value={pair}
            onChange={handlePair}
            autoWidth
            label="Pair"
          >
            <MenuItem value={"WBTC"}>WBTC / USDC</MenuItem>
            <MenuItem value={"WETH"}>WETH / USDC</MenuItem>
          </Select>
        </FormControl>
        <TextField
          onChange={handleName}
          value={name}
          fullWidth
          id="input-buy-price"
          label="Buy Price"
          type="number"
          size="small"
        />
        <TextField
          onChange={handleName}
          value={name}
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
            disabled={mint.state === "MINTING..."}
          >
            {mint.state}
          </Button>
        </div>
      </Card>
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
          Complete all fields!
        </Alert>
      </Collapse>
      <Collapse in={mint.data}>
        <Alert
          severity="success"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => {
                setMint({ state: "MINT NFT BOT", data: false });
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
            href={`https://ipfs.io/ipfs/${mint.data.ipnft}/metadata.json`}
            target="_blank"
            rel="noopener"
          >
            View on explorer
          </Link>
        </Alert>
      </Collapse>
    </>
  );
};

const ListBot = () => {
  return (
    <List
      sx={{
        width: "100%",
        maxWidth: 360,
        color: "#ffffff",
      }}
    >
      <ListItem button>
        <ListItemAvatar>
          <Avatar>
            <ImageAspectRatioRounded />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          sx={{
            color: "#ffffff",
          }}
          primary="#1"
          secondary="BUY: 20100 / SELL: 20900"
        />
      </ListItem>
      <Divider />
      <ListItem button>
        <ListItemAvatar>
          <Avatar>
            <ImageAspectRatioRounded />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          sx={{
            color: "#ffffff",
          }}
          primary="#2"
          secondary="BUY: 20000 / SELL: 20200"
        />
      </ListItem>
      <Divider />
      <ListItem button>
        <ListItemAvatar>
          <Avatar>
            <ImageAspectRatioRounded />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          sx={{
            color: "#ffffff",
          }}
          primary="#3"
          secondary="BUY: 2300 / SELL: 22100"
        />
      </ListItem>
      <Divider />
      <ListItem button>
        <ListItemAvatar>
          <Avatar>
            <ImageAspectRatioRounded />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          sx={{
            color: "#ffffff",
          }}
          primary="#4"
          secondary="BUY: 20500 / SELL: 20700"
        />
      </ListItem>
      <Divider />
      <ListItem button>
        <ListItemAvatar>
          <Avatar>
            <ImageAspectRatioRounded />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          sx={{
            color: "#ffffff",
          }}
          primary="#5"
          secondary="BUY: 20800 / SELL: 26000"
        />
      </ListItem>
      <Divider />
      <ListItem button>
        <ListItemAvatar>
          <Avatar>
            <ImageAspectRatioRounded />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          sx={{
            color: "#ffffff",
          }}
          primary="#7"
          secondary="BUY: 19200 / SELL: 19700"
        />
      </ListItem>
      <Divider />
    </List>
  );
};

export default function LeftPanel() {
  const [bot, setBot] = useState(false);

  return (
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
      {bot ? <CreateBot /> : <ListBot />}
    </>
  );
}
