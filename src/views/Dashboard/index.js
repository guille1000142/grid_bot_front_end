import { useEffect, useState } from "react";
import {
  IconButton,
  Card,
  TextField,
  Button,
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
import "./index.css";

export default function Dashboard() {
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
      iconButton.style.border = "1px solid #000000";
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
      <div id="mint-bot">
        <Card
          sx={{
            maxWidth: "300px",
            padding: "20px",
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
                sx={{ width: "260px", height: "260px", borderRadius: "0px" }}
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
                    color: "#8f8f8f",
                    fontSize: "32px",
                  }}
                />
              </IconButton>
            </div>
          </div>
          <div>
            <TextField
              onChange={handleName}
              value={name}
              fullWidth
              id="input-name"
              label="Name"
              type="text"
              size="small"
            />
          </div>
          <div>
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
          </div>
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
      </div>
    </>
  );
}
