import React, {useState, useContext, useEffect} from "react";
import { CredentialsContext } from "../../context/CredentialsContext";
import { ServerUrlContext } from "../../context/ServerUrlContext";
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch'
import axios from "axios";

const Privacy = () => {
    const {serverUrl, setServerUrl} = useContext(ServerUrlContext)
    const {storedCredentials, setStoredCredentials} = useContext(CredentialsContext)
    const {_id} = storedCredentials
    const [settings, setSettings] = useState(null)
    const [loading, setLoading] = useState(false)
    const [errorLoadingSettings, setErrorLoadingSettings] = useState(null)
    const [errorChangingSettings, setErrorChangingSettings] = useState(null)

    const loadSettings = () => {
        setLoading(true)
        setErrorLoadingSettings(null)
        const url = `${serverUrl}/user/getPrivacySettings`
        const toSend = {
            userId: _id
        }

        axios.post(url, toSend).then(response => response.data.data).then(result => {
            console.log(result)
            setLoading(false)
            setSettings(result)
        }).catch(error => {
            console.error(error)
            setErrorLoadingSettings(error?.response?.data?.error || String(error))
            setLoading(false)
        })
    }

    const changeSettings = (changeObj) => {
        setLoading(true)
        setErrorChangingSettings(null)
        const url = `${serverUrl}/user/changePrivacySettings`
        const toSend = {
            newPrivacySettings: changeObj,
            userId: _id
        }
        
        axios.patch(url, toSend).then(response => response.data.data).then(result => {
            setSettings(result)
            setLoading(false)
            setErrorChangingSettings(null)
            console.log(result)
        }).catch(error => {
            setLoading(false)
            setErrorChangingSettings(error?.response?.data?.error || String(error))
        })
    }

    useEffect(loadSettings, [])

    return (
        <>
            {loading ?
                <Box>
                    <CircularProgress/>
                </Box>
            : errorLoadingSettings ?
                <>
                    <h2 style={{color: 'red', textAlign: 'center'}}>An error occured while retrieving your privacy settings:</h2>
                    <h3 style={{color: 'red', textAlign: 'center'}}>{errorLoadingSettings}</h3>
                    <Box sx={{mt: 3, display: 'flex', justifyContent: 'center'}}>
                        <Button color='error' onClick={loadSettings}>Retry</Button>
                    </Box>
                </>
            : settings !== null ?
                <>
                    <h2>Hide who you're following from other users</h2>
                    <Box sx={{display: 'flex', justifyContent: 'center'}}>
                        <Button variant='outlined' color={settings.hideFollowing ? 'error' : 'success'} onClick={() => changeSettings({hideFollowing: !settings.hideFollowing})}>{settings.hideFollowing ? 'Disable' : 'Enable'}</Button>
                    </Box>
                    {errorChangingSettings && <h2 style={{color: 'red'}}>{errorChangingSettings}</h2>}
                </>
            : null}

        </>
    )
}

export default Privacy