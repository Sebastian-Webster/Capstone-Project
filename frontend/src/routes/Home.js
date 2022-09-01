import React, {useContext} from 'react';
import { CredentialsContext } from '../context/CredentialsContext';

const Home = () => {
    const {storedCredentials, setStoredCredentials} = useContext(CredentialsContext);
    const {following} = storedCredentials;
    return (
        <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
            {following.length > 1 ?
                <h1>Home feed coming soon</h1>
            :
                <h1>Start following some people to see a home feed!</h1>
            }
        </div>
    )
}

export default Home;