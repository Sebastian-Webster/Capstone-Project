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
import { useParams } from 'react-router-dom';

const itemsInitialState = {
    loading: true,
    error: null,
    items: null,
    noMoreItemsToDisplay: false
}

const itemsReducer = (state, action) => {
    switch(action.type) {
        case 'startLoading':
            return {...state, loading: true, error: null}
        case 'doneLoading':
            return {
                ...state,
                loading: false,
                error: null,
                noMoreItemsToDisplay: Array.isArray(state.items) ? state.items.length > 0 && action.items.length === 0 : false,
                items: Array.isArray(state.items) ? [...state.items, ...action.items] : action.items
            }
        case 'error':
            return {...state, loading: false, error: action.error}
        default:
            throw new Error(`${action.type} is not a valid action type for itemsReducer`)
    }
}

const ProfileStats = ({type}) => {
    const {storedCredentials, setStoredCredentials} = useContext(CredentialsContext)
    const {serverUrl, setServerUrl} = useContext(ServerUrlContext)
    const [itemsState, dispatch] = useReducer(itemsReducer, itemsInitialState)
    const {_id, publicId, name} = storedCredentials;
    const sharedCode = useSharedCode();
    const colors = useColorScheme()
    const {FlexColumnCentreDiv} = useComponent()
    const {publicId: profilePublicId, accountName} = useParams()

    if (!type) throw new Error('type must be provided to ProfileStats')
    if (type !== 'followers' && type !== 'following') throw new Error('type must either be followers or following')

    const loadItems = (firstTime) => {
        if (!itemsState.loading || firstTime) {
            dispatch({type: 'startLoading'})
            const skip = Array.isArray(itemsState.items) ? itemsState.items.length : 0

            const toSend = {
                userId: _id,
                profilePublicId: profilePublicId || publicId,
                skip
            }

            axios.post(`${serverUrl}/user/getUser${type === 'followers' ? 'Followers' : 'Following'}`, toSend).then(response => response.data.data).then(result => {
                console.log(type)
                console.log(result)
                Promise.all(result.map(item => axios.post(`${serverUrl}/user/getPublicProfileInformation`, {userId: _id, publicId: item}))).then(profiles => profiles.map(profile => profile.data.data)).then(profiles => {
                    console.log('Profiles:')
                    console.log(profiles)
                    Promise.all(profiles.map(sharedCode.addProfilePictureToProfileObject)).then(profilesWithProfilePictures => {
                        console.log('profilesWithProfilePictures:')
                        console.log(profilesWithProfilePictures)
                        dispatch({type: 'doneLoading', items: profilesWithProfilePictures})
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
    }

    const displayItems = useMemo(() => {
        return Array.isArray(itemsState.items) ? itemsState.items.map((item, index) => (
            <Fragment key={index.toString()}>
                <ProfileItem profileImage={item.profileImageUri} name={item.name} publicId={item.publicId}/>
            </Fragment>
        )) : null
    }, [itemsState.items])

    useEffect(() => {loadItems(true)}, [])

    return (
        <>
            <h1 style={{color: colors.tertiary, textAlign: 'center'}}>{type === 'following' ? ('Users ' + (accountName || name) + ' follows') : ('Users who follow ' + (accountName || name))}</h1>
            {
                Array.isArray(itemsState.items) ?
                    <>
                        {itemsState.items.length === 0 ? (
                            <FlexColumnCentreDiv>
                                <h3 style={{color: colors.tertiary}}>{type === 'followers' ? ('No one follows ' + (accountName || name)) : ((accountName || name) + ' does not follow anyone')}</h3>
                            </FlexColumnCentreDiv>
                        ) : (
                            <FlexColumnCentreDiv>
                                <Grid container spacing={2}>
                                    {displayItems}
                                </Grid>
                                {
                                    itemsState.noMoreItemsToDisplay ?
                                        <h4 style={{color: colors.tertiary}}>No more users.</h4>
                                    : itemsState.loading ?
                                        <Box sx={{mt: 3, display: 'flex', justifyContent: 'center'}}>
                                            <CircularProgress/>
                                        </Box>
                                    : itemsState.error ?
                                        <>
                                            <h1 style={{color: 'red'}}>{itemsState.error.response?.data?.error || itemsState.error.toString()}</h1>
                                            <Box sx={{mt: 3, display: 'flex', justifyContent: 'center'}}>
                                                <Button color='error' onClick={loadItems}>Retry</Button>
                                            </Box>
                                        </>
                                    :
                                        <Box sx={{mt: 3, display: 'flex', justifyContent: 'center'}}>
                                            <Button onClick={loadItems}>Load More</Button>
                                        </Box>
                                }
                            </FlexColumnCentreDiv>
                        )}
                    </>
                :
                    itemsState.loading ?
                        <Box sx={{mt: 3, display: 'flex', justifyContent: 'center'}}>
                            <CircularProgress/>
                        </Box>
                    : itemsState.error ?
                        <>
                            <h1 style={{color: 'red', textAlign: 'center'}}>{itemsState.error.response?.data?.error || itemsState.error.toString()}</h1>
                            <Box sx={{mt: 3, display: 'flex', justifyContent: 'center'}}>
                                <Button color='error' onClick={loadItems}>Retry</Button>
                            </Box>
                        </>
                    :
                        <h1 style={{color: colors.tertiary, textAlign: 'center'}}>Nothing is happening and this is a bug.</h1>
            }
        </>
    )
}

export default ProfileStats;