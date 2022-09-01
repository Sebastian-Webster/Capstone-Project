import useColorScheme from "../hooks/useColorScheme";
import useInput from '../hooks/useInput';

const Posts = () => {
    const colors = useColorScheme()
    const [title, bindTitle] = useInput('', 'title', 'standard')
    const [description, bindDescription] = useInput('', 'description', 'standard')
    
    const Container = (props) => (
        <div style={{marginLeft: '5vw', marginRight: '5vw', width: '40vw', backgroundColor: colors.secondary, height: '80%', borderRadius: 30}}>
            <div style={{marginLeft: '1vw', marginRight: '1vw', marginTop: '5%', marginBottom: '5%'}}>
                {props.children}
            </div>
        </div>
    )

    return (
        <>
            <div style={{height: '100%', position: 'relative', display: 'flex', flexDirection: 'column'}}>
                <h1 style={{textAlign: 'center', margin: 0}}>Create a Post</h1>
                <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', flexGrow: 1}}>
                    <Container>
                        <h1>Title</h1>
                        <input {...bindTitle}/>
                    </Container>
                    <Container>
                        <h1>Hello to you as well</h1>
                    </Container>
                </div>
            </div>
        </>
    )
}

export default Posts;