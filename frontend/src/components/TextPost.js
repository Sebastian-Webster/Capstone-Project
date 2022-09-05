import React, {useContext, useRef, useEffect} from 'react';
import { Grid } from '@mui/material';
import { DarkModeContext } from '../context/DarkModeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons';
import { faHeart as fasHeart } from '@fortawesome/free-solid-svg-icons';
import Button from '@mui/material/Button'
import axios from 'axios';
import { ServerUrlContext } from '../context/ServerUrlContext';

const TextPost = ({title, body, datePosted, liked, publicId, postId, dispatch, userId, editMode, previewMode}) => {
    const {darkMode, setDarkMode} = useContext(DarkModeContext);
    const changingLikeStatus = useRef(false)
    const deleting = useRef(false)
    const {serverUrl, setServerUrl} = useContext(ServerUrlContext)
    const NetworkRequestController = new AbortController();

    const toggleLike = () => {
        if (!previewMode) {
            if (liked) {
                //Unlike the post
                changingLikeStatus.current = true
                axios.post(`${serverUrl}/user/unlikeTextPost`, {publicId, postId}, {signal: NetworkRequestController.signal}).then(() => {
                    changingLikeStatus.current = false
                    dispatch({type: 'unlikePost', postId: postId})
                }).catch(error => {
                    alert(error?.response?.data?.error || String(error))
                    changingLikeStatus.current = false
                })
            } else {
                //Like the post
                changingLikeStatus.current = true
                axios.post(`${serverUrl}/user/likeTextPost`, {publicId, postId}, {signal: NetworkRequestController.signal}).then(() => {
                    changingLikeStatus.current = false
                    dispatch({type: 'likePost', postId: postId})
                }).catch(error => {
                    alert(error?.response?.data?.error || String(error))
                    changingLikeStatus.current = false
                })
            }
        }
    }

    const deletePost = () => { //Self-destruct :-)
        if (!previewMode) {
            if (deleting.current === false) {
                deleting.current = true;
                axios.delete(`${serverUrl}/user/textPost`, {data: {userId, postId}, signal: NetworkRequestController.signal}).then(() => {
                    deleting.current = false;
                    dispatch({type: 'deletePost', postId})
                }).catch(error => {
                    alert(error?.response?.data?.error || String(error))
                    deleting.current = false
                })
            }
        }
    }

    const editPost = () => {
        if (!previewMode) {
            dispatch({type: 'turnOnEditMode', postId})
        }
    }

    const revertEdits = () => {
        if (!previewMode) {
            dispatch({type: 'turnOffEditMode', postId})
        }
    }

    const saveEdits = () => {
        if (!previewMode) {
            alert('Coming soon!')
        }
    }

    useEffect(() => {
        return () => {
            //When the component gets unloaded, abort any network requests that haven't completed yet
            NetworkRequestController.abort();
        }
    }, [])

    return (
        <Grid item xs={12} sm={6} md={4} lg={3} xl={2}>
            <div style={{border: `1px solid ${darkMode ? 'white' : 'black'}`, padding: 10}}>
                <h1 style={{wordBreak: 'break-all'}}>{title}</h1>
                <p style={{wordBreak: 'break-all'}}>{body}</p>
                {editMode ?
                    <>
                        <Button color="error" variant="outlined" sx={{mt: 1, mr: 1}} onClick={revertEdits}>Revert</Button>
                        <Button color="success" variant="outlined" sx={{mt: 1}} onClick={saveEdits}>Save</Button>
                    </>
                :
                    <>
                        <FontAwesomeIcon 
                            icon={liked ? fasHeart : farHeart}
                            style={{color: liked ? 'red' : darkMode ? 'white' : 'black', cursor: 'pointer', fontSize: 30}}
                            onClick={() => {
                                if (changingLikeStatus.current === false) toggleLike()
                            }}
                        />
                        <br/>
                        <Button color="secondary" variant="contained" sx={{mt: 1, mr: 1}} onClick={deletePost}>Delete</Button>
                        <Button color="secondary" variant="contained" sx={{mt: 1}} onClick={editPost}>Edit</Button>
                    </>
                }
            </div>
        </Grid>
    )
}

export default TextPost;