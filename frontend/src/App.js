import React, {useContext, useEffect, useState} from 'react';
import { Outlet, NavLink, Navigate } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHouse, faChartLine, faPlus, faGear, faMoon, faSun, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import './App.css'
import { CredentialsContext } from './context/CredentialsContext';
import { DarkModeContext } from './context/DarkModeContext';
import useComponent from './hooks/useComponent';
import { defaultPfp } from './constants';
import { ServerUrlContext } from './context/ServerUrlContext';
import useColorScheme from './hooks/useColorScheme';

function App() {
  const {storedCredentials, setStoredCredentials} = useContext(CredentialsContext);
  if (storedCredentials) {var {profileImageUri} = storedCredentials}
  const {serverUrl, setServerUrl} = useContext(ServerUrlContext);
  const {darkMode, setDarkMode} = useContext(DarkModeContext);
  const {Div} = useComponent()
  const [anchorEl, setAnchorEl] = useState(null);
  const colors = useColorScheme();
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    console.log(event.currentTarget)
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const Logout = () => {
    handleClose()
    localStorage.removeItem('SebMediaCredentials')
    setStoredCredentials(null)
  }

  const navStyle = {
    marginRight: '5%',
    fontSize: 35
  }

  const darkLightModeIconStyle = {
    fontSize: 35,
    marginLeft: 10,
    cursor: 'pointer'
  }

  useEffect(() => {
    document.body.style = `background-color: ${darkMode ? 'black' : 'white'}`
  }, [darkMode])

  return (
    <Div>
      <header style={{borderBottomColor: darkMode ? 'white' : 'black', height: 70}}>
        <div>
          <h1>SebMedia 2.0</h1>
          <button style={{background: 'none', margin: 0, padding: 0, border: 'none'}} onClick={() => {setDarkMode(!darkMode)}}>
            {darkMode ?
              <FontAwesomeIcon icon={faSun} style={{...darkLightModeIconStyle, color: 'yellow'}}/>
            :
              <FontAwesomeIcon icon={faMoon} style={{...darkLightModeIconStyle, color: 'black'}}/>
            }
          </button>
        </div>
        <div>
          <NavLink to="home" style={navStyle}>
            <FontAwesomeIcon icon={faHouse}/>
          </NavLink>
          <NavLink to="search" style={navStyle}>
            <FontAwesomeIcon icon={faMagnifyingGlass}/>
          </NavLink>
          <NavLink to="profile" style={navStyle}>
            <img src={profileImageUri} style={{width: 50, height: 50, cursor: 'pointer', border: `2px solid ${colors.tertiary}`, borderRadius: '50%', marginTop: 10, objectFit: 'center'}} alt='Profile Image'/>
          </NavLink>
          <NavLink to="posts" style={navStyle}>
            <FontAwesomeIcon icon={faPlus}/>
          </NavLink>
          <NavLink to="settings" style={navStyle}>
            <FontAwesomeIcon icon={faGear}/>
          </NavLink>
        </div>
      </header>
      {storedCredentials ? 
        <div style={{height: 'calc(100vh - 92px)', width: '100vw', margin: 0, padding: 0}}>
          <Outlet/>
        </div>
      : 
        <Navigate to="login"/>
      }
    </Div>
  );
}

export default App;
