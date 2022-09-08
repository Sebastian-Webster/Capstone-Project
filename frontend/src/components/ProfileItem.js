import Grid from '@mui/material/Grid'
import { defaultPfp } from '../constants';
import useColorScheme from '../hooks/useColorScheme';
import { useNavigate } from 'react-router-dom';

const ProfileItem = ({profileImage, name, publicId}) => {
    const colors = useColorScheme()
    const navigate = useNavigate()

    const goToProfile = () => {
        navigate(`/profile/${publicId}`)
    }

    return (
        <Grid item xs={12} md={6} xl={3}>
            <div onClick={goToProfile} style={{backgroundColor: colors.secondary, display: 'flex', alignItems: 'center', flexDirection: 'row', cursor: 'pointer', paddingTop: 20, paddingBottom: 20, paddingLeft: 30, paddingRight: 30}}>
                <img src={profileImage || defaultPfp} alt={`${name}'s profile photo`} style={{height: 70, width: 70, borderRadius: '50%'}}/>
                <p style={{fontSize: 30, marginLeft: 15}}>{name}</p>
            </div>
        </Grid>
    )
}

export default ProfileItem;