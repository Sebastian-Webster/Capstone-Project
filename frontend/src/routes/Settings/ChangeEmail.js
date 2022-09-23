import React, {useContext, useState} from 'react';
import { CredentialsContext } from '../../context/CredentialsContext';
import useInput from '../../hooks/useInput';
import Button from '@mui/material/Button'
import axios from 'axios';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress'
import { ServerUrlContext } from '../../context/ServerUrlContext'
import * as _ from 'lodash'

const ChangeEmail = () => {
    const {storedCredentials, setStoredCredentials} = useContext(CredentialsContext)
    const {email, _id} = storedCredentials;
    const [newEmail, bindNewEmail] = useInput('', 'newEmail', 'standard', {height: 30, fontSize: 20, minWidth: '70%'})
    const [password, bindPassword] = useInput('', 'password', 'standard', {height: 30, fontSize: 20, minWidth: '70%'}, 'password')
    const [changingEmail, setChangingEmail] = useState(false)
    const [errorChangingEmail, setErrorChangingEmail] = useState(null)
    const {serverUrl, setServerUrl} = useContext(ServerUrlContext)

    const changeEmail = () => {
        setChangingEmail(true)
        setErrorChangingEmail(null)
        const url = `${serverUrl}/user/changeemail`
        const toSend = {
            newEmail,
            password,
            userId: _id
        }
        axios.post(url, toSend).then(() => {
            setStoredCredentials(storedCredentials => {
                const newStoredCredentials = _.cloneDeep(storedCredentials)
                newStoredCredentials.email = newEmail
                if (storedCredentials.rememberMe) localStorage.setItem('SebMediaCredentials', JSON.stringify(newStoredCredentials))
                return newStoredCredentials
            })
            setChangingEmail(false)
        }).catch(error => {
            console.error(error)
            setErrorChangingEmail(error?.response?.data?.error || String(error))
            setChangingEmail(false)
        })
    }

    return (
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
            {changingEmail ?
                <>
                    <h1>Changing email...</h1>
                    <Box sx={{mt: 2}}>
                        <CircularProgress/>
                    </Box>
                </>
            :
                <>
                    <h1 style={{textAlign: 'center'}}>Current email: {email}</h1>
                    <form onSubmit={changeEmail} style={{display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center'}}>
                        <h3>New Email</h3>
                        <input {...bindNewEmail}/>
                        <h3>Password</h3>
                        <input {...bindPassword}/>
                        <Button variant="outlined" size="large" sx={{mt: 3}} type='submit'>Submit</Button>
                    </form>
                    {errorChangingEmail && <h3 style={{color: 'red'}}>{errorChangingEmail}</h3>}
                </>
            }
        </div>
    )
}

export default ChangeEmail;