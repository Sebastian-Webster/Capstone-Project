import React, {useContext, useState} from 'react';
import useInput from '../../hooks/useInput';
import Button from '@mui/material/Button';
import { CredentialsContext } from '../../context/CredentialsContext';
import axios from 'axios';
import { ServerUrlContext } from '../../context/ServerUrlContext';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress'

const ChangePassword = () => {
    const {storedCredentials, setStoredCredentials} = useContext(CredentialsContext)
    const {_id} = storedCredentials;
    const [oldPassword, bindOldPassword, resetOldPassword] = useInput('', 'oldPassword', 'standard', {height: 30, fontSize: 20, minWidth: '70%'}, 'password')
    const [newPassword, bindNewPassword, resetNewPassword] = useInput('', 'newPassword', 'standard', {height: 30, fontSize: 20, minWidth: '70%'}, 'password')
    const [confirmPassword, bindConfirmPassword, resetConfirmPassword] = useInput('', 'confirmPassword', 'standard', {height: 30, fontSize: 20, minWidth: '70%'}, 'password')
    const [changingPassword, setChangingPassword] = useState(false)
    const [changingPasswordError, setChangingPasswordError] = useState(null)
    const [successfullyChangedPassword, setSuccessfullyChangedPassword] = useState(false)
    const {serverUrl, setServerUrl} = useContext(ServerUrlContext)

    const changePassword = () => {
        setChangingPassword(true)
        setChangingPasswordError(null)
        setSuccessfullyChangedPassword(false)

        const url = `${serverUrl}/user/changepassword`
        const toSend = {
            userId: _id,
            oldPassword,
            newPassword,
            confirmPassword
        }

        axios.post(url, toSend).then(() => {
            setChangingPassword(false)
            setChangingPasswordError(null)
            setSuccessfullyChangedPassword(true)
            resetOldPassword()
            resetNewPassword()
            resetConfirmPassword()
        }).catch(error => {
            console.error(error)
            setChangingPassword(false)
            setChangingPasswordError(error?.response?.data?.error || String(error))
            setSuccessfullyChangedPassword(false)
        })
    }

    return (
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
            {changingPassword ?
                <>
                    <h2>Your password is being changed...</h2>
                    <Box>
                        <CircularProgress/>
                    </Box>
                </>
            :
                <form onSubmit={changePassword} style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
                    <h3>Old Password</h3>
                    <input {...bindOldPassword}/>
                    <h3>New Password</h3>
                    <input {...bindNewPassword}/>
                    <h3>Confirm Password</h3>
                    <input {...bindConfirmPassword}/>
                    <Button variant="outlined" type='submit' size="large" sx={{mt: 3}}>Submit</Button>
                    {changingPasswordError && <h3 style={{color: 'red'}}>{changingPasswordError}</h3>}
                    {successfullyChangedPassword && <h3 style={{color: 'green'}}>Successfully changed password.</h3>}
                </form>
            }
        </div>
    )
}

export default ChangePassword;