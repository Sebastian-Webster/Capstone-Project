import React, {useContext, useEffect} from "react";
import { CredentialsContext } from "../context/CredentialsContext";
import { Button, colors } from '@mui/material';
import useColorScheme from "../hooks/useColorScheme";
import { NavLink, Outlet, useOutlet, useNavigate } from "react-router-dom";

const SettingsButton = ({text, onClick}) => (
    <button onClick={onClick} style={{width: '50vw', height: '10vh', marginTop: '2vh', border: '1px solid black', borderRadius: 10, fontSize: '5vh', cursor: 'pointer'}}>{text}</button>
)

const Settings = () => {
    const {storedCredentials, setStoredCredentials} = useContext(CredentialsContext)
    const colors = useColorScheme();
    const outlet = useOutlet()
    const navigate = useNavigate()
    
    useEffect(() => {
        if (outlet === null) {
            navigate('changepassword') //Each time a settings page is loaded, if there is no settings being shown, automatically redirect to the change password settings screen
        }
    }, [outlet])

    const selectStyles = ({isActive}) => ({
        color: colors.tertiary,
        fontSize: 16,
        fontWeight: isActive ? 'bold' : 'normal',
        textDecoration: 'none',
        textAlign: 'center'
    })

    const Logout = () => {
        localStorage.removeItem('SebMediaCredentials')
        setStoredCredentials(null)
    }

    return (
        <div style={{width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
            <div style={{height: '85%', width: '50%', maxWidth: '50%', backgroundColor: colors.secondary, display: 'flex', flexDirection: 'row', borderRadius: 30}}>
                <div style={{width: 170, height: '100%', borderRight: `2px solid ${colors.tertiary}`, padding: '30px 5px', overflow: 'scroll'}}>
                    <NavLink to='changepassword' style={selectStyles}>
                        <p>Change Password</p>
                    </NavLink>
                    <NavLink to='changeemail' style={selectStyles}>
                        <p>Change Email</p>
                    </NavLink>
                    <NavLink to='changeprofilepicture' style={selectStyles}>
                        <p>Change Profile Picture</p>
                    </NavLink>
                    <NavLink to='privacy' style={selectStyles}>
                        <p>Privacy</p>
                    </NavLink>
                    <Button variant="outlined" onClick={Logout} size="large" sx={{width: '100%'}}>Logout</Button>
                </div>
                <div style={{width: '100%', paddingBottom: 30, paddingTop: 30, display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'scroll', flexDirection: 'column'}}>
                    <Outlet/>
                </div>
            </div>
        </div>
    )
}

export default Settings;