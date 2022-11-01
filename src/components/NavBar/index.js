import { Button, ToggleButtonGroup, ToggleButton, Chip } from "@mui/material";
import {
  FiberManualRecordRounded,
  ExitToAppRounded,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useMatchMedia } from "../../hooks/useMatchMedia";
import useWeb3 from "../../hooks/useWeb3";

import "./index.css";

export default function NavBar() {
  const isMobileResolution = useMatchMedia("(max-width:500px)", false);
  let location = useLocation();
  let navigate = useNavigate();
  const { account, network, connectWallet } = useWeb3();

  const handleChange = (event, value) => {
    navigate(value);
  };

  return (
    <div className="navbar">
      <div className="logo">
        <h2>GRID BOT</h2>
      </div>

      {/* {isMobileResolution ? (
        <div></div>
      ) : (
        <div className="routes">
          <ToggleButtonGroup
            color="primary"
            value={location.pathname}
            exclusive
            onChange={handleChange}
            aria-label="nav"
          >
            <ToggleButton
              sx={{
                color: "#ffffff",
                width: "70px",
                "&:hover": {
                  backgroundColor: "#2c2c2c49",
                },
              }}
              value="/"
            >
              Home
            </ToggleButton>
            <ToggleButton
              sx={{
                color: "#ffffff",
                width: "70px",
                "&:hover": {
                  backgroundColor: "#2c2c2c49",
                },
              }}
              value="/dashboard"
            >
              Dashboard
            </ToggleButton>
          </ToggleButtonGroup>
        </div>
      )} */}

      <div className="profile">
        {account ? (
          <Chip
            sx={{
              color: "#ffffff",
              backgroundColor: "#2c2c2c49",
              padding: "20px 5px",
              fontSize: "14px",
            }}
            deleteIcon={<FiberManualRecordRounded />}
            color="primary"
            label={
              <div className="account">
                <FiberManualRecordRounded
                  sx={{
                    fontSize: "14px",
                    color: "#00ff00",
                    marginRight: "6px",
                  }}
                />
                <span>
                  {account.substring(0, 5) + "..." + account.substring(38, 42)}
                </span>
                <ExitToAppRounded
                  onClick={() => connectWallet({ change: true })}
                  sx={{
                    cursor: "pointer",
                    fontSize: "22px",
                    color: "#ff0000",
                    marginLeft: "6px",
                  }}
                />
              </div>
            }
          />
        ) : (
          <Button
            onClick={() => connectWallet()}
            variant="contained"
            disableElevation
          >
            Connect Wallet
          </Button>
        )}
      </div>
    </div>
  );
}
