import React, {useState, useEffect, useContext} from 'react';
import useColorScheme from "../hooks/useColorScheme";
import useInput from '../hooks/useInput';
import Box from '@mui/material/Box'
import CircularProgress from '@mui/material/CircularProgress'
import { useFilePicker } from 'use-file-picker';
import Fab from '@mui/material/Fab';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import useComponent from '../hooks/useComponent';
import TextPost from '../components/TextPost'
import ImagePost from '../components/ImagePost'
import { CredentialsContext } from '../context/CredentialsContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'
import { ServerUrlContext } from '../context/ServerUrlContext';


const Container = (props) => {
    const colors = useColorScheme()
    return (
        <div style={{marginLeft: '5vw', marginRight: '5vw', width: '40vw', backgroundColor: colors.secondary, height: '80vh !important', borderRadius: 30, maxWidth: '40vw', overflow: 'scroll', maxHeight: '80vh'}} id='postScreenContainer'>
            <div style={{marginLeft: '1vw', marginRight: '1vw', marginTop: 10, marginBottom: 10}}>
                {props.children}
            </div>
        </div>
    )
}

const Posts = () => {
    const [title, bindTitle] = useInput('', 'title', 'standard', {height: 30, width: '20%'})
    const [body, bindBody] = useInput('', 'body', 'standard', {maxWidth: '95%', minWidth: '20%'})
    const [imagePreview, setImagePreview] = useState(null)
    const { FlexColumnCentreDiv } = useComponent()
    const [openFilePicker, { plainFiles: imageToUpload }] = useFilePicker({accept: 'image/jpeg', multiple: false})
    const {storedCredentials, setStoredCredentials} = useContext(CredentialsContext)
    const {profileImageUri, name, _id} = storedCredentials;
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const {serverUrl, setServerUrl} = useContext(ServerUrlContext)

    useEffect(() => {
        if (imageToUpload[0]) {
            var file = imageToUpload[0]
            var reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onloadend = (e) => {
                setImagePreview(reader.result)
            }
        }
    }, [imageToUpload])

    const post = () => {
        if (title && body) {
            if (imagePreview) {
                setLoading(true)

                const toSend = new FormData();

                toSend.append('image', imageToUpload[0])
                toSend.append('title', title)
                toSend.append('body', body)
                toSend.append('userId', _id)

                axios.post(`${serverUrl}/user/imagePost`, toSend, {
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'multipart/form-data'
                    }
                }).then(result => {
                    navigate('/home')
                }).catch(error => {
                    console.error(error)
                    setError(error?.response?.data?.error || String(error))
                    setLoading(false)
                })
            } else {
                setLoading(true)
                setError(null)

                const toSend = {
                    title,
                    body,
                    userId: _id
                }

                axios.post(`${serverUrl}/user/textPost`, toSend).then(response => response.data)
                .then(result => {
                    setLoading(false)
                    setError(null)
                    navigate('/home')
                }).catch(error => {
                    setLoading(false)
                    setError(error?.response?.data?.error)
                })
            }
        } else {
            alert('Please enter a title and body')
        }
    }

    const removeImage = () => {
        setImagePreview(null)
    }

    return (
        <>
            <div style={{height: '100%', position: 'relative', display: 'flex', flexDirection: 'column'}}>
                <h1 style={{textAlign: 'center', margin: 0}}>Create a Post</h1>
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', flexGrow: 1}}>
                    <Container>
                        {loading ?
                            <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', height: '100%', flexGrow: 1}}>
                                <h1 style={{textAlign: 'center', fontWeight: 'bold'}}>Hold tight! Your masterpiece is being posted.</h1>
                                <Box sx={{display: 'flex', justifyContent: 'center', mt: 3}}>
                                    <CircularProgress/>
                                </Box>
                            </div>
                        :
                            <>
                                <h1>Title</h1>
                                <input {...bindTitle}/>
                                <h1>Body</h1>
                                <textarea {...bindBody}/>
                                <FlexColumnCentreDiv style={{backgroundColor: 'transparent'}}>
                                    <Fab color="secondary" aria-label="add" variant="extended" onClick={openFilePicker}>
                                        {imagePreview ?
                                            <>
                                                <EditIcon />
                                                Change Image
                                            </>
                                        :
                                            <>
                                                <AddIcon />
                                                Image
                                            </>
                                        }
                                    </Fab>
                                    {imagePreview &&
                                        <Fab color='error' variant="extended" onClick={removeImage} sx={{mt: 3}}>
                                            Remove Image
                                        </Fab>
                                    }
                                    <Fab color="primary" aria-label="submit" variant="extended" sx={{mt: 3}} onClick={post}>
                                        <AddIcon />
                                        Submit
                                    </Fab>
                                    {error && <h2 style={{color: 'red'}}>{error}</h2>}
                                </FlexColumnCentreDiv>
                            </>
                        }
                    </Container>
                    <Container>
                        <div>
                            {!title || !body ?
                                <>
                                    <p style={{textAlign: 'center', fontWeight: 'bold'}}>Preview is waiting for title and body to be entered</p>
                                    <Box sx={{display: 'flex', justifyContent: 'center', mt: 3}}>
                                        <CircularProgress/>
                                    </Box>
                                </>
                            :
                                imagePreview ? <ImagePost title={title} body={body} previewImage={imagePreview} previewMode/> : <TextPost title={title} body={body} profileImage={profileImageUri} profileName={name} previewMode/>
                            }
                        </div>
                    </Container>
                </div>
            </div>
        </>
    )
}

export default Posts;