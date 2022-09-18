import React from 'react';
import useInput from '../../hooks/useInput';
import Button from '@mui/material/Button';

const ChangePassword = () => {
    const [oldPassword, bindOldPassword] = useInput('', 'oldPassword', 'standard', {height: 30, fontSize: 20, minWidth: '70%'})
    const [newPassword, bindNewPassword] = useInput('', 'newPassword', 'standard', {height: 30, fontSize: 20, minWidth: '70%'})
    const [confirmPassword, bindConfirmPassword] = useInput('', 'confirmPassword', 'standard', {height: 30, fontSize: 20, minWidth: '70%'})
    return (
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
            <h3>Old Password</h3>
            <input {...bindOldPassword}/>
            <h3>New Password</h3>
            <input {...bindNewPassword}/>
            <h3>Confirm Password</h3>
            <input {...bindConfirmPassword}/>
            <Button variant="outlined" onClick={() => alert('Coming soon')} size="large" sx={{mt: 3}}>Submit</Button>
        </div>
    )
}

export default ChangePassword;