import React, {useContext, useRef, useEffect} from 'react';
import { Grid } from '@mui/material';
import { DarkModeContext } from '../context/DarkModeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons';
import { faHeart as fasHeart } from '@fortawesome/free-solid-svg-icons';
import Button from '@mui/material/Button'
import axios from 'axios';
import { ServerUrlContext } from '../context/ServerUrlContext';
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem';
import useSharedCode from '../hooks/useSharedCode';

const ImagePost = ({title, body, datePosted, image, previewImage, liked, publicId, postId, dispatch, userId, previewMode, profileName, profileImage, contextMenuPostId, contextMenuAnchorElement}) => {
    const {darkMode, setDarkMode} = useContext(DarkModeContext)
    const changingLikeStatus = useRef(false)
    const deleting = useRef(false)
    const {serverUrl, setServerUrl} = useContext(ServerUrlContext)
    const NetworkRequestController = new AbortController();
    const open = previewMode ? false : contextMenuPostId === postId
    const { calculateDifferenceBetweenNowAndUTCMillisecondsTime } = useSharedCode()

    const toggleLike = () => {
        if (!previewMode && changingLikeStatus.current === false) {
            if (liked) {
                //Unlike the post
                changingLikeStatus.current = true
                axios.post(`${serverUrl}/user/unlikeImagePost`, {publicId, postId}, {signal: NetworkRequestController.signal}).then(() => {
                    changingLikeStatus.current = false
                    dispatch({type: 'unlikePost', postId: postId})
                }).catch(error => {
                    alert(error?.response?.data?.error || String(error))
                    changingLikeStatus.current = false
                })
            } else {
                //Like the post
                changingLikeStatus.current = true
                axios.post(`${serverUrl}/user/likeImagePost`, {publicId, postId}, {signal: NetworkRequestController.signal}).then(() => {
                    changingLikeStatus.current = false
                    dispatch({type: 'likePost', postId: postId})
                }).catch(error => {
                    alert(error?.response?.data?.error || String(error))
                    changingLikeStatus.current = false
                })
            }
        }
    }

    const deletePost = () => {
        if (deleting.current === false && !previewMode) {
            deleting.current = true;
            axios.delete(`${serverUrl}/user/imagePost`, {data: {userId, postId}, signal: NetworkRequestController.signal}).then(() => {
                deleting.current = false;
                dispatch({type: 'deletePost', postId})
            }).catch(error => {
                alert(error?.response?.data?.error || String(error))
                deleting.current = false
            })
        }
    }

    useEffect(() => {
        return () => {
            //When the component gets unloaded, abort any network requests that haven't completed yet
            NetworkRequestController.abort();
        }
    }, [])

    const handleContextMenuOpen = (event) => {
        dispatch({type: 'openContextMenu', postId: postId, anchorElement: event.currentTarget})
    }

    const handleContextMenuClose = () => {
        dispatch({type: 'closeContextMenu'})
    }

    return (
        <Grid item xs={12} md={6} lg={4} xl={3}>
            <div style={{border: `1px solid ${darkMode ? 'white' : 'black'}`, maxHeight: '100%', padding: 10}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row'}}>
                    <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row'}}>
                        <img src={profileImage} alt={`Profile Image for user ${profileName}`} style={{width: 50, height: 50, borderRadius: '50%', marginRight: 10}}/>
                        <h3>{profileName}</h3>
                    </div>
                    <div>
                        <Button
                            id={`${postId}-imagepost-context-menu-button`}
                            aria-controls={open ? `${postId}-imagepost-context-menu` : undefined}
                            aria-haspopup="true"
                            aria-expanded={open ? 'true' : undefined}
                            onClick={handleContextMenuOpen}
                        >
                            <i className="fa-solid fa-ellipsis" style={{fontSize: 20, cursor: 'pointer'}}></i>
                        </Button>
                    </div>
                </div>
                <Menu
                    id={`${postId}-imagepost-context-menu`}
                    anchorEl={contextMenuAnchorElement}
                    open={open}
                    onClose={handleContextMenuClose}
                    MenuListProps={{
                    'aria-labelledby': `${postId}-imagepost-context-menu-button`,
                    }}
                >
                    <MenuItem onClick={() => alert('Coming soon')}>Edit (Coming Soon)</MenuItem>
                    <MenuItem onClick={deletePost}>Delete</MenuItem>
                </Menu>
                <h1 style={{wordBreak: 'break-all'}}>{title}</h1>
                <p style={{wordBreak: 'break-all'}}>{body}</p>
                <img src={previewImage ? previewImage : image} style={{maxHeight: '100%', maxWidth: '100%'}}/>
                <br/>
                <FontAwesomeIcon 
                    icon={liked ? fasHeart : farHeart}
                    style={{color: liked ? 'red' : darkMode ? 'white' : 'black', cursor: 'pointer', fontSize: 30}}
                    onClick={toggleLike}
                />
                <h4 style={{marginTop: 10, marginBottom: 5}}>Posted {calculateDifferenceBetweenNowAndUTCMillisecondsTime(datePosted)}</h4>
            </div>
        </Grid>
    )
}

export default ImagePost;