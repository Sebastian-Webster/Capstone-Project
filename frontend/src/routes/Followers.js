import React, {useReducer, useEffect, useContext, useMemo, Fragment} from 'react';
import axios from 'axios';
import { CredentialsContext } from '../context/CredentialsContext';
import { ServerUrlContext } from '../context/ServerUrlContext';
import useSharedCode from '../hooks/useSharedCode';
import useColorScheme from '../hooks/useColorScheme';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import ProfileItem from '../components/ProfileItem';
import useComponent from '../hooks/useComponent';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';

const followersInitialState = {
    loading: true,
    error: null,
    followers: null,
    noMoreFollowersToDisplay: false
}

const followersReducer = (state, action) => {
    switch(action.type) {
        case 'startLoading':
            return {...state, loading: true, error: null}
        case 'doneLoading':
            return {
                ...state,
                loading: false,
                error: null,
                noMoreFollowersToDisplay: Array.isArray(state.followers) ? state.followers.length > 0 : action.followers.length === 0,
                followers: Array.isArray(state.followers) ? [...state.followers, ...action.followers] : action.followers
            }
        case 'error':
            return {...state, loading: false, error: action.error}
        default:
            throw new Error(`${action.type} is not a valid action type for followersReducer`)
    }
}

const Followers = () => {
    const {storedCredentials, setStoredCredentials} = useContext(CredentialsContext)
    const {serverUrl, setServerUrl} = useContext(ServerUrlContext)
    const [followersState, dispatch] = useReducer(followersReducer, followersInitialState)
    const {_id, publicId, name} = storedCredentials;
    const sharedCode = useSharedCode();
    const colors = useColorScheme()
    const {FlexColumnCentreDiv} = useComponent()

    const loadFollowers = (firstTime) => {
        if (!followersState.loading || firstTime) {
            dispatch({type: 'startLoading'})
            const skip = Array.isArray(followersState.followers) ? followersState.followers.length : 0

            const toSend = {
                userId: _id,
                skip
            }

            axios.post(`${serverUrl}/user/getUserFollowers`, toSend).then(response => response.data.data).then(result => {
                console.log('Followers:')
                console.log(result)
                Promise.all(result.map(item => axios.get(`${serverUrl}/user/publicProfileInformation/${item}/${publicId}`))).then(profiles => profiles.map(profile => profile.data.data)).then(profiles => {
                    console.log('Profiles:')
                    console.log(profiles)
                    Promise.all(profiles.map(sharedCode.addProfilePictureToProfileObject)).then(profilesWithProfilePictures => {
                        console.log('profilesWithProfilePictures:')
                        console.log(profilesWithProfilePictures)
                        dispatch({type: 'doneLoading', followers: profilesWithProfilePictures})
                    })
                })
            }).catch(error => {
                dispatch({type: 'error', error})
                console.error(error)
            })
        }
    }

    const displayFollowers = useMemo(() => {
        return Array.isArray(followersState.followers) ? followersState.followers.map((follower, index) => (
            <Fragment key={index.toString()}>
                <ProfileItem profileImage={follower.profileImageUri} name={follower.name} publicId={follower.publicId}/>
            </Fragment>
        )) : null
    }, [followersState.followers])

    useEffect(() => {loadFollowers(true)}, [])

    return (
        <>
            <h1 style={{color: colors.tertiary, textAlign: 'center'}}>Followers for {name}</h1>
            {
                Array.isArray(followersState.followers) ?
                    <>
                        {followersState.followers.length === 0 ? (
                            <FlexColumnCentreDiv>
                                <h3 style={{color: colors.tertiary}}>No one follows {name}</h3>
                            </FlexColumnCentreDiv>
                        ) : (
                            <FlexColumnCentreDiv>
                                <Grid container spacing={2}>
                                    {displayFollowers}
                                </Grid>
                                {
                                    followersState.noMoreFollowersToDisplay ?
                                        <h4 style={{color: colors.tertiary}}>No more followers.</h4>
                                    : followersState.loading ?
                                        <Box sx={{mt: 3, display: 'flex', justifyContent: 'center'}}>
                                            <CircularProgress/>
                                        </Box>
                                    : followersState.error ?
                                        <>
                                            <h1 style={{color: 'red'}}>{followersState.error.response?.data?.error || followersState.error.toString()}</h1>
                                            <Box sx={{mt: 3, display: 'flex', justifyContent: 'center'}}>
                                                <Button color='error' onClick={loadFollowers}>Retry</Button>
                                            </Box>
                                        </>
                                    :
                                        <Box sx={{mt: 3, display: 'flex', justifyContent: 'center'}}>
                                            <Button onClick={loadFollowers}>Load More</Button>
                                        </Box>
                                }
                            </FlexColumnCentreDiv>
                        )}
                    </>
                :
                    followersState.loading ?
                        <Box sx={{mt: 3, display: 'flex', justifyContent: 'center'}}>
                            <CircularProgress/>
                        </Box>
                    : followersState.error ?
                        <>
                            <h1 style={{color: 'red', textAlign: 'center'}}>{followersState.error.response?.data?.error || followersState.error.toString()}</h1>
                            <Box sx={{mt: 3, display: 'flex', justifyContent: 'center'}}>
                                <Button color='error' onClick={loadFollowers}>Retry</Button>
                            </Box>
                        </>
                    :
                        <h1 style={{color: colors.tertiary, textAlign: 'center'}}>Nothing is happening and this is a bug.</h1>
            }
        </>
    )
}

export default Followers;