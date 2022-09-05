import React, {useState, useEffect} from 'react';
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

const Container = (props) => {
    const colors = useColorScheme()
    return (
        <div style={{marginLeft: '5vw', marginRight: '5vw', width: '40vw', backgroundColor: colors.secondary, height: '80%', borderRadius: 30}}>
            <div style={{marginLeft: '1vw', marginRight: '1vw', marginTop: '5%', marginBottom: '5%'}}>
                {props.children}
            </div>
        </div>
    )
}

const Posts = () => {
    const [title, bindTitle] = useInput('', 'title', 'standard')
    const [body, bindBody] = useInput('', 'body', 'standard')
    const [imagePreview, setImagePreview] = useState(null)
    const { FlexColumnCentreDiv } = useComponent()
    const [openFilePicker, { plainFiles: imageToUpload }] = useFilePicker({accept: 'image/jpeg', multiple: false})

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
                alert('Image posting coming soon')
            } else {
                alert('Text posting coming soon')
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
                        <h1>Title</h1>
                        <input {...bindTitle}/>
                        <h1>Body</h1>
                        <input {...bindBody}/>
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
                        </FlexColumnCentreDiv>
                    </Container>
                    <Container>
                        {imagePreview ?
                            <h1 style={{textAlign: 'center'}}>Image Post Preview</h1>
                        :
                            <h1 style={{textAlign: 'center'}}>Text Post Preview</h1>
                        }
                        <div>
                            {!title || !body ?
                                <>
                                    <p style={{textAlign: 'center', fontWeight: 'bold'}}>Preview is waiting for title and body to be entered</p>
                                    <Box sx={{display: 'flex', justifyContent: 'center', mt: 3}}>
                                        <CircularProgress/>
                                    </Box>
                                </>
                            :
                                imagePreview ? <ImagePost title={title} body={body} previewImage={imagePreview} previewMode/> : <TextPost title={title} body={body} previewMode/>
                            }
                        </div>
                    </Container>
                </div>
            </div>
        </>
    )
}

export default Posts;