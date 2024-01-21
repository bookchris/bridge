import {
  AppBar,
  Box,
  Divider,
  Drawer,
  Icon,
  IconButton,
  List,
  MenuItem,
  Toolbar,
  Typography,
} from "@mui/material";
import { ReactElement, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { Avatar } from "./avatar";

export default function NavBar(): ReactElement {
  const [mobileOpen, setMobileOpen] = useState(false);
  const handleDrawerToggle = () => setMobileOpen(!mobileOpen);
  const drawerWidth = 240;

  return (
    <>
      <AppBar position="static" color="secondary" elevation={0}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2 }}
          >
            <Icon>menu</Icon>
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Bridge
          </Typography>
          <Avatar />
        </Toolbar>
      </AppBar>
      <Box component="nav">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
            },
          }}
        >
          <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
            <Typography variant="h6" sx={{ my: 2 }}>
              Bridge
            </Typography>
            <Divider />
            <List>
              <MenuItem component={RouterLink} to="/">
                Home
              </MenuItem>
              <MenuItem component={RouterLink} to="/hands">
                My Hands
              </MenuItem>
              <MenuItem component={RouterLink} to="/import">
                Import
              </MenuItem>
            </List>
          </Box>
        </Drawer>
      </Box>
    </>
  );
}
