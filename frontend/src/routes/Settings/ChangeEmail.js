import React, {useContext} from 'react';
import { CredentialsContext } from '../../context/CredentialsContext';
import useInput from '../../hooks/useInput';
import Button from '@mui/material/Button'

const ChangeEmail = () => {
    const {storedCredentials, setStoredCredentials} = useContext(CredentialsContext)
    const {email} = storedCredentials;
    const [newEmail, bindNewEmail] = useInput('', 'newEmail', 'standard', {height: 30, fontSize: 20, minWidth: '70%'})
    const [password, bindPassword] = useInput('', 'password', 'standard', {height: 30, fontSize: 20, minWidth: '70%'})
    return (
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
            <h1>Current email: {email}</h1>
            <h3>New Email</h3>
            <input {...bindNewEmail}/>
            <h3>Password</h3>
            <input {...bindPassword}/>
            <Button variant="outlined" onClick={() => alert('Coming soon')} size="large" sx={{mt: 3}}>Submit</Button>
        </div>
    )
}

export default ChangeEmail;