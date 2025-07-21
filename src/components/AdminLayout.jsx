// src/components/AdminLayout.jsx
import React, { useState } from "react";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  CssBaseline,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";
import {
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  UploadFile as UploadIcon,
  People as PeopleIcon,
  Quiz as QuizIcon,
  Dashboard as DashboardIcon,
  Logout as LogoutIcon,
  PersonAdd as AddUserIcon,
  Business as BusinessIcon,
  Assignment as ExamIcon,
} from "@mui/icons-material";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const drawerWidthExpanded = 240;
const drawerWidthCollapsed = 72;

const AdminLayout = ({ children }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { text: "Dashboard", icon: <DashboardIcon />, path: "/admin" },
    { text: "Manage Departments", icon: <BusinessIcon />, path: "/admin/departments" },
    { text: "Add Student", icon: <AddUserIcon />, path: "/admin/add-student" },
    { text: "Manage Students", icon: <PeopleIcon />, path: "/admin/students" },
    { text: "Upload Questions", icon: <UploadIcon />, path: "/admin/upload-questions" },
    { text: "Manage Questions", icon: <QuizIcon />, path: "/admin/questions" },
    { text: "Manage Exams", icon: <ExamIcon />, path: "/admin/exams" },
  ];

  const drawerContent = (
    <Box>
      <Toolbar sx={{ justifyContent: collapsed ? "center" : "space-between", px: 2 }}>
        {!collapsed && <Typography variant="h6">CBT Admin</Typography>}
        <IconButton onClick={() => setCollapsed(!collapsed)} size="small">
          <ChevronLeftIcon />
        </IconButton>
      </Toolbar>
      <Divider />
      <List>
        {navItems.map((item) => (
          <Tooltip key={item.text} title={collapsed ? item.text : ""} placement="right">
            <ListItem
              button
              onClick={() => navigate(item.path)}
              selected={location.pathname === item.path}
              sx={{ px: collapsed ? 2 : 3 }}
            >
              <ListItemIcon sx={{ minWidth: 0, mr: collapsed ? "auto" : 2 }}>
                {item.icon}
              </ListItemIcon>
              {!collapsed && <ListItemText primary={item.text} />}
            </ListItem>
          </Tooltip>
        ))}
      </List>
      <Divider />
      <Tooltip title={collapsed ? "Logout" : ""} placement="right">
        <ListItem button onClick={logout} sx={{ px: collapsed ? 2 : 3 }}>
          <ListItemIcon sx={{ minWidth: 0, mr: collapsed ? "auto" : 2 }}>
            <LogoutIcon />
          </ListItemIcon>
          {!collapsed && <ListItemText primary="Logout" />}
        </ListItem>
      </Tooltip>
    </Box>
  );

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />

      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${collapsed ? drawerWidthCollapsed : drawerWidthExpanded}px)` },
          ml: { sm: `${collapsed ? drawerWidthCollapsed : drawerWidthExpanded}px` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>
            CBT Admin Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Sidebar Drawer */}
      <Box component="nav" sx={{ width: { sm: collapsed ? drawerWidthCollapsed : drawerWidthExpanded }, flexShrink: 0 }}>
        {/* Mobile Drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": {
              width: drawerWidthExpanded,
            },
          }}
        >
          {drawerContent}
        </Drawer>

        {/* Desktop Drawer */}
        <Drawer
          variant="permanent"
          open
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              width: collapsed ? drawerWidthCollapsed : drawerWidthExpanded,
              overflowX: "hidden",
              transition: "width 0.3s",
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${collapsed ? drawerWidthCollapsed : drawerWidthExpanded}px)` },
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default AdminLayout;
