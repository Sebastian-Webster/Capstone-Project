import {useState, useContext} from 'react';
import { DarkModeContext } from '../context/DarkModeContext';

const capitalizeFirstLetter = (string) => {
    return string.charAt(0).toUpperCase() + string.slice(1)
}

const useInput = (initialText = '', inputName, variant = 'outlined', extraStyles = {}, inputType = 'text', standardInput) => {
    const [text, setText] = useState(initialText);
    const {darkMode, setDarkMode} = useContext(DarkModeContext);

    const resetToDefault = () => {
        setText(initialText)
    }

    const muiBind = {
        InputLabelProps: {
            style: {
                color: darkMode ? 'white' : 'black'
            }
        },
        InputProps: {
            style: {
                color: darkMode ? 'white' : 'black',
                borderColor: darkMode ? 'white' : 'black'
            },
            notchedOutline: {
                color: darkMode ? 'white' : 'black'
            }
        },
        OutlinedInputProps: {
            style: {
                borderColor: darkMode ? 'white' : 'black'
            },
            color: darkMode ? '#ffffff' : '#000000',
            inputProps: {
                style: {
                    color: darkMode ? 'white' : 'black',
                    borderColor: darkMode ? 'white' : 'black'
                }
            }
        },
        FilledInputProps: {
            style: {
                color: darkMode ? 'white' : 'black',
                borderColor: darkMode ? 'white' : 'black'
            }
        },
        inputProps: {
            style: {
                color: darkMode ? 'white' : 'black',
                borderColor: darkMode ? 'white' : 'black'
            },
            notchedOutline: {
                color: darkMode ? 'white' : 'black'
            }
        }
    }

    const extras = standardInput ? {} : muiBind

    const bind = {
        value: text,
        onChange: (e) => {
            setText(e.target.value)
        },
        name: inputName,
        type: inputType,
        sx: {
            mt: 2
        },
        variant,
        label: capitalizeFirstLetter(inputName),
        style: {
            backgroundColor: 'transparent',
            border: `2px solid ${darkMode ? 'white' : 'black'}`,
            color: darkMode ? 'white' : 'black',
            ...extraStyles
        },
        ...extras
    }

    return [text, bind, resetToDefault];
}

export default useInput;