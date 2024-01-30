import { ThemeProvider } from "@emotion/react";
import { Box, CssBaseline } from "@mui/material";
import { SnackbarProvider } from "notistack";
import { Outlet, RouterProvider, createBrowserRouter } from "react-router-dom";
import NavBar from "./components/navBar";
import { UserContextProvider } from "./lib/user";
import HandPage from "./pages/hand";
import HandsPage from "./pages/hands";
import HomePage from "./pages/home";
import ImportPage from "./pages/import";
import TablePage from "./pages/table";
import TablesPage from "./pages/tables";
import { theme } from "./theme";

const Header = () => (
  <UserContextProvider>
    <CssBaseline />
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <NavBar />
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
          }}
        >
          <Box
            component="main"
            sx={{ width: "100%", maxWidth: 900, mt: { md: 2 } }}
          >
            <Outlet />
          </Box>
        </Box>
      </SnackbarProvider>
    </ThemeProvider>
  </UserContextProvider>
);

const router = createBrowserRouter([
  {
    element: <Header />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/import",
        element: <ImportPage />,
      },
      {
        path: "/tables",
        element: <TablesPage />,
      },
      {
        path: "/tables/:tableId",
        element: <TablePage />,
      },
      {
        path: "/hands",
        element: <HandsPage />,
      },
      {
        path: "/hands/:handId",
        element: <HandPage />,
      },
    ],
  },
]);

export function App() {
  return <RouterProvider router={router} />;
}
