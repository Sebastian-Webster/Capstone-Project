import React, {useContext, useEffect, useReducer, useMemo, useState} from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import useColorScheme from '../hooks/useColorScheme';
import { Link } from 'react-router-dom';
import { CredentialsContext } from '../context/CredentialsContext';
import axios from 'axios';
import { ServerUrlContext } from '../context/ServerUrlContext';
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import Button from '@mui/material/Button'
import ImagePost from '../components/ImagePost';
import TextPost from '../components/TextPost';
import { defaultPfp } from '../constants';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

const Home = () => {
    const following = localStorage.getItem('following')
    const colors = useColorScheme()
    const {storedCredentials, setStoredCredentials} = useContext(CredentialsContext)
    const {_id, publicId} = storedCredentials;
    const {serverUrl, setServerUrl} = useContext(ServerUrlContext)
    const [profilePictures, setProfilePictures] = useState({})
    const [imagePostPictures, setImagePostPictures] = useState({})

    const postReducer = (state, action) => {
        switch(action.type) {
            case 'startLoading':
                return {...state, error: null, loading: true}
            case 'error':
                return {...state, error: action.error, loading: false}
            case 'addPosts':
                return {
                    ...state,
                    error: null,
                    loading: false,
                    posts: state.posts === null ? action.posts : [...state.posts, ...action.posts],
                    //noMorePosts is set to false if no posts have loaded so then if no posts are shown on the first load, there can be a message saying none of the user's followers have any posts.
                    //If there are already posts showing and there aren't any more to show, then this will get set to true so there can be a message telling the user that there are no more posts to see.
                    noMorePosts: state.posts === null ? false : action.posts.length === 0 
                }
            case 'likePost':
                const likePostIndex = state.posts.findIndex(item => item.postId === action.postId)
                if (likePostIndex === -1) {
                    alert('Cannot find post to like')
                    return {...state}
                }

                const newPostsAfterLike = state.posts;
                newPostsAfterLike[likePostIndex].liked = true;
                newPostsAfterLike[likePostIndex].likeCount = newPostsAfterLike[likePostIndex].likeCount + 1;
                
                return {...state, posts: newPostsAfterLike, reRenderTimes: state.reRenderTimes + 1}
            case 'unlikePost':
                const unlikePostIndex = state.posts.findIndex(item => item.postId === action.postId)
                if (unlikePostIndex === -1) {
                    alert('Cannot find post to unlike')
                    return {...state}
                }
                
                const newPostsAfterUnlike = state.posts;
                newPostsAfterUnlike[unlikePostIndex].liked = false;
                newPostsAfterUnlike[unlikePostIndex].likeCount = newPostsAfterUnlike[unlikePostIndex].likeCount - 1;
                
                return {...state, posts: newPostsAfterUnlike, reRenderTimes: state.reRenderTimes + 1}
            case 'openLinkCopySuccessSnackbar':
                return {...state, linkCopySuccessSnackbarOpen: true, linkCopyFailSnackbarOpen: false}
            case 'closeLinkCopySuccessSnackbar':
                return {...state, linkCopySuccessSnackbarOpen: false}
            case 'openLinkCopyFailSnackbar':
                return {...state, linkCopySuccessSnackbarOpen: false, linkCopyFailSnackbarOpen: true, linkCopyError: action.error || 'An error occured while copying link to clipboard'}
            case 'closeLinkCopyFailSnackbar':
                return {...state, linkCopyFailSnackbarOpen: false}
            default:
                throw new Error(`${action.type} is not a valid action type for postReducer`)
        }
    }

    const postInitialState = {
        posts: null,
        loading: false,
        error: null,
        noMorePosts: false,
        reRenderTimes: 0,
        profilePictures: {}
    }

    const [postsState, dispatch] = useReducer(postReducer, postInitialState)

    useEffect(() => {
        loadPosts()
    }, [])

    const loadPosts = () => {
        if (!postsState.loading) {
            dispatch({type: 'startLoading'})
            const url = `${serverUrl}/user/gethomefeed`
            const toSend = {
                userId: _id,
                skip: Array.isArray(postsState.posts) ? postsState.posts.length : 0
            }
            axios.post(url, toSend).then(response => response.data.data).then(result => {
                console.log(result)
                const uniqueProfileImageKeys = Array.from(new Set(result.map(result => result.profileImageKey))).filter(item => item !== '' && !Object.keys(profilePictures).includes(item))
                if (uniqueProfileImageKeys.length > 0) {
                    Promise.all(
                        uniqueProfileImageKeys.map(imageKey => {
                            return new Promise((resolve, reject) => {
                                console.log(imageKey)
                                axios.get(`${serverUrl}/image/${imageKey}`).then(response => response.data).then(resolve).catch(reject)
                            })
                        })
                    ).then(imageArray => {
                        const newProfilePictures = profilePictures;
                        imageArray.forEach((image, index) => {
                            console.log('Image loaded:', index)
                            newProfilePictures[uniqueProfileImageKeys[index]] = 'data:image/jpeg;base64,' + image
                        })
                        setProfilePictures(newProfilePictures)
                        addImagesToPosts(result)
                    }).catch(error => {
                        dispatch({type: 'error', error})
                    })
                } else {
                    addImagesToPosts(result)
                }
            }).catch(error => {
                dispatch({type: 'error', error})
            })
        } else console.log('Not loading as posts are already getting loaded')
    }

    const addImagesToPosts = (posts) => {
        Promise.all(
            posts.map(post => {
                return new Promise(async (resolve, reject) => {
                    if (post.imageKey) {
                        axios.get(`${serverUrl}/image/${post.imageKey}`).then(response => response.data).then(result => {
                            post.image = 'data:image/jpeg;base64,' + result
                            resolve(post)
                        }).catch(reject)
                    } else {
                        resolve(post)
                    }
                })
            })
        ).then(posts => {
            dispatch({type: 'addPosts', posts})
        }).catch(error => {
            dispatch({type: 'error', error})
        })
    }

    const DisplayPosts = useMemo(() => {
        return Array.isArray(postsState.posts) ? postsState.posts.map((post, index) => (
            <div style={{marginTop: 20, marginBottom: 20, minWidth: 400, maxWidth: '50vw'}} key={index.toString()}>
                {post.imageKey ?
                    <ImagePost {...post} publicId={publicId} dispatch={dispatch} userId={_id} profileName={post.name} profileImage={post.profileImageKey === '' ? defaultPfp : profilePictures[post.profileImageKey]} isPostOwner={false}/>
                :
                    <TextPost {...post} publicId={publicId} dispatch={dispatch} userId={_id} profileName={post.name} profileImage={post.profileImageKey === '' ? defaultPfp : profilePictures[post.profileImageKey]} isPostOwner={false}/>
                }
            </div>
        )) : null
    }, [postsState.posts, postsState.reRenderTimes])

    return (
        <>
            <Snackbar open={postsState.linkCopySuccessSnackbarOpen} autoHideDuration={2000} onClose={() => dispatch({type: 'closeLinkCopySuccessSnackbar'})}>
                <Alert severity="success" sx={{ width: '100%' }}>Copied post link to clipboard</Alert>
            </Snackbar>
            <Snackbar open={postsState.linkCopyFailSnackbarOpen} autoHideDuration={2000} onClose={() => dispatch({type: 'closeLinkCopyFailSnackbar'})}>
                <Alert severity="error" sx={{ width: '100%' }}>{postsState.linkCopyError}</Alert>
            </Snackbar>
            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
                {following > 0 ?
                    postsState.posts === null ?
                        postsState.loading ?
                            <Box sx={{display: 'flex', justifyContent: 'center', mt: 3}}>
                                <CircularProgress/>
                            </Box>
                        : postsState.error ?
                            <div style={{marginTop: 20}}>
                                <h1 style={{color: 'red', textAlign: 'center'}}>An error occured. Please try again later.</h1>
                                <h3 style={{color: 'red', textAlign: 'center'}}>{postsState.error?.response?.data?.error || String(postsState.error)}</h3>
                                <Box sx={{mt: 3, display: 'flex', justifyContent: 'center'}}>
                                    <Button color='error' onClick={loadPosts}>Retry</Button>
                                </Box>
                            </div>
                        : null
                    :
                        postsState.posts.length === 0 ?
                            <div style={{marginTop: 20}}>
                                <h1 style={{textAlign: 'center'}}>The people you follow don't have any posts!</h1>
                                <h3 style={{textAlign: 'center'}}>Ask them to post some posts or go to the search screen to find more users to follow!</h3>
                            </div>
                        :
                            <div style={{marginTop: 20}}>
                                {DisplayPosts}
                                {
                                    postsState.error ?
                                        <div style={{marginTop: 10}}>
                                            <h1 style={{color: 'red', textAlign: 'center'}}>An error occured. Please try again later.</h1>
                                            <h3 style={{color: 'red', textAlign: 'center'}}>{postsState.error?.response?.data?.error || String(postsState.error)}</h3>
                                            <Box sx={{mt: 3, display: 'flex', justifyContent: 'center'}}>
                                                <Button color='error' onClick={loadPosts}>Retry</Button>
                                            </Box>
                                        </div>
                                    : postsState.loading ?
                                        <Box sx={{display: 'flex', justifyContent: 'center', mt: 3, mb: 3}}>
                                            <CircularProgress/>
                                        </Box>
                                    : postsState.noMorePosts ?
                                        <h3 style={{marginTop: 10, textAlign: 'center'}}>No more posts to show</h3>
                                    :
                                        <Box sx={{mt: 3, display: 'flex', justifyContent: 'center', mb: 3}}>
                                            <Button onClick={loadPosts}>Load More</Button>
                                        </Box>
                                }
                            </div>
                :
                    <>
                        <h1 style={{textAlign: 'center'}}>Start following some people to see a home feed!</h1>
                        <h3 style={{textAlign: 'center'}}>Press the search icon here or at the top of the screen to find users to follow!</h3>
                        <Link to="/search">
                            <FontAwesomeIcon icon={faMagnifyingGlass} style={{color: 'blue'}}/>
                        </Link>
                    </>
                }
            </div>
        </>
    )
}

export default Home;