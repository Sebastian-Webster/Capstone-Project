import React, { useEffect, useContext, useReducer, useMemo, Fragment } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { ServerUrlContext } from '../context/ServerUrlContext';
import { CredentialsContext } from '../context/CredentialsContext';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import useSharedCode from '../hooks/useSharedCode';
import Grid from '@mui/material/Grid';
import ProfileItem from '../components/ProfileItem';

const likesReducer = (state, action) => {
    switch(action.type) {
        case 'startLoading':
            return {...state, loading: true, error: null}
        case 'error':
            return {...state, loading: false, error: action.error}
        case 'doneLoading':
            return {
                ...state,
                loading: false,
                error: null,
                noMoreLikes: Array.isArray(state.likes) ? state.likes.length > 0 && action.likes.length === 0 : false,
                likes: Array.isArray(state.likes) ? [...state.likes, ...action.likes] : action.likes
            }
        default:
            throw new Error(`${action.type} is not a valid type for likesReducer`)
    }
}

const likesInitialState = {
    loading: false,
    error: null,
    likes: null,
    noMoreLikes: false
}

const PostLikeCount = () => {
    const {postId,  postType} = useParams();
    const {serverUrl, setServerUrl} = useContext(ServerUrlContext)
    const {storedCredentials, setStoredCredentials} = useContext(CredentialsContext)
    const {publicId, _id} = storedCredentials;
    const [likesState, dispatch] = useReducer(likesReducer, likesInitialState)
    const sharedCode = useSharedCode()
    console.log(likesState)

    const loadLikes = () => {
        dispatch({type: 'startLoading'})
        const url = `${serverUrl}/user/postlikes?postType=${postType}&postId=${postId}&skip=${Array.isArray(likesState.likes) ? likesState.likes.length : 0}`
        console.log(url)
        axios.get(url).then(response => response.data.data).then(result => {
            console.log(result)
            Promise.all(result.map(item => axios.post(`${serverUrl}/user/getPublicProfileInformation`, {userId: _id, publicId: item}))).then(profiles => profiles.map(profile => profile.data.data)).then(profiles => {
                console.log('Profiles:')
                console.log(profiles)
                Promise.all(profiles.map(sharedCode.addProfilePictureToProfileObject)).then(profilesWithProfilePictures => {
                    console.log('profilesWithProfilePictures:')
                    console.log(profilesWithProfilePictures)
                    dispatch({type: 'doneLoading', likes: profilesWithProfilePictures})
                }).catch(error => {
                    dispatch({type: 'error', error})
                    console.error(error)
                })
            }).catch(error => {
                dispatch({type: 'error', error})
                console.error(error)
            })
        }).catch(error => {
            dispatch({type: 'error', error})
            console.error(error)
        })
    }

    const DisplayLikes = useMemo(() => {
        return Array.isArray(likesState.likes) ? likesState.likes.map((like, index) => (
            <Fragment key={index.toString()}>
                <ProfileItem profileImage={like.profileImageUri} name={like.name} publicId={like.publicId}/>
            </Fragment>
        )) : null
    }, [likesState.likes])

    useEffect(loadLikes, []) //When the page is first loaded, load the likes

    if (!postId) throw new Error('postId was not provided to PostLikeCount')
    if (!postType) throw new Error('postType was not provided to PostLikeCount')

    return (
        <div style={{height: '100%', width: '100%'}}>
            {likesState.likes === null ?
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', width: '100%', height: '100%'}}>
                    {likesState.loading ?
                        <>
                            <h1>Loading likes...</h1>
                            <CircularProgress/>
                        </>
                    : likesState.error ? 
                        <>
                            <h1 style={{color: 'red'}}>{likesState.error?.response?.data?.error || String(likesState.error)}</h1>
                            <Box sx={{mt: 3, display: 'flex', justifyContent: 'center'}}>
                                <Button color='error' onClick={loadLikes}>Retry</Button>
                            </Box>
                        </>
                    :
                        null
                    }
                </div>
            :
                likesState.likes.length === 0 ?
                    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', width: '100%', height: '100%'}}>
                        <h1>This post has no likes.</h1>
                    </div>
                :
                    <>
                        <h1 style={{textAlign: 'center'}}>Post Likes:</h1>
                        <Grid container spacing={2}>
                            {DisplayLikes}
                        </Grid>
                        {
                            likesState.error ?
                                <div style={{marginTop: 10}}>
                                    <h1 style={{color: 'red', textAlign: 'center'}}>An error occured. Please try again later.</h1>
                                    <h3 style={{color: 'red', textAlign: 'center'}}>{likesState.error?.response?.data?.error || String(likesState.error)}</h3>
                                    <Box sx={{mt: 3, display: 'flex', justifyContent: 'center'}}>
                                        <Button color='error' onClick={loadLikes}>Retry</Button>
                                    </Box>
                                </div>
                            : likesState.loading ?
                                <Box sx={{display: 'flex', justifyContent: 'center', mt: 3, mb: 3}}>
                                    <CircularProgress/>
                                </Box>
                            : likesState.noMoreLikes ?
                                <h3 style={{marginTop: 10, textAlign: 'center'}}>No more likes to show</h3>
                            :
                                <Box sx={{mt: 3, display: 'flex', justifyContent: 'center', mb: 3}}>
                                    <Button onClick={loadLikes}>Load More</Button>
                                </Box>
                        }
                    </>
            }
        </div>
    )
}

export default PostLikeCount;