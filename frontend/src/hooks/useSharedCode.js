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

    const calculateDifferenceBetweenNowAndUTCMillisecondsTime = (oldTime) => {
        //This function calculates the difference between the current time and the UTC milliseconds time provided to the function as oldTime
        //This function outputs seconds, minutes, hours, days, weeks, months (calculated as 31 days), and years (calculated as 365 days)
        const currentTime = Date.now()
        const millisecondDifference = currentTime - oldTime
        const secondsDifference = Math.floor(millisecondDifference / 1000)
        const minutesDifference = Math.floor(secondsDifference / 60)
        const hoursDifference = Math.floor(minutesDifference / 60)
        const daysDifference = Math.floor(hoursDifference / 24)
        const weeksDifference = Math.floor(daysDifference / 7)
        const monthsDifference = Math.floor(daysDifference / 31)
        const yearsDifference = Math.floor(daysDifference / 365)

        return yearsDifference > 0 ? `${yearsDifference} ${yearsDifference === 1 ? 'year' : 'years'} ago` : 
        monthsDifference > 0 ? `${monthsDifference} ${monthsDifference === 1 ? 'month' : 'months'} ago` :
        weeksDifference > 0 ? `${weeksDifference} ${weeksDifference === 1 ? 'week' : 'weeks'} ago` :
        daysDifference > 0 ? `${daysDifference} ${daysDifference === 1 ? 'day' : 'days'} ago` :
        hoursDifference > 0 ? `${hoursDifference} ${hoursDifference === 1 ? 'hour' : 'hours'} ago` :
        minutesDifference > 0 ? `${minutesDifference} ${minutesDifference === 1 ? 'minute' : 'minutes'} ago` :
        secondsDifference > 0 ? `${secondsDifference} ${secondsDifference === 1 ? 'second' : 'seconds'} ago` :
        'Just Now'
    }

    const copyTextToClipboardPromise = (text) => {
        //navigator.clipboard does not work without https or localhost (secure context)
    if (navigator.clipboard && window.isSecureContext) {
        // use async clipboard API
        return navigator.clipboard.writeText(text); //Returns promise
    } else {
        // use legacy way of copying text
        let textArea = document.createElement("textarea");
        textArea.value = text;
        // make the textarea out of viewport
        textArea.style.position = "fixed";
        textArea.style.left = "-999999px";
        textArea.style.top = "-999999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        return new Promise((resolve, reject) => {
            // copy the text
            document.execCommand('copy') ? resolve() : reject('Your browser cannot copy the post link');
            textArea.remove();
        });
    }
    }

    return {
        addProfilePictureToProfileObject,
        calculateDifferenceBetweenNowAndUTCMillisecondsTime,
        copyTextToClipboardPromise
    }
}



export default useSharedCode;