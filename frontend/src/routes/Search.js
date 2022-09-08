import React, {useEffect, useContext, useReducer, useMemo, Fragment} from "react";
import useColorScheme from "../hooks/useColorScheme";
import useInput from "../hooks/useInput";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import axios from "axios";
import { ServerUrlContext } from "../context/ServerUrlContext";
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import ProfileItem from "../components/ProfileItem";


const profilesReducer = (state, action) => {
    switch(action.type) {
        case 'startLoading':
            return {...state, loading: true, error: null}
        case 'errorOccured':
            return {...state, loading: false, error: action.error}
        case 'addProfiles':
            const profilesToDisplay = action.replace ? action.profiles : Array.isArray(state.profiles) ? [...state.profiles, ...action.profiles] : action.profiles
            return {...state, loading: false, error: null, profiles: profilesToDisplay}
        case 'resetProfiles':
            return {...state, loading: false, error: null, profiles: null}
        default:
            throw new Error(`${action.type} is not a valid type for profilesReducer`)
    }
}

const profilesInitialState = {
    profiles: null,
    error: null,
    loading: false
}


const Search = () => {
    const colors = useColorScheme()
    const [searchQuery, bindSearchQuery] = useInput('', 'searchQuery', 'standard', {width: '60vw', height: 60, fontSize: 20, paddingLeft: 70, borderRadius: 30, paddingRight: 20})
    const {serverUrl, setServerUrl} = useContext(ServerUrlContext)
    const [profileState, dispatchProfiles] = useReducer(profilesReducer, profilesInitialState)

    useEffect(() => {
        let searchQueryTrimmed;
        if (typeof searchQuery === 'string') {
            searchQueryTrimmed = searchQuery.trim()
        }
        if (typeof searchQueryTrimmed === 'string' && searchQueryTrimmed.length > 0) {
            dispatchProfiles({type: 'startLoading'})
            axios.get(`${serverUrl}/user/searchProfilesByName/${searchQuery}`).then(response => response.data.data)
            .then(async (result) => {
                console.log(result)
                const profiles = []
                for (const profile of result) {
                    if (profile.profileImageKey) {
                        const imageData = (await axios.get(`${serverUrl}/image/${profile.profileImageKey}`)).data
                        profile.profileImage = 'data:image/jpeg;base64,' + imageData
                        profiles.push(profile)
                    } else {
                        profiles.push(profile)
                    }
                }
                console.log(profiles)
                dispatchProfiles({type: 'addProfiles', profiles, replace: true})
            }).catch(error => {
                console.error(error)
                dispatchProfiles({type: 'errorOccured', error: error?.response?.data?.error || error.toString()})
            })
        } else {
            dispatchProfiles({type: 'resetProfiles'})
        }
    }, [searchQuery])

    const displayProfiles = useMemo(() => {
        return Array.isArray(profileState.profiles) ? profileState.profiles.map((profile, index) => (
            <Fragment key={index.toString()}>
                <ProfileItem name={profile.name} followers={profile.followers} following={profile.following} profileImage={profile.profileImage} publicId={profile.publicId}/>
            </Fragment>
        )) : null
    }, [profileState.profiles])

    return (
        <div style={{display: 'flex', justifyContent: 'center', width: '100%', flexDirection: 'column', alignItems: 'center'}}>
            <div style={{marginTop: 15, width: '60vw', height: 60, position: 'relative'}}>
                <FontAwesomeIcon icon={faMagnifyingGlass} style={{color: colors.tertiary, fontSize: 40, position: 'absolute', top: 14, left: 20}}/>
                <input {...bindSearchQuery} autoFocus/>
            </div>
            <div style={{minHeight: 20, maxHeight: 20}}/>
            {
                profileState.error ?
                    <h1 style={{color: 'red', textAlign: 'center'}}>{profileState.error}</h1>
                : profileState.loading ?
                    <Box sx={{display: 'flex', justifyContent: 'center', mt: 3}}>
                        <CircularProgress/>
                    </Box>
                : Array.isArray(profileState.profiles) ?
                    profileState.profiles.length > 0 ?
                        <Grid container spacing={6}>
                            {displayProfiles}
                        </Grid>
                    :
                        <h1 style={{textAlign: 'center'}}>No profiles found.</h1>
                : null
            }
        </div>
    )
}

export default Search;