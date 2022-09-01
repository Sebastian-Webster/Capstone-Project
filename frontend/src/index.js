import React, {useState, lazy, Suspense} from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CredentialsContext } from './context/CredentialsContext';
import PageNotFound from './routes/PageNotFound';
import { DarkModeContext } from './context/DarkModeContext';
import CircularProgress from '@mui/material/CircularProgress';

const LazyApp = lazy(() => import('./App'))
const LazyHome = lazy(() => import('./routes/Home'));
const LazyProfile = lazy(() => import('./routes/Profile'))
const LazyLogin = lazy(() => import('./routes/Login'))
const LazySignup = lazy(() => import('./routes/Signup'))
const LazyPosts = lazy(() => import('./routes/Posts'))
const LazySearch = lazy(() => import('./routes/Search'))
const LazySettings = lazy(() => import('./routes/Settings'))

const LazyLoadingComponent = ({text}) => {
  return (
    <>
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column'}}>
        <h1>{text}</h1>
        <CircularProgress/>
      </div>
    </>
  )
}

const root = ReactDOM.createRoot(document.getElementById('root'));

const ComponentToRender = () => {
  const [storedCredentials, setStoredCredentials] = useState(JSON.parse(localStorage.getItem('SebMediaCredentials')));
  const [darkMode, setDarkMode] = useState(window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : true)

  window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', event => {
    setDarkMode(event.matches)
});

  return (
    <div style={{height: '100vh', backgroundColor: darkMode ? 'black' : 'white', color: darkMode ? 'white' : 'black'}}>
      <CredentialsContext.Provider value={{storedCredentials, setStoredCredentials}}>
        <DarkModeContext.Provider value={{darkMode, setDarkMode}}>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Suspense fallback={<LazyLoadingComponent text="SebMedia is loading..."/>}><LazyApp/></Suspense>}>
                <Route path="home" element={<Suspense fallback={<LazyLoadingComponent text="Home Screen is loading..."/>}><LazyHome/></Suspense>}/>
                <Route path="search" element={<Suspense fallback={<LazyLoadingComponent text="Search Screen is loading..."/>}><LazySearch/></Suspense>}/>
                <Route path="posts" element={<Suspense fallback={<LazyLoadingComponent text="Post creation screen is loading..."/>}><LazyPosts/></Suspense>}/>
                <Route path="profile" element={<Suspense fallback={<LazyLoadingComponent text="Profile Screen is loading..."/>}><LazyProfile/></Suspense>}/>
                <Route path="settings" element={<Suspense fallback={<LazyLoadingComponent text="Settings Screen is loading..."/>}><LazySettings/></Suspense>}/>
              </Route>
              <Route path="login" element={<Suspense fallback={<LazyLoadingComponent text="Login Screen is loading..."/>}><LazyLogin/></Suspense>}/>
              <Route path="signup" element={<Suspense fallback={<LazyLoadingComponent text="Signup Screen is loading..."/>}><LazySignup/></Suspense>}/>
              <Route path="*" element={<PageNotFound/>}/>
            </Routes>
          </BrowserRouter>
        </DarkModeContext.Provider>
      </CredentialsContext.Provider>
    </div>
  )
}

root.render(
  <ComponentToRender/>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
