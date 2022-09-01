import {useState, useContext, useEffect} from 'react';
import { DarkModeContext } from '../context/DarkModeContext';

const useColorScheme = () => {
    const {darkMode, setDarkMode} = useContext(DarkModeContext)
    const darkColors = {
        primary: 'black',
        tertiary: 'white',
        secondary: '#14141f'
    }
    const lightColors = {
        primary: 'black',
        tertiary: 'white',
        secondary: '#EFEFEF'
    }
    const [colorScheme, setColorScheme] = useState(lightColors)

    useEffect(() => {
        setColorScheme(darkMode ? darkColors : lightColors)
    }, [darkMode])

    return colorScheme
}

export default useColorScheme