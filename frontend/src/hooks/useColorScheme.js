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
        primary: 'white',
        tertiary: 'black',
        secondary: '#EFEFEF'
    }
    const [colorScheme, setColorScheme] = useState(darkMode ? darkColors : lightColors)

    useEffect(() => {
        if ((darkMode && colorScheme == darkColors) || (!darkMode && colorScheme == lightColors)) {
            //Do not run if the color scheme is darkMode and dark mode is on OR if the color scheme is lightMode and dark mode is off
        } else {
            setColorScheme(darkMode ? darkColors : lightColors)
        }
    }, [darkMode])

    return colorScheme
}

export default useColorScheme