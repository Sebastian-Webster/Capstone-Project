import React, {useContext, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { CredentialsContext } from '../context/CredentialsContext';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { DarkModeContext } from '../context/DarkModeContext';
import useComponent from '../hooks/useComponent';
import { ServerUrlContext } from '../context/ServerUrlContext';
import { defaultPfp } from '../constants';

const Signup = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [rememberMe, setRememberMe] = useState(true)
    const {storedCredentials, setStoredCredentials} = useContext(CredentialsContext)
    const {darkMode, setDarkMode} = useContext(DarkModeContext)
    const navigate = useNavigate()
    const theme = createTheme();
    const { StyledTextField } = useComponent();
    const {serverUrl, setServerUrl} = useContext(ServerUrlContext)

    const handleSignup = (e) => {
        e.preventDefault();

        setLoading(true)
        setError(null)

        const url = `${serverUrl}/user/signup`;
        const data = new FormData(e.currentTarget)
        const toSend = {
            email: data.get('email'),
            password: data.get('password'),
            name: data.get('name')
        }

        axios.post(url, toSend).then(response => response.data.data).then(result => {
            result.profileImageUri = defaultPfp
            setLoading(false)
            setStoredCredentials(result)
            result.rememberMe = true;
            if (rememberMe) localStorage.setItem('SebMediaCredentials', JSON.stringify(result))
            localStorage.setItem('following', '0')
            localStorage.setItem('followers', '0')
            navigate('/home')
        }).catch(error => {
            setLoading(false)
            setError(error?.response?.data?.error || String(error))
            console.error(error)
        })
    }

    return (
        <div style={{height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
            <h1 style={{marginBottom: 0}}>Welcome to SebMedia!</h1>
            {loading ?
                <Box sx={{display: 'flex', justifyContent: 'center', mt: 3}}>
                    <CircularProgress/>
                </Box>
            :
                <>
                    <ThemeProvider theme={theme}>
                        <Container component="main" maxWidth="xs">
                            <CssBaseline />
                            <Box
                                sx={{
                                    marginTop: 8,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                }}
                            >
                                <Typography component="h1" variant="h5">
                                    Signup
                                </Typography>
                                <Box component="form" onSubmit={handleSignup} noValidate sx={{ mt: 1 }}>
                                    <StyledTextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="name"
                                    label="Username"
                                    name="name"
                                    autoFocus
                                    InputLabelProps={{
                                        style: {
                                            color: darkMode ? 'white' : 'dark'
                                        }
                                    }}
                                    />
                                    <StyledTextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="email"
                                    label="Email Address"
                                    name="email"
                                    autoComplete="email"
                                    InputLabelProps={{
                                        style: {
                                            color: darkMode ? 'white' : 'dark'
                                        }
                                    }}
                                    />
                                    <StyledTextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    name="password"
                                    label="Password"
                                    type="password"
                                    id="password"
                                    autoComplete="current-password"
                                    InputLabelProps={{
                                        style: {
                                            color: darkMode ? 'white' : 'dark'
                                        }
                                    }}
                                    />
                                    <FormControlLabel
                                    control={<Checkbox value="remember" color="primary" defaultChecked onChange={(e) => setRememberMe(e.target.checked)}/>}
                                    label="Remember me"
                                    />
                                    {error && <Typography component="h1" variant="h6" sx={{color: 'red', textAlign: 'center'}}>{error}</Typography>}
                                    <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    sx={{ mt: 3, mb: 2 }}
                                    >
                                    Signup
                                    </Button>
                                    <Box sx={{display: 'flex', justifyContent: 'center'}}>
                                        <Link variant='h5' onClick={() => navigate('/login')} sx={{cursor: 'pointer'}}>Already have an account? Login</Link>
                                    </Box>
                                </Box>
                            </Box>
                        </Container>
                    </ThemeProvider>
                </>
            }
        </div>
    )
}

export default Signup;