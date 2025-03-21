// Header.js
import React, { useState, useEffect } from 'react';
import HeaderDesktop from './HeaderDesktop2';
import HeaderMobile from './HeaderMobile2';

const Header = ({ search, handleSearch, handleClick,toggleSidebar }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);
  

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile ? (
    <HeaderMobile search={search} handleSearch={handleSearch} handleClick={handleClick} toggleSidebar={toggleSidebar}/>
  ) : (
    <HeaderDesktop search={search} handleSearch={handleSearch} handleClick={handleClick} toggleSidebar={toggleSidebar} />
  );
};

export default Header;
