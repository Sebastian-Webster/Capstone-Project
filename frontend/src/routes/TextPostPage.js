import React, {useReducer, useContext, useEffect} from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { ServerUrlContext } from "../context/ServerUrlContext";
import { CredentialsContext } from "../context/CredentialsContext";
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import TextPost from "../components/TextPost";
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import { defaultPfp } from "../constants";

const TextPostPage = () => {
    const {serverUrl, setServerUrl} = useContext(ServerUrlContext)
    const {storedCredentials, setStoredCredentials} = useContext(CredentialsContext)
    const {_id, publicId} = storedCredentials;
    const [queryParams, setQueryParams] = useSearchParams()
    const postId = queryParams.get('postId')
    if (!postId) throw new Error('postId must be provided')

    const postReducer = (state, action) => {
        switch(action.type) {
            case 'startLoading':
                return {...state, error: null, loading: true}
            case 'error':
                return {...state, error: action.error, loading: false}
            case 'addPost':
                return {...state, error: null, loading: false, post: action.post}
            case 'likePost':
                const newPostAfterLike = state.post;
                newPostAfterLike.liked = true;
                newPostAfterLike.likeCount = newPostAfterLike.likeCount + 1;
                
                return {...state, post: newPostAfterLike, reRenderTimes: state.reRenderTimes + 1}
            case 'unlikePost':
                const newPostAfterUnlike = state.post;
                newPostAfterUnlike.liked = false;
                newPostAfterUnlike.likeCount = newPostAfterUnlike.likeCount - 1;
                
                return {...state, post: newPostAfterUnlike, reRenderTimes: state.reRenderTimes + 1}
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
        post: null,
        loading: false,
        error: null,
        reRenderTimes: 0
    }

    const [state, dispatch] = useReducer(postReducer, postInitialState)

    const loadPost = () => {
        dispatch({type: 'startLoading'})
        const url = `${serverUrl}/user/getIndividualTextPost`
        const toSend = {
            postId,
            userId: _id
        }

        axios.post(url, toSend).then(response => response.data.data).then(async result => {
            try {
                console.log(result)
                result.profileImage = result.profileImageKey ? 'data:image/jpeg;base64,' + (await axios.get(`${serverUrl}/image/${result.profileImageKey}`)).data : defaultPfp
                dispatch({type: 'addPost', post: result})
            } catch (error) {
                console.error(error)
                dispatch({type: 'error', error})
            }
        }).catch(error => {
            console.error(error)
            dispatch({type: 'error', error})
        })
    }

    useEffect(loadPost, [])

    return (
        <>
            <Snackbar open={state.linkCopySuccessSnackbarOpen} autoHideDuration={2000} onClose={() => dispatch({type: 'closeLinkCopySuccessSnackbar'})}>
                <Alert severity="success" sx={{ width: '100%' }}>Copied post link to clipboard</Alert>
            </Snackbar>
            <Snackbar open={state.linkCopyFailSnackbarOpen} autoHideDuration={2000} onClose={() => dispatch({type: 'closeLinkCopyFailSnackbar'})}>
                <Alert severity="error" sx={{ width: '100%' }}>{state.linkCopyError}</Alert>
            </Snackbar>
            <div style={{height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
                {state.loading ?
                    <CircularProgress/>
                : state.error ?
                    <>
                        <h1 style={{color: 'red', textAlign: 'center'}}>An error occured:</h1>
                        <h1 style={{color: 'red', textAlign: 'center'}}>{state.error?.response?.data?.error || String(state.error)}</h1>
                        <Box sx={{mt: 3, display: 'flex', justifyContent: 'center'}}>
                            <Button color='error' onClick={loadPost}>Retry</Button>
                        </Box>
                    </>
                : state.post ?
                    <TextPost {...state.post} publicId={publicId} dispatch={dispatch} minWidth={400}/>
                : null}
            </div>
        </>
    )
}

export default TextPostPage