import React, { useEffect } from "react";
import { toast, ToastBar, Toaster, useToasterStore } from "react-hot-toast";
import {
  ThemeProvider,
  createTheme,
  experimental_sx as sx,
} from "@mui/material/styles";
import { Outlet } from "react-router-dom";
import NavBar from "../NavBar";
import LeftPanel from "../LeftPanel";
import RightPanel from "../RightPanel";
import BottomPanel from "../BottomPanel";

const theme = createTheme({
  palette: {
    mode: "dark",
  },
  components: {
    MuiChip: {
      styleOverrides: {
        root: sx({
          color: "#ffffff",
          backgroundColor: "#000000",
          borderRadius: "5px",
          fontSize: "14px",
          py: "18px",
        }),
        label: sx({
          padding: "10px",
        }),
      },
    },
    MuiListItemText: {
      styleOverrides: {
        secondary: sx({
          color: "#ffffff",
        }),
      },
    },
    MuiCard: {
      styleOverrides: {
        root: sx({
          bgcolor: "transparent",
          background: "transparent",
          boxShadow: 0,
        }),
      },
    },
  },
});

export default function Layout() {
  return (
    <ThemeProvider theme={theme}>
      <div className="grid-container">
        {/* <ToastModal /> */}
        <header className="header">
          <NavBar />
        </header>
        <nav className="nav">
          <LeftPanel />
        </nav>
        <section className="section">
          <Outlet />
        </section>
        <article className="article">
          <BottomPanel />
        </article>
        <aside className="aside">
          <RightPanel />
        </aside>
      </div>
    </ThemeProvider>
  );
}

function ToastModal() {
  const { toasts } = useToasterStore();

  const TOAST_LIMIT = 1;

  useEffect(() => {
    toasts
      .filter((t) => t.visible) // Only consider visible toasts
      .filter((_, i) => i >= TOAST_LIMIT) // Is toast index over limit?
      .forEach((t) => toast.dismiss(t.id)); // Dismiss – Use toast.remove(t.id) for no exit animation
  }, [toasts]);

  return (
    <div className="div-test">
      <Toaster
        position="top-right"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
        className="toast-modal"
        toastOptions={{
          // Define default options
          className: "toast-settings",
          duration: 5000,
          style: {
            marginTop: "45px",
            background: "rgba(28, 31, 35, 1)",
            color: "whitesmoke",
          },
          // Default options for specific types
          success: {
            duration: 5000,
            theme: {
              primary: "green",
              secondary: "black",
            },
          },
        }}
      >
        {(t) => (
          <ToastBar toast={t}>
            {({ icon, message }) => (
              <>
                {icon}
                {message}
                {t.type !== "loading" && (
                  <span
                    className="toast-close"
                    onClick={() => toast.dismiss(t.id)}
                  >
                    <i className="fa-solid fa-xmark fa-lg"></i>
                  </span>
                )}
              </>
            )}
          </ToastBar>
        )}
      </Toaster>
    </div>
  );
}
