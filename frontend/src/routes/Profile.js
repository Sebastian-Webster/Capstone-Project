import React, {useContext, useState, useEffect, useMemo, Fragment, useReducer, useRef} from 'react';
import { CredentialsContext } from '../context/CredentialsContext';
import useComponent from '../hooks/useComponent';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import axios from 'axios';
import TextPost from '../components/TextPost';
import Grid from '@mui/material/Grid'
import ImagePost from '../components/ImagePost';
import { defaultPfp } from '../constants';
import { useFilePicker } from 'use-file-picker';
import { DarkModeContext } from '../context/DarkModeContext';
import { ServerUrlContext } from '../context/ServerUrlContext';
import useColorScheme from '../hooks/useColorScheme';
import { useParams, useNavigate } from 'react-router-dom';
import FollowButton from '../components/FollowButton';

var _ = require('lodash')

const Profile = () => {
    const {storedCredentials, setStoredCredentials} = useContext(CredentialsContext)
    const { FlexRowCentreDiv, FlexColumnCentreDiv, FlexRowSpaceAroundDiv, H3NoMargin } = useComponent()
    const {name, followers, following, profileImageUri, _id, publicId} = storedCredentials;
    const [view, setView] = useState('textPosts')
    const [openProfileImageFileSelector, { plainFiles: profileImageToUpload, loading: profileImageFileLoading}] = useFilePicker({accept: 'image/jpeg', multiple: false})
    const [profileImageUploading, setProfileImageUploading] = useState(false);
    const {darkMode, setDarkMode} = useContext(DarkModeContext);
    const {serverUrl, setServerUrl} = useContext(ServerUrlContext)
    const colors = useColorScheme()
    const {publicId : profilePublicId} = useParams()
    const [profileData, setProfileData] = useState(null)
    const [loadingProfile, setLoadingProfile] = useState(profilePublicId ? true : false)
    const [errorLoadingProfile, setErrorLoadingProfile] = useState(null)
    const followingOrUnfollowing = useRef(false)
    const [isFollowing, setIsFollowing] = useState(null)
    const navigate = useNavigate()

    //Set to followers.length if you are visitng your own profile page via the profile button.
    //Set to followers.length if you are visitng your own profile page via the search page.
    //Set to 0 if you are visiting someone else's profile as loadPublicProfileInformation() will get the amount of followers and set followerNumber to that.
    const [followerNumber, setFollowerNumber] = useState(profilePublicId ? profilePublicId === publicId ? followers.length : 0 : followers.length)

    useEffect(() => {
        setFollowerNumber(
            profilePublicId ? 
                profileData === null ?
                    'Loading...'
                :
                    profileData.isFollowing ? 
                        isFollowing ? 
                            profileData.followers 
                        : 
                            profileData.followers - 1 
                    : 
                        isFollowing ? 
                            profileData.followers + 1 
                        : 
                            profileData.followers 
            : 
                followers.length
        )
    }, [profilePublicId, profileData, isFollowing])

    const loadPublicProfileInformation = () => {
        setLoadingProfile(true)
        setErrorLoadingProfile(null)
        axios.get(`${serverUrl}/user/publicProfileInformation/${profilePublicId}/${publicId}`)
        .then(response => response.data.data)
        .then(async result => {
            if (result.profileImageKey) {
                const imageData = (await axios.get(`${serverUrl}/image/${result.profileImageKey}`)).data
                result.profileImageUri = 'data:image/jpeg;base64,' + imageData
            } else result.profileImageUri = defaultPfp
            setLoadingProfile(false)
            setErrorLoadingProfile(null)
            setProfileData(result)
            setIsFollowing(result.isFollowing)
            setFollowerNumber(result.followers)
            console.log(result)
        })
        .catch(error => {
            setLoadingProfile(false)
            setErrorLoadingProfile(error)
            console.error(error)
            setProfileData(null)
        })
    }

    useEffect(() => {
        if (profilePublicId) loadPublicProfileInformation()
    }, [profilePublicId])

    const textPostReducer = (state, action) => {
        switch(action.type) {
            case 'error':
                console.error(action.error)
                return {...state, error: action.error, loading: false}
            case 'nowLoading':
                return {...state, loading: true, error: null}
            case 'addPosts':
                console.log(action.result)
                if (Array.isArray(action.result) && action.result.length > 0) {
                    const newTextPosts = Array.isArray(state.posts) ? _.cloneDeep(state.posts) : []
                    newTextPosts.push(...action.result)
                    return {...state, posts: newTextPosts, loading: false, error: null}
                } else return Array.isArray(state.posts) ? {...state, posts: [...action.result, ...state.posts], loading: false, error: null} : {...state, posts: [], loading: false}
            case 'likePost':
                const likePostIndex = state.posts.findIndex(item => item.postId === action.postId)
                if (likePostIndex === -1) {
                    alert('Cannot find post to like')
                    return {...state}
                }

                const newPostsAfterLike = state.posts;
                newPostsAfterLike[likePostIndex].liked = true;
                
                return {...state, posts: newPostsAfterLike, reRenderTimes: state.reRenderTimes + 1}
            case 'unlikePost':
                const unlikePostIndex = state.posts.findIndex(item => item.postId === action.postId)
                if (unlikePostIndex === -1) {
                    alert('Cannot find post to unlike')
                    return {...state}
                }
                
                const newPostsAfterUnlike = state.posts;
                newPostsAfterUnlike[unlikePostIndex].liked = false;
                
                return {...state, posts: newPostsAfterUnlike, reRenderTimes: state.reRenderTimes + 1}
            case 'deletePost':
                const deletePostIndex = state.posts.findIndex(item => item.postId === action.postId)
                if (deletePostIndex === -1) {
                    alert('Cannot find post to delete')
                    return {...state}
                }

                const newPostsAfterDelete = state.posts;
                newPostsAfterDelete.splice(deletePostIndex, 1)

                return {...state, posts: newPostsAfterDelete, reRenderTimes: state.reRenderTimes + 1}
            case 'turnOnEditMode':
                const turnOnEditIndex = state.posts.findIndex(item => item.postId === action.postId)
                if (turnOnEditIndex === -1) {
                    alert('Cannot find post to edit')
                    return {...state}
                }

                const newPostsAfterTurningEditModeOn = state.posts;
                newPostsAfterTurningEditModeOn[turnOnEditIndex].editMode = true;
                return {...state, posts: newPostsAfterTurningEditModeOn, reRenderTimes: state.reRenderTimes + 1}
            case 'turnOffEditMode':
                const turnOffEditIndex = state.posts.findIndex(item => item.postId === action.postId)
                if (turnOffEditIndex === -1) {
                    alert('Cannot find post to edit')
                    return {...state}
                }

                const newPostsAfterTurningEditModeOff = state.posts;
                newPostsAfterTurningEditModeOff[turnOffEditIndex].editMode = false;
                return {...state, posts: newPostsAfterTurningEditModeOff, reRenderTimes: state.reRenderTimes + 1}
            default:
                throw new Error((action.type + ' is not a valid action for textPostReducer'))
        }
    }
    
    const textPostReducerInitialState = {
        posts: null,
        error: null,
        loading: false,
        reRenderTimes: 0
    }
    
    const imagePostReducer = (state, action) => {
        switch(action.type) {
            case 'error':
                console.error(action.error)
                return {...state, error: action.error, loading: false}
            case 'nowLoading':
                return {...state, loading: true, error: null}
            case 'addPosts':
                console.log(action.result)
                if (Array.isArray(action.result) && action.result.length > 0) {
                    const newTextPosts = Array.isArray(state.posts) ? _.cloneDeep(state.posts) : []
                    newTextPosts.push(...action.result)
                    return {...state, posts: newTextPosts, loading: false, error: null}
                } else return Array.isArray(state.posts) ? {...state, posts: [...action.result, ...state.posts], loading: false, error: null} : {...state, posts: [], loading: false}
            case 'likePost':
                const likePostIndex = state.posts.findIndex(item => item.postId === action.postId)
                if (likePostIndex === -1) {
                    alert('Cannot find post to like')
                    return
                }

                const newPostsAfterLike = state.posts;
                newPostsAfterLike[likePostIndex].liked = true;
                
                return {...state, posts: newPostsAfterLike, reRenderTimes: state.reRenderTimes + 1}
            case 'unlikePost':
                const unlikePostIndex = state.posts.findIndex(item => item.postId === action.postId)
                if (unlikePostIndex === -1) {
                    alert('Cannot find post to like')
                    return
                }
                
                const newPostsAfterUnlike = state.posts;
                newPostsAfterUnlike[unlikePostIndex].liked = false;
                
                return {...state, posts: newPostsAfterUnlike, reRenderTimes: state.reRenderTimes + 1}
            case 'deletePost':
                const deletePostIndex = state.posts.findIndex(item => item.postId === action.postId)
                if (deletePostIndex === -1) {
                    alert('Cannot find post to delete')
                    return {...state}
                }

                const newPostsAfterDelete = state.posts;
                newPostsAfterDelete.splice(deletePostIndex, 1)

                return {...state, posts: newPostsAfterDelete, reRenderTimes: state.reRenderTimes + 1}
            case 'turnOnEditMode':
                const turnOnEditIndex = state.posts.findIndex(item => item.postId === action.postId)
                if (turnOnEditIndex === -1) {
                    alert('Cannot find post to edit')
                    return {...state}
                }

                const newPostsAfterTurningEditModeOn = state.posts;
                newPostsAfterTurningEditModeOn[turnOnEditIndex].editMode = true;
                return {...state, posts: newPostsAfterTurningEditModeOn, reRenderTimes: state.reRenderTimes + 1}
            case 'turnOffEditMode':
                const turnOffEditIndex = state.posts.findIndex(item => item.postId === action.postId)
                if (turnOffEditIndex === -1) {
                    alert('Cannot find post to edit')
                    return {...state}
                }

                const newPostsAfterTurningEditModeOff = state.posts;
                newPostsAfterTurningEditModeOff[turnOffEditIndex].editMode = false;
                return {...state, posts: newPostsAfterTurningEditModeOff, reRenderTimes: state.reRenderTimes + 1}
            default:
                throw new Error((action.type + ' is not a valid action for textPostReducer'))
        }
    }
    
    const imagePostReducerInitialState = {
        posts: null,
        error: null,
        loading: false,
        reRenderTimes: 0
    }

    const [textPostState, dispatchTextPostUpdate] = useReducer(textPostReducer, textPostReducerInitialState)
    const [imagePostState, dispatchImagePostUpdate] = useReducer(imagePostReducer, imagePostReducerInitialState)

    const loadPosts = {
        textPosts: () => {
            if (textPostState.loading === false) {
                dispatchTextPostUpdate({type: 'nowLoading'})

                axios.get(`${serverUrl}/user/textPostsByUserName/?username=${profilePublicId ? profileData.name : name}&skip=${Array.isArray(textPostState.posts) ? textPostState.posts.length : 0}&publicId=${publicId}`)
                .then(response => response.data.data)
                .then(result => {
                    dispatchTextPostUpdate({
                        type: 'addPosts',
                        result
                    })
                })
                .catch(error => {
                    dispatchTextPostUpdate({
                        type: 'error',
                        error: error?.response?.data?.error || String(error)
                    })
                })
            }
        },
        imagePosts: () => {
            if (imagePostState.loading === false) {
                dispatchImagePostUpdate({type: 'nowLoading'})

                axios.get(`${serverUrl}/user/imagePostsByUserName/?username=${profilePublicId ? profileData.name : name}&skip=${Array.isArray(imagePostState.posts) ? imagePostState.posts.length : 0}&publicId=${publicId}`)
                .then(response => response.data.data)
                .then(async (result) => {
                    const posts = []
                    for (const post of result) {
                        const imageData = (await axios.get(`${serverUrl}/image/${post.imageKey}`)).data
                        post.image = 'data:image/jpeg;base64,' + imageData
                        posts.push(post)
                    }
                    dispatchImagePostUpdate({
                        type: 'addPosts',
                        result: posts
                    })
                }).catch(error => {
                    dispatchImagePostUpdate({
                        type: 'error',
                        error: error?.response?.data?.error || String(error)
                    })
                })
            }
        }
    }

    useEffect(() => {
        if (!profilePublicId || profileData !== null) {
            loadPosts.textPosts()
        }
    }, [profilePublicId, profileData])

    const handleViewChange = (event, nextView) => {
        if (nextView !== view && nextView !== null) {
            setView(nextView)
            if (nextView === 'textPosts' && textPostState.posts === null) loadPosts.textPosts()
            if (nextView === 'imagePosts' && imagePostState.posts === null) loadPosts.imagePosts()
        }
        if (nextView === null) {
            loadPosts[view]();
        }
    }

    const DisplayTextPosts = useMemo(() => {
        return Array.isArray(textPostState.posts) ? textPostState.posts.map((post, index) => (
            <Fragment key={index.toString()}>
                <TextPost {...post} publicId={publicId} dispatch={dispatchTextPostUpdate} userId={_id} profileName={name} profileImage={profilePublicId ? profileData.profileImageUri : profileImageUri}/>
            </Fragment>
        )) : null
    }, [textPostState.posts, textPostState.reRenderTimes])

    const DisplayImagePosts = useMemo(() => {
        return Array.isArray(imagePostState.posts) ? imagePostState.posts.map((post, index) => (
            <Fragment key={index.toString()}>
                <ImagePost {...post} publicId={publicId} dispatch={dispatchImagePostUpdate} userId={_id}/>
            </Fragment>
        )) : null
    }, [imagePostState.posts, imagePostState.reRenderTimes])

    useEffect(() => {
        console.log(profileImageToUpload[0])
        if (profileImageToUpload[0]) {
            setProfileImageUploading(true)
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
                    setProfileImageUploading(false)
                })
                .catch(error => {
                    alert('Error uploading profile image: ' + (error?.response?.data?.error || String(error)))
                    console.error(error)
                    setProfileImageUploading(false)
                })
            }

            const handleError = (error) => {
                console.error(error)
                alert('Error processing profile image: ' + String(error))
                setProfileImageUploading(false)
            }

            reader.onabort = handleError
            reader.onerror = handleError

            reader.readAsDataURL(file);
        }
    }, [profileImageToUpload])

    const handleFollowButtonPress = () => {
        if (profileData !== null) {
            if (!followingOrUnfollowing.current) {
                followingOrUnfollowing.current = true;
                if (!isFollowing) {
                    const toSend = {
                        followerId: _id,
                        userToFollowPublicId: profileData.publicId
                    }

                    axios.post(`${serverUrl}/user/followUser`, toSend).then(result => {
                        setIsFollowing(true)
                        followingOrUnfollowing.current = false;
                        console.log(result?.data?.message)
                    }).catch(error => {
                        console.error(error)
                        alert(error?.response?.data?.error || String(error))
                        followingOrUnfollowing.current = false;
                    })
                } else {
                    const toSend = {
                        followerId: _id,
                        userToUnfollowPublicId: profileData.publicId
                    }

                    axios.post(`${serverUrl}/user/unfollowUser`, toSend).then(result => {
                        setIsFollowing(false)
                        followingOrUnfollowing.current = false;
                        console.log(result?.data?.message)
                    }).catch(error => {
                        console.error(error)
                        alert(error?.response?.data?.error || String(error))
                        followingOrUnfollowing.current = false;
                    })
                }
            }
        } else {
            alert('profileData is null. Cannot follow user.')
            console.error('profileData is null. Cannot follow user.')
        }
    }

    return (
        <>
            {errorLoadingProfile ?
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column'}}>
                    <h1 style={{color: 'red'}}>An error occured while loading the profile. Please check your internet connection and try again later.</h1>
                    <Box sx={{mt: 3}}>
                        <Button variant="outlined" color="error" onClick={loadPublicProfileInformation}>Retry</Button>
                    </Box>
                </div>
            : loadingProfile ?
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column'}}>
                    <h1>Loading profile...</h1>
                    <Box sx={{mt: 3}}>
                        <CircularProgress/>
                    </Box>
                </div>
            :
                <>
                    <FlexRowSpaceAroundDiv>
                        <FlexRowCentreDiv>
                            <h1>{profilePublicId ? profileData.name : name}</h1>
                            {profileImageUploading || profileImageFileLoading ?
                                <Box sx={{display: 'flex', justifyContent: 'center', width: 40, height: 40, marginLeft: 1}}>
                                    <CircularProgress/>
                                </Box>
                            :
                                <div style={{height: 50, width: 50, marginLeft: 10, cursor: 'pointer', border: `2px solid ${colors.tertiary}`, borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2}} onClick={() => profilePublicId ? null : openProfileImageFileSelector()}>
                                    <img src={profilePublicId ? profileData.profileImageUri : profileImageUri} style={{width: 50, height: 50, borderRadius: '50%'}} alt='Profile Image'/>
                                </div>
                            }
                            {profilePublicId && profilePublicId !== publicId && <FollowButton following={isFollowing} followBack={profileData.isFollower} onPress={handleFollowButtonPress} extraStyles={{marginLeft: 10}}/>}
                        </FlexRowCentreDiv>
                        <FlexColumnCentreDiv style={{cursor: 'pointer'}} onClick={() => profilePublicId && profilePublicId !== publicId ? navigate(`/followers/${profilePublicId}/${profileData.name}`) : navigate('/followers')}>
                            <H3NoMargin>{followerNumber}</H3NoMargin>
                            <H3NoMargin>{followerNumber === 1 ? 'Follower' : 'Followers'}</H3NoMargin>
                        </FlexColumnCentreDiv>
                        <FlexColumnCentreDiv style={{cursor: 'pointer'}} onClick={() => profilePublicId && profilePublicId !== publicId ? navigate(`/following/${profilePublicId}/${profileData.name}`) : navigate('/following')}>
                            <H3NoMargin>{profilePublicId ? profileData.following : following.length}</H3NoMargin>
                            <H3NoMargin>Following</H3NoMargin>
                            {profilePublicId && profileData.isFollower && <H3NoMargin>({profileData.name} follows you)</H3NoMargin>}
                        </FlexColumnCentreDiv>
                    </FlexRowSpaceAroundDiv>
                    <ToggleButtonGroup
                        color="primary"
                        value={view}
                        exclusive
                        onChange={handleViewChange}
                        fullWidth
                        sx={{mb: 3}}
                    >
                        <ToggleButton value="textPosts" sx={{color: darkMode ? 'white' : 'black', borderColor: darkMode ? 'white' : 'black'}}>Text Posts</ToggleButton>
                        <ToggleButton value="imagePosts" sx={{color: darkMode ? 'white' : 'black', borderColor: darkMode ? 'white' : 'black'}}>Image Posts</ToggleButton>
                    </ToggleButtonGroup>
                    {view === 'textPosts' ?
                        <>
                            {
                                textPostState.error ?
                                    <h1 style={{color: 'red', textAlign: 'center'}}>{textPostState.error}</h1>
                                : textPostState.loading ?
                                    <Box sx={{display: 'flex', justifyContent: 'center', mt: 3}}>
                                        <CircularProgress/>
                                    </Box>
                                : Array.isArray(textPostState.posts) && textPostState.posts.length === 0 ?
                                    <h1 style={{textAlign: 'center'}}>{profilePublicId ? profileData.name : name} has no text posts.</h1>
                                :
                                    <Grid container spacing={2}>
                                        {DisplayTextPosts}
                                    </Grid>
                            }
                        </>
                    : view === 'imagePosts' ?
                        <>
                            {
                                imagePostState.error ?
                                    <h1 style={{color: 'red', textAlign: 'center'}}>{imagePostState.error}</h1>
                                : imagePostState.loading ? 
                                    <Box sx={{display: 'flex', justifyContent: 'center', mt: 3}}>
                                        <CircularProgress/>
                                    </Box>
                                : Array.isArray(imagePostState.posts) && imagePostState.posts.length === 0 ?
                                    <h1 style={{textAlign: 'center'}}>{profilePublicId ? profileData.name : name} has no image posts.</h1>
                                :
                                    <Grid container spacing={2}>
                                        {DisplayImagePosts}
                                    </Grid>
                            }
                        </>
                    : <h1>Pretty big error occured</h1>}
                </>
            }
        </>
    )
}

export default Profile;