// Header.js
import React, { useState, useEffect } from 'react';
import HeaderDesktop from './HeaderDesktop';
import HeaderMobile from './HeaderMobile';

const Header = ({ search, handleSearch, handleClick ,onDepartmentChange }) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 600);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 600);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile ? (
    <HeaderMobile search={search} handleSearch={handleSearch} handleClick={handleClick} />
  ) : (
    <HeaderDesktop search={search} handleSearch={handleSearch} handleClick={handleClick}  onDepartmentChange={onDepartmentChange} />
  );
};

export default Header;
