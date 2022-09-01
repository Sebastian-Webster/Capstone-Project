import React, {useContext, useState} from 'react';
import { useNavigate } from 'react-router-dom';
import { CredentialsContext } from '../context/CredentialsContext';
import axios from 'axios';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Link from '@mui/material/Link'
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { DarkModeContext } from '../context/DarkModeContext';
import useComponent from '../hooks/useComponent';

const Login = () => {
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(false)
    const {storedCredentials, setStoredCredentials} = useContext(CredentialsContext);
    const [rememberMe, setRememberMe] = useState(true);
    const navigate = useNavigate();
    const theme = createTheme();
    const {darkMode, setDarkMode} = useContext(DarkModeContext);
    const { StyledTextField } = useComponent();

    const handleLogin = (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)

        const url = 'http://localhost:8080/user/login'
        const data = new FormData(e.currentTarget)
        const toSend = {
            email: data.get('email'),
            password: data.get('password')
        }

        axios.post(url, toSend).then(result => {
            setLoading(false)
            setStoredCredentials(result.data.data)
            if (rememberMe) localStorage.setItem('SebMediaCredentials', JSON.stringify(result.data.data))
            navigate('/home')
        }).catch(error => {
            setLoading(false)
            setError(error?.response?.data?.error || 'Unknown error occured')
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
                                    Sign in
                                </Typography>
                                <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1 }}>
                                    <StyledTextField
                                    margin="normal"
                                    required
                                    fullWidth
                                    id="email"
                                    label="Email Address"
                                    name="email"
                                    autoComplete="email"
                                    autoFocus
                                    InputLabelProps={{
                                        style: {
                                            color: darkMode ? 'white' : 'black'
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
                                            color: darkMode ? 'white' : 'black'
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
                                    Sign In
                                    </Button>
                                    <Box sx={{display: 'flex', justifyContent: 'center'}}>
                                        <Link variant='h5' onClick={() => navigate('/signup')} sx={{cursor: 'pointer'}}>Don't have an account? Signup</Link>
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

export default Login;