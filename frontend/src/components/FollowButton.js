import useColorScheme from "../hooks/useColorScheme";

const FollowButton = ({following, onPress, extraStyles = {}}) => {
    const colors = useColorScheme()

    return (
        <button onClick={onPress} style={{backgroundColor: colors.primary, border: `2px solid ${colors.tertiary}`, borderRadius: 10, paddingLeft: 25, paddingRight: 25, paddingTop: 12.5, paddingBottom: 12.5, ...extraStyles}}>
            <h1 style={{color: colors.tertiary, margin: 0}}>{following ? 'Following' : 'Follow'}</h1>
        </button>
    )
}

export default FollowButton;