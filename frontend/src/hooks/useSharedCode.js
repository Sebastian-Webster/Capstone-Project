import {useContext} from 'react'
import axios from "axios"
import { defaultPfp } from "../constants"
import { ServerUrlContext } from '../context/ServerUrlContext'

const useSharedCode = () => {
    const {serverUrl, setServerUrl} = useContext(ServerUrlContext)

    const addProfilePictureToProfileObject = (profileObj) => {
        return new Promise(async (resolve, reject) => {
            if (profileObj.profileImageKey) {
                axios.get(`${serverUrl}/image/${profileObj.profileImageKey}`).then(response => response.data).then(result => {
                    profileObj.profileImageUri = 'data:image/jpeg;base64,' + result
                    resolve(profileObj)
                }).catch(error => {
                    reject(error)
                })
            } else {
                profileObj.profileImageUri = defaultPfp;
                resolve(profileObj)
            }
        })
    }

    return {
        addProfilePictureToProfileObject
    }
}



export default useSharedCode;