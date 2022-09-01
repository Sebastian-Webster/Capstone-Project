import React, {useContext} from "react";
import { CredentialsContext } from "../context/CredentialsContext";
import { Button } from '@mui/material';

const SettingsButton = ({text, onClick}) => (
    <button onClick={onClick} style={{width: '50vw', height: '10vh', marginTop: '2vh', border: '1px solid black', borderRadius: 10, fontSize: '5vh', cursor: 'pointer'}}>{text}</button>
)

const Settings = () => {
    const {storedCredentials, setStoredCredentials} = useContext(CredentialsContext)

    const Logout = () => {
        localStorage.removeItem('SebMediaCredentials')
        setStoredCredentials(null)
    }

    return (
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
            <Button variant="outlined" onClick={Logout} size="large">Logout</Button>
        </div>
    )
}

export default Settings;