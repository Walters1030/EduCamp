import { Link, useNavigate,useLocation } from "react-router-dom";
import './Header.css';
import { FaSearch } from "react-icons/fa";
import { useState, useEffect } from "react";
import axios from 'axios';
import config from "./config";
import ChatIcon from '@mui/icons-material/Chat';
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
  } from '@mui/material';

function Header(props,) {
    const navigate = useNavigate();
    const [selectedDepartment, setSelectedDepartment] = useState(localStorage.getItem('department') || "All Department");
    const [showOver, setShowOver] = useState(false);
    const [showMyAdsDropdown, setShowMyAdsDropdown] = useState(false);
    const [userInitial, setUserInitial] = useState('');
    const location = useLocation();
    const handleNavigation = (item) => {
        navigate(item.path, { state: item.state });
    };

    const fetchUserProfile = async () => {
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');

        if (token && userId) {
            try {
                const response = await axios.get(`${config.API_BASE_URL}/Myprofile/${userId}`);
                if (response.data && response.data.user) {
                    const firstNameInitial = response.data.user.username.charAt(0).toUpperCase();
                    setUserInitial(firstNameInitial);
                }
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        } else {
            setUserInitial('');
        }
    };

    useEffect(() => {
        fetchUserProfile();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        alert('We will Miss you ....');
        setUserInitial('');
        navigate('/');
    };

    const handleDepartmentChange = (e) => {
        const department = e.target.value;
        setSelectedDepartment(department);
        localStorage.setItem('department', department);
        props.onDepartmentChange && props.onDepartmentChange(department);
    };

    return (
        <div className='header-container d-flex justify-content-between'>
            <div className="header">
                <h1 onClick={() => {
                    if (window.location.pathname !== '/') {
                        window.location.href = '/';
                    } else {
                        window.location.reload();
                    }
                }} className="links" style={{ cursor: 'pointer' }}><IconButton edge="start" color="inherit" aria-label="logo">
                <Avatar
                  src="/LOGO.png"
                  className="logo-avatar"
                />
              </IconButton>EduCamp</h1>
              <div class="search-container">
                <select 
                    className="department-select" 
                    value={selectedDepartment} 
                    onChange={handleDepartmentChange}
                >
                    {["All Department", "Computer Science", "Electrical Engineering", "Mechanical Engineering", "Civil Engineering", "Business Administration"].map((dept, index) => (
                        <option key={index} value={dept}>{dept}</option>
                    ))}
                </select>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <input
                        className='search'
                        type='text'
                        value={props.search}
                        onChange={(e) => props.handleSearch && props.handleSearch(e.target.value)}
                    />
                    <button className='search-btn' onClick={props.handleClick}>
                        <FaSearch />
                    </button>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '30px' }}>
            {localStorage.getItem("token") && (
  <Link to="/chat">
    <IconButton sx={{ color: "#002f34" }} aria-label="chat">
      <ChatIcon />
    </IconButton>
  </Link>
)}


                <div onClick={() => setShowOver(!showOver)} style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    background: '#002f34',
                    width: '40px',
                    height: '40px',
                    color: '#fff',
                    fontSize: '14px',
                    borderRadius: '50%',
                    cursor: 'pointer'
                }}>
                    {userInitial}
                </div>

                {showOver && (
                    <div style={{
                        minHeight: '60px',
                        width: '200px',
                        background: '#002f34',
                        position: 'absolute',
                        top: '0',
                        right: '0',
                        zIndex: 10,
                        marginTop: '50px',
                        marginRight: '50px',
                        color: 'white',
                        borderRadius: '7px',
                        padding: '10px'
                    }}>
                        {!!localStorage.getItem('token') && <Link to="/Liked"><button className="btn logout-btn">LIKES</button></Link>}
                        {!!localStorage.getItem('token') && localStorage.getItem('type') !== 'admin' && (
  <>
    <Link to="/Addproduct">
      <button className="btn logout-btn">ADD PRODUCT</button>
    </Link>
    <Link to="/Tutor">
      <button className="btn logout-btn">BECOME TUTOR</button>
    </Link>
  </>
)}

                        
                        {/* MY ADS Dropdown */}
                        {/* {!!localStorage.getItem('token') && (
                            <div>
                                <button 
                                    className="btn logout-btn"
                                    onClick={() => setShowMyAdsDropdown(!showMyAdsDropdown)}
                                >
                                    MY ADS
                                </button>
                                {showMyAdsDropdown && (
                                    <div style={{
                                        position: 'absolute',
                    top: '100px', // Adjust as needed
                    right: '190px', // Adjust placement
                    background: '#002f34',
                    borderRadius: '7px',
                    zIndex: 20,
                    padding: '10px',
                    width: '150px',
                    textAlign: 'center'
                                    }}>
                                        <Link to="/Myproducts"><button className="btn logout-btn">My Products</button></Link>
                                        <Link to="/MyTeaching"><button className="btn logout-btn">My Subjects</button></Link>
                                    </div>
                                )}
                            </div>
                        )} */}

{!!localStorage.getItem('token') && (
  localStorage.getItem('type') === 'admin' ? (
    <Link to="/admin">
      <button className="btn logout-btn">DASHBOARD</button>
    </Link>
  ) : (
    <Link to={`/userprofile/${localStorage.getItem('userId')}`}>
      <button className="btn logout-btn">MY PROFILE</button>
    </Link>
  )
)}

                        {!localStorage.getItem('token') ? (
                            <>
                                <Link className="login" to="/Login" state={{ isLogin: true }}>LOGIN</Link>
                                <br />
                                <Link className="login" to="/Login" state={{ isLogin: false }}>SIGNUP</Link>
                            </>
                        ) : (
                            <button className="btn logout-btn" onClick={handleLogout}>LOGOUT</button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

export default Header;
