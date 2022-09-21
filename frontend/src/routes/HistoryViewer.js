import React, { useEffect, useState, useContext, useMemo, Fragment } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { CredentialsContext } from '../context/CredentialsContext';
import { ServerUrlContext } from '../context/ServerUrlContext';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button'
import { defaultPfp } from '../constants';
import TextPost from '../components/TextPost';
import ImagePost from '../components/ImagePost';

const HistoryViewer = () => {
    const {postType, postId} = useParams();
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [editHistory, setEditHistory] = useState(null)
    const [currentPost, setCurrentPost] = useState(null)
    const [profileData, setProfileData] = useState(null)
    const {storedCredentials, setStoredCredentials} = useContext(CredentialsContext)
    const {publicId} = storedCredentials;
    const {serverUrl, setServerUrl} = useContext(ServerUrlContext)

    useEffect(() => { //When the page first loads, check to see that postType and postId are provided and they are the right values
        if (postType !== 'image' && postType !== 'text') throw new Error('postType must either be image or text')
        if (!postId) throw new Error('postId must be provided')
    }, [])

    const loadData = () => {
        setLoading(true)
        setError(null)
        setEditHistory(null)
        setCurrentPost(null)
        setProfileData(null)
        const url = `${serverUrl}/user/posthistory?postId=${postId}&postType=${postType}&publicId=${publicId}`
        console.log(url)
        axios.get(url).then(response => response.data.data).then(async result => {
            console.log(result)
            const {profileData, editHistory, currentPost} = result;

            if (currentPost.imageKey) currentPost.image = ('data:image/jpeg;base64,' + (await axios.get(`${serverUrl}/image/${currentPost.imageKey}`)).data)
            profileData.profilePicture = profileData.profileImageKey !== '' ? ('data:image/jpeg;base64,' + (await axios.get(`${serverUrl}/image/${profileData.profileImageKey}`)).data) : defaultPfp
            setCurrentPost(currentPost)
            setEditHistory(editHistory.sort((a,b) => b.dateMade - a.dateMade))
            setProfileData(profileData)
            setLoading(false)
        }).catch(error => {
            console.error(error)
            setError(error?.response?.data?.error || String(error))
            setLoading(false)
        })
    }

    const DisplayEdits = useMemo(() => {
        return Array.isArray(editHistory) ? editHistory.map((edit, index) => {
            if (currentPost.imageKey) edit.image = currentPost.image
            return (
                <div style={{marginTop: 20, marginBottom: 20, minWidth: 400, maxWidth: '50vw'}} key={index.toString()}>
                    {edit.image ?
                        <ImagePost {...edit} profileName={profileData.name} profileImage={profileData.profilePicture} isPostOwner={false} disableFunctionality/>
                    :
                        <TextPost {...edit} profileName={profileData.name} profileImage={profileData.profilePicture} isPostOwner={false} editNumber={editHistory.length - index - 1} disableFunctionality/>
                    }
                </div>
            )
        }) : null
    }, [editHistory])


    useEffect(loadData, []) //When the page first loads, load the data

    return (
        <div style={{display: 'flex', alignItems: 'center', flexDirection: 'column', alignSelf: 'center'}}>
            {loading ?
                <Box sx={{mt: 3}}>
                    <CircularProgress/>
                </Box>
            : error ?
                <>
                    <h1 style={{color: 'red'}}>An error occured:</h1>
                    <h1 style={{color: 'red'}}>{error}</h1>
                    <Box sx={{mt: 3, display: 'flex', justifyContent: 'center'}}>
                        <Button color='error' onClick={loadData}>Retry</Button>
                    </Box>
                </>
            : currentPost && editHistory && profileData ?
                <>
                    <h1>Current Post:</h1>
                    {postType === 'text' ?
                        <TextPost {...currentPost} profileName={profileData.profileName} profileImage={profileData.profilePicture} isPostOwner={false} disableFunctionality/>
                    :
                        <ImagePost {...currentPost} profileName={profileData.profileName} profileImage={profileData.profilePicture} isPostOwner={false} disableFunctionality/>
                    }
                    <h1>Edits (Most Recent - Least Recent):</h1>
                    {DisplayEdits}
                </>
            : null
            }
        </div>
    )
}

export default HistoryViewer