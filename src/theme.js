import { createTheme } from "@mui/material/styles";

export const getAppTheme = (primaryColor = "#1976d2") =>
  createTheme({
    palette: {
      primary: {
        main: primaryColor,
      },
    },
    shape: {
      borderRadius: 8,
    },
  });
