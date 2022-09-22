import React, {useContext, useRef, useEffect} from 'react';
import { DarkModeContext } from '../context/DarkModeContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeart as farHeart, faPaste } from '@fortawesome/free-regular-svg-icons';
import { faHeart as fasHeart } from '@fortawesome/free-solid-svg-icons';
import Button from '@mui/material/Button'
import axios from 'axios';
import { ServerUrlContext } from '../context/ServerUrlContext';
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem';
import useInput from '../hooks/useInput';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import useColorScheme from '../hooks/useColorScheme';
import useSharedCode from '../hooks/useSharedCode';
import { useNavigate } from 'react-router-dom'

const TextPost = ({title, body, datePosted, liked, publicId, postId, dispatch, userId, editMode, previewMode, profileImage, profileName, contextMenuPostId, contextMenuAnchorElement, saving, edited, timesEdited, dateEdited, isPostOwner, likeCount, dateMade, disableFunctionality, editNumber, minWidth}) => {
    const {darkMode, setDarkMode} = useContext(DarkModeContext);
    const changingLikeStatus = useRef(false)
    const deleting = useRef(false)
    const {serverUrl, setServerUrl} = useContext(ServerUrlContext)
    const NetworkRequestController = new AbortController();
    const open = previewMode ? false : contextMenuPostId === postId
    const [editedTitle, bindTitle, resetTitle] = useInput(title, 'title', 'standard', {fontSize: 30, maxWidth: '80%', marginTop: 10})
    const [editedBody, bindBody, resetBody] = useInput(body, 'body', 'standard', {fontSize: 18, maxWidth: '90%', marginTop: 10, marginBottom: 10, maxHeight: 300})
    const colors = useColorScheme()
    const { calculateDifferenceBetweenNowAndUTCMillisecondsTime, copyTextToClipboardPromise } = useSharedCode()
    const navigate = useNavigate()

    const toggleLike = () => {
        if (!previewMode && !disableFunctionality) {
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
        if (!previewMode && !disableFunctionality) {
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
            handleContextMenuClose()
        }
    }

    const editPost = () => {
        if (!previewMode && !disableFunctionality) {
            dispatch({type: 'turnOnEditMode', postId})
            handleContextMenuClose()
        }
    }

    const revertEdits = () => {
        if (!previewMode && !disableFunctionality) {
            resetTitle()
            resetBody()
            dispatch({type: 'turnOffEditMode', postId})
        }
    }

    const saveEdits = () => {
        if (!previewMode && !disableFunctionality) {
            dispatch({type: 'savingEdits', postId})
            axios.put(`${serverUrl}/user/textpost`, {userId, postId, newTitle: editedTitle, newBody: editedBody}, {signal: NetworkRequestController.signal}).then(() => {
                dispatch({type: 'editsSaved', postId, newTitle: editedTitle, newBody: editedBody})
            }).catch(error => {
                dispatch({type: 'errorWhileSaving', postId})
                alert(error?.response?.data?.error || String(error))
                console.error(error)
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

    const copyLinkToClipboard = () => {
        const link = `http://${window.location.hostname}/textpost?postId=${postId}`
        copyTextToClipboardPromise(link).then(() => {
            dispatch({type: 'openLinkCopySuccessSnackbar'})
        }).catch(error => {
            console.error(error)
            dispatch({type: 'openLinkCopyFailSnackbar', error: String(error)})
        })
    }

    return (
        <Grid item xs={12} md={6} lg={4} xl={3}>
            <div style={{border: `1px solid ${darkMode ? 'white' : 'black'}`, padding: 10, minWidth}}>
                {saving ?
                    <div style={{height: '100%', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
                        <h2 style={{textAlign: 'center'}}>Saving your masterpiece...</h2>
                        <Box sx={{mt: 2}}>
                            <CircularProgress/>
                        </Box>
                    </div>
                :
                    <>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexDirection: 'row'}}>
                            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row'}}>
                                <img src={profileImage} alt={`Profile Image for user ${profileName}`} style={{width: 50, height: 50, borderRadius: '50%'}}/>
                                <h3 style={{marginLeft: 10}}>{profileName}</h3>
                                {(edited || typeof editNumber === 'number') &&
                                    <div style={{border: `1px solid ${colors.tertiary}`, borderRadius: 20, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '15px 15px', marginLeft: 10, cursor: disableFunctionality ? 'initial' : 'pointer'}} onClick={() => disableFunctionality ? null : navigate(`/historyviewer/${postId}/text`)}>
                                        <p style={{color: colors.tertiary, fontWeight: 'bold', textDecorationColor: colors.tertiary, textDecorationStyle: 'solid', margin: 0, textDecorationThickness: 1, textDecorationLine: disableFunctionality ? 'none' : 'underline'}}>{typeof editNumber === 'number' ? editNumber === 0 ? 'Original Post' : `Edit #${editNumber}` : `Edited ${timesEdited} ${timesEdited === 1 ? 'time' : 'times'}`}</p>
                                    </div>
                                }
                            </div>
                            <div>
                                {isPostOwner &&
                                    <Button
                                        id={`${postId}-context-menu-button`}
                                        aria-controls={open ? `${postId}-context-menu` : undefined}
                                        aria-haspopup="true"
                                        aria-expanded={open ? 'true' : undefined}
                                        onClick={handleContextMenuOpen}
                                    >
                                        <i className="fa-solid fa-ellipsis" style={{fontSize: 20, cursor: 'pointer'}}></i>
                                    </Button>
                                }
                            </div>
                        </div>
                        {isPostOwner &&
                            <Menu
                                id={`${postId}-context-menu`}
                                anchorEl={contextMenuAnchorElement}
                                open={open}
                                onClose={handleContextMenuClose}
                                MenuListProps={{
                                'aria-labelledby': `${postId}-context-menu-button`,
                                }}
                            >
                                <MenuItem onClick={editPost}>Edit</MenuItem>
                                <MenuItem onClick={deletePost}>Delete</MenuItem>
                            </Menu>
                        }
                        {editMode ?
                            <>
                                <input {...bindTitle}/>
                                <br/>
                                <textarea {...bindBody}/>
                                <br/>
                            </>
                        :
                            <>
                                <h1 style={{wordBreak: 'break-all'}}>{title}</h1>
                                <p style={{wordBreak: 'break-all'}}>{body}</p>
                            </>
                        }
                        {editMode ?
                            <>
                                <Button color="error" variant="outlined" sx={{mt: 1, mr: 1}} onClick={revertEdits}>Revert</Button>
                                <Button color="success" variant="outlined" sx={{mt: 1}} onClick={saveEdits}>Save</Button>
                            </>
                        :
                            <>
                                {dateMade || disableFunctionality ? null :
                                    <>
                                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                            <div style={{display: 'flex', justifyContent: 'left', alignItems: 'center'}}>
                                                <FontAwesomeIcon 
                                                    icon={liked ? fasHeart : farHeart}
                                                    style={{color: liked ? 'red' : darkMode ? 'white' : 'black', cursor: 'pointer', fontSize: 30}}
                                                    onClick={() => {
                                                        if (changingLikeStatus.current === false) toggleLike()
                                                    }}
                                                />
                                                {previewMode ? 
                                                    <h3 style={{margin: 0, marginLeft: 10, textDecorationColor: colors.tertiary, textDecorationStyle: 'solid', textDecorationThickness: 2, textDecoration: 'underline', cursor: 'pointer'}}>0 likes</h3>
                                                    
                                                :
                                                    <h3 onClick={() => navigate(`/postLikeCount/${postId}/text`)} style={{margin: 0, marginLeft: 10, textDecorationColor: colors.tertiary, textDecorationStyle: 'solid', textDecorationThickness: 2, textDecoration: 'underline', cursor: 'pointer'}}>{likeCount} {likeCount === 1 ? 'like' : 'likes'}</h3>
                                                }
                                            </div>
                                            <FontAwesomeIcon icon={faPaste} style={{fontSize: 28, marginRight: 10, cursor: 'pointer'}} onClick={copyLinkToClipboard}/>
                                        </div>
                                        <br/>
                                    </>
                                }
                                {dateMade ?
                                    <h4 style={{marginTop: 10, marginBottom: 5}}>Created {calculateDifferenceBetweenNowAndUTCMillisecondsTime(dateMade)}</h4>
                                :
                                    <>
                                        <h4 style={{marginTop: 10, marginBottom: 5}}>Posted {calculateDifferenceBetweenNowAndUTCMillisecondsTime(datePosted)}</h4>
                                        {edited && <h4 style={{margin: 0}}>Edited {calculateDifferenceBetweenNowAndUTCMillisecondsTime(dateEdited)}</h4>}
                                    </>
                                }
                            </>
                        }
                    </>
                }
            </div>
        </Grid>
    )
}

export default TextPost;