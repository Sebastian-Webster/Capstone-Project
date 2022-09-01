import React, {useContext, useRef, useEffect} from 'react';
import { Grid } from '@mui/material';
import { DarkModeContext } from '../context/DarkModeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons';
import { faHeart as fasHeart } from '@fortawesome/free-solid-svg-icons';
import Button from '@mui/material/Button'
import axios from 'axios';

const TextPost = ({title, body, datePosted, liked, publicId, postId, dispatch, userId, editMode}) => {
    const {darkMode, setDarkMode} = useContext(DarkModeContext);
    const changingLikeStatus = useRef(false)
    const deleting = useRef(false)
    const NetworkRequestController = new AbortController();

    const toggleLike = () => {
        if (liked) {
            //Unlike the post
            changingLikeStatus.current = true
            axios.post('http://localhost:8080/user/unlikeTextPost', {publicId, postId}, {signal: NetworkRequestController.signal}).then(() => {
                changingLikeStatus.current = false
                dispatch({type: 'unlikePost', postId: postId})
            }).catch(error => {
                alert(error?.response?.data?.error || String(error))
                changingLikeStatus.current = false
            })
        } else {
            //Like the post
            changingLikeStatus.current = true
            axios.post('http://localhost:8080/user/likeTextPost', {publicId, postId}, {signal: NetworkRequestController.signal}).then(() => {
                changingLikeStatus.current = false
                dispatch({type: 'likePost', postId: postId})
            }).catch(error => {
                alert(error?.response?.data?.error || String(error))
                changingLikeStatus.current = false
            })
        }
    }

    const deletePost = () => { //Self-destruct :-)
        if (deleting.current === false) {
            deleting.current = true;
            axios.delete('http://localhost:8080/user/textPost', {data: {userId, postId}, signal: NetworkRequestController.signal}).then(() => {
                deleting.current = false;
                dispatch({type: 'deletePost', postId})
            }).catch(error => {
                alert(error?.response?.data?.error || String(error))
                deleting.current = false
            })
        }
    }

    const editPost = () => {
        dispatch({type: 'turnOnEditMode', postId})
    }

    const revertEdits = () => {
        dispatch({type: 'turnOffEditMode', postId})
    }

    const saveEdits = () => {
        alert('Coming soon')
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
                <h1>{title}</h1>
                <p>{body}</p>
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