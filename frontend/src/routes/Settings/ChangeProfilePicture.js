import React, {useContext, useState, useEffect} from 'react';
import axios from 'axios';
import Fab from '@mui/material/Fab';
import EditIcon from '@mui/icons-material/Edit';
import { useFilePicker } from 'use-file-picker';
import { CredentialsContext } from '../../context/CredentialsContext';
import useColorScheme from '../../hooks/useColorScheme';
import { ServerUrlContext } from '../../context/ServerUrlContext';
import { defaultPfp } from '../../constants';
import * as _ from 'lodash';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress'

const ChangeProfilePicture = () => {
    const colors = useColorScheme()
    const [openProfileImageFileSelector, { plainFiles: profileImageToUpload, loading: profileImageFileLoading}] = useFilePicker({accept: 'image/jpeg', multiple: false})
    const {storedCredentials, setStoredCredentials} = useContext(CredentialsContext);
    const {profileImageUri, _id} = storedCredentials
    const {serverUrl, setServerUrl} = useContext(ServerUrlContext)
    const [resetting, setResetting] = useState(false)
    const [changing, setChanging] = useState(false)
    const [error, setError] = useState(null)

    const resetProfilePicture = () => {
        setResetting(true)
        setError(null)
        const url = `${serverUrl}/user/profilepicture`
        const toSend = {
            userId: _id
        }

        axios.delete(url, {data: toSend}).then(() => {
            setStoredCredentials(storedCredentials => {
                const newStoredCredentials = _.cloneDeep(storedCredentials)
                newStoredCredentials.profileImageUri = defaultPfp
                if (newStoredCredentials.rememberMe) localStorage.setItem('SebMediaCredentials', JSON.stringify(newStoredCredentials))
                return newStoredCredentials
            })
            setResetting(false)
        }).catch(error => {
            setError(error?.response?.data?.error || String(error))
            setResetting(false)
        })
    }

    useEffect(() => {
        console.log(profileImageToUpload[0])
        if (profileImageToUpload[0]) {
            setChanging(true)
            setError(null)
            const toSend = new FormData();

            toSend.append('image', profileImageToUpload[0])
            toSend.append('_id', _id)

            var file = profileImageToUpload[0]
            var reader = new FileReader();

            reader.onloadend = (e) => {
                axios.post(`${serverUrl}/user/updateProfileImage`, toSend, {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'multipart/form-data'
                    }
                })
                .then(response => response.data.data)
                .then(result => {
                    const newStoredCredentials = _.cloneDeep(storedCredentials)
                    newStoredCredentials.profileImageKey = result
                    newStoredCredentials.profileImageUri = reader.result
                    if (newStoredCredentials.rememberMe) {
                        localStorage.setItem('SebMediaCredentials', JSON.stringify(newStoredCredentials))
                    }
                    setStoredCredentials(newStoredCredentials)
                    setChanging(true)
                    setError(null)
                })
                .catch(error => {
                    setError(error?.response?.data?.error || String(error))
                    setChanging(false)
                })
            }

            const handleError = (error) => {
                console.error(error)
                setError(String(error))
                setChanging(false)
            }

            reader.onabort = handleError
            reader.onerror = handleError

            reader.readAsDataURL(file);
        }
    }, [profileImageToUpload])

    return (
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
            {resetting || changing || profileImageFileLoading ?
                <Box>
                    <h2>{resetting ? 'Resetting' : 'Changing'} your profile picture...</h2>
                    <CircularProgress/>
                </Box>
            :
                <>
                    <h2>Current Profile Picture:</h2>
                    <img src={profileImageUri} style={{width: 100, height: 100, cursor: 'pointer', border: `2px solid ${colors.tertiary}`, borderRadius: '50%', marginTop: 10, objectFit: 'center'}} alt='Profile Image'/>
                    <Fab color="secondary" aria-label="add" variant="extended" onClick={openProfileImageFileSelector} sx={{mt: 3}}>
                        <EditIcon />
                        Change profile picture
                    </Fab>
                    <Fab color='error' variant="extended" onClick={resetProfilePicture} sx={{mt: 3}}>
                        Reset profile picture
                    </Fab>
                    {error && <h3 style={{color: 'red', marginTop: 20}}>{error}</h3>}
                </>
            }
        </div>
    )
}

export default ChangeProfilePicture;