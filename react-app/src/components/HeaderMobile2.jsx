import { Link, useNavigate,useLocation } from "react-router-dom";
import './Header.css';
import { FaSearch } from "react-icons/fa";
import { useState, useEffect } from "react";
import axios from 'axios';
import config from "./config";
import './Animation.css';
import ChatIcon from '@mui/icons-material/Chat';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    InputBase,
    Button,
    Menu,
    MenuItem,
    Select,
    FormControl,
    Switch,
    Avatar,
    Box,
    Modal,
    Drawer,
    Backdrop
} from '@mui/material';
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";

function Header(props) {
    const navigate = useNavigate();
    const [selectedDepartment, setSelectedDepartment] = useState(localStorage.getItem('department') || "All Department");
    const [showOver, setShowOver] = useState(false);
    const [showMyAdsDropdown, setShowMyAdsDropdown] = useState(false);
    const [userInitial, setUserInitial] = useState('');
    const [mobileOpen, setMobileOpen] = useState(false);
    const [mobileMenuStack, setMobileMenuStack] = useState([]);
    const userType = localStorage.getItem("type"); 
    const [searchActive, setSearchActive] = useState(false);
const location = useLocation();
    const toggleMobileMenu = () => {
        setMobileOpen(!mobileOpen);
        setMobileMenuStack([]);
    };

    const navigateMobileMenu = (options) => {
        setMobileMenuStack((prev) => [...prev, options]);
    };

    const goBackMobileMenu = () => {
        setMobileMenuStack((prev) => prev.slice(0, -1));
    };

    const handleLogout = () => {
        console.log('Logout triggered'); // Debugging log
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        setUserInitial('');
        
        alert('We will miss you...');
        
        navigate('/'); // Use React Router navigation instead of window.location.href
    };
    

    const myadsOptions = [
        { label: "My Products", path: "/Myproducts" },
        { label: "My Subjects", path: "/MyTeaching" },
    ];

    const loggedInMenuItems = [
        { label: "Likes", path: "/Liked" },
        { label: "Add Product", path: "/Addproduct" },
        { label: "Become Tutor", path: "/Tutor" },
        // { label: "My Ads", dropdown: myadsOptions},
        { label: "Profile", path: `/userprofile/${localStorage.getItem('userId')}` },
        { label: "Logout", action: handleLogout },
    ] 

    const loggedInAdminMenuItems = [
        { label: "Likes", path: "/Liked" },
        // { label: "My Ads", dropdown: myadsOptions},
        { label: "Profile", path: `/admin` },
        { label: "Logout", action: handleLogout },
    ] 
    
    const loggedOutMenuItems = [
        { label: "Login", path: "/Login", state: { isLogin: true } },
        { label: "Signup", path: "/Login", state: { isLogin: false } }
    ];

    const menuItems = localStorage.getItem("token")
  ? userType === "admin"
    ? loggedInAdminMenuItems
    : loggedInMenuItems
  : loggedOutMenuItems;

    const renderMobileMenu = () => (
        <Drawer anchor="right" open={mobileOpen} onClose={toggleMobileMenu}>
            <Backdrop
                sx={{ zIndex: 1300, backgroundColor: "rgba(0, 0, 0, 0.8)", display: "flex", justifyContent: "center", alignItems: "center", fontSize: "1.5rem" }}
                open={mobileOpen}
                onClick={toggleMobileMenu}
            >
                <Box
          sx={{
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            borderRadius: "10px",
            padding: "30px",
            textAlign: "center",
            animation: "fadeIn 0.5s ease-in-out",
            color: "#fff",
            backdropFilter: "blur(10px)",
            width: "80%",
            maxWidth: "400px",
            fontSize: "1.5rem",
          }}
          onClick={(e) => e.stopPropagation()}
        >
                    <IconButton onClick={toggleMobileMenu} sx={{ position: "absolute", top: 20, right: 20, color: "#fff" }}>
                        <CloseIcon />
                    </IconButton>
                    {mobileMenuStack.length > 0 ? (
                        <>
                            <Button sx={{ color: "#fff", marginBottom: 2,animation: "fadeIn 0.5s ease-in", fontSize: "1.5rem" }} onClick={goBackMobileMenu}>Back</Button>
                            {mobileMenuStack[mobileMenuStack.length - 1].map((option, index) => (
                                <Box key={option.label} sx={{ margin: "10px 0", fontSize: "1.5rem" , animation: `fadeSlideIn 0.5s ease-in ${index * 0.2}s`,animationFillMode: "both",}}>
                                    <Typography
                                        variant="h6"
                                        fontSize="1.5rem"
                                        
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (option.action) {
                                                option.action();  // Execute the logout function
                                            } else if (option.path) {
                                                window.location.href = option.path;
                                            } else if (option.dropdown) {
                                                navigateMobileMenu(option.dropdown);
                                            }
                                        }}                                        
                                        sx={{ cursor: "pointer", padding: "10px 20px", transition: "all 0.3s ease", "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)", borderRadius: "5px" } }}
                                    >
                                        {option.label}
                                    </Typography>
                                </Box>
                            ))}
                        </>
                    ) : (
                        menuItems.map((item, index) => (
                            <Box key={item.label} sx={{ margin: "10px 0", fontSize: "1.5rem",animation: `fadeSlideIn 0.5s ease-in ${index * 0.2}s`,animationFillMode: "both", }}>
                                <Typography
                                    variant="h6"
                                    fontSize="1.5rem"
                                    onClick={(e) => {
                                        e.stopPropagation(); // This now works correctly
                                    
                                        if (item.action) {
                                            console.log("Logging out...");
                                            item.action();
                                        } else if (item.path) {
                                            navigate(item.path);
                                        } else if (item.dropdown) {
                                            navigateMobileMenu(item.dropdown);
                                        }
                                    }}
                                    
                                    sx={{ cursor: "pointer", padding: "10px 20px", transition: "all 0.3s ease", "&:hover": { backgroundColor: "rgba(255, 255, 255, 0.2)", borderRadius: "5px" } }}
                                >
                                    {item.label}
                                </Typography>
                            </Box>
                        ))
                    )}
                </Box>
            </Backdrop>
        </Drawer>
    );

    return (
        
        <AppBar  position="static">
            <Toolbar className='header-container' sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>  {location.pathname === "/chat" && (<IconButton
          edge="start"
          onClick={props.toggleSidebar}
          sx={{
            left: '20px',
            mr: 2,
            '&:hover': { bgcolor: 'action.hover' }
          }}
        ><ArrowForwardIosIcon /></IconButton>)}
        </div>
                <Box  sx={{ display: 'flex', alignItems: 'center', flexGrow: 1, justifyContent: 'center' }}>
                {searchActive ? (
                        <InputBase
                            autoFocus
                            placeholder="Search..."
                            onChange={(e) => props.handleSearch && props.handleSearch(e.target.value)}
                            sx={{ backgroundColor: "white", padding: "5px 10px", borderRadius: "5px 0 0 5px", width: "100%" , border: '1px solid #002f34',}}
                        />
                    ) : (<h1 onClick={() => {
                    if (window.location.pathname !== '/') {
                        window.location.href = '/';
                    } else {
                        window.location.reload();
                    }
                }} className="links" style={{ cursor: 'pointer' }}>
                    <IconButton edge="start" color="inherit" aria-label="logo">
                <Avatar
                  src="/LOGO.png"
                  className="logo-avatar"
                />
              </IconButton>EduCamp</h1>
                )}</Box>
{localStorage.getItem("token") && (
  <>
    <Link to="/chat">
      <IconButton sx={{ color: "#002f34" }} aria-label="chat">
        <ChatIcon />
      </IconButton>
    </Link>
    {location.pathname !== "/study-chat" && (
      <Link to="/study-chat">
        <IconButton sx={{ color: "#002f34" }} aria-label="ai">
          <SmartToyIcon />
        </IconButton>
      </Link>
    )}
  </>
)}


                <IconButton color="inherit" edge="end" onClick={toggleMobileMenu} sx={{color: '#000'}}>
                    <MenuIcon />
                </IconButton>
            </Toolbar>
            {renderMobileMenu()}
        </AppBar>
    );
}

export default Header;
