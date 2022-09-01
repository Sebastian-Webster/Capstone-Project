import { useContext } from "react";
import { DarkModeContext } from "../context/DarkModeContext";
import { styled } from '@mui/material/styles';
import TextField from '@mui/material/TextField';

const useComponent = () => {
    const {darkMode, setDarkMode} = useContext(DarkModeContext);

    const FlexRowCentreDiv = (props) => {
        return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'row', backgroundColor: darkMode ? 'black' : 'white', color: darkMode ? 'white' : 'black', ...props.style}}>{props.children}</div>
    }

    const FlexColumnCentreDiv = (props) => {
        return <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', backgroundColor: darkMode ? 'black' : 'white', color: darkMode ? 'white' : 'black', ...props.style}}>{props.children}</div>
    }

    const FlexRowSpaceAroundDiv = (props) => {
        return <div style={{display: 'flex', justifyContent: 'space-around', alignItems: 'center', flexDirection: 'row', backgroundColor: darkMode ? 'black' : 'white', color: darkMode ? 'white' : 'black', ...props.style}}>{props.children}</div>
    }

    const H3NoMargin = (props) => <h3 style={{margin: 0, color: darkMode ? 'white' : 'black', ...props.style}}>{props.children}</h3>

    const Div = (props) => <div style={{backgroundColor: darkMode ? 'black' : 'white', color: darkMode ? 'white' : 'black', ...props.style}}>{props.children}</div>

    const StyledTextField = styled(TextField)({
        '& label.Mui-focused': {
            color: darkMode ? 'white' : 'black'
        },
        '& .MuiInput-underline:after': {
            borderBottomColor: darkMode ? 'white' : 'black'
        },
        '& .MuiOutlinedInput-root' : {
            color: darkMode ? 'white' : 'black',
            '& fieldset': {
                color: darkMode ? 'white' : 'black',
                borderColor: darkMode ? 'white' : 'black'
            },
            '&:hover fieldset': {
                borderColor: darkMode ? 'white' : 'black'
            },
            '&.Mui-focused fieldset': {
                borderColor: darkMode ? 'white' : 'black'
            }
        }
    })

    const StyledTextFieldStylesObject = {
        '& label.Mui-focused': {
            color: darkMode ? 'white' : 'black'
        },
        '& .MuiInput-underline:after': {
            borderBottomColor: darkMode ? 'white' : 'black'
        },
        '& .MuiOutlinedInput-root' : {
            color: darkMode ? 'white' : 'black',
            '& fieldset': {
                color: darkMode ? 'white' : 'black',
                borderColor: darkMode ? 'white' : 'black'
            },
            '&:hover fieldset': {
                borderColor: darkMode ? 'white' : 'black'
            },
            '&.Mui-focused fieldset': {
                borderColor: darkMode ? 'white' : 'black'
            }
        }
    }

    return {
        FlexRowCentreDiv,
        FlexColumnCentreDiv,
        FlexRowSpaceAroundDiv,
        H3NoMargin,
        Div,
        StyledTextField,
        StyledTextFieldStylesObject
    }
}

export default useComponent;