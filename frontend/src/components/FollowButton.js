import useColorScheme from "../hooks/useColorScheme";

const FollowButton = (following, onPress) => {
    const colors = useColorScheme()

    return (
        <button onClick={onPress} style={{backgroundColor: colors.primary, border: `2px solid ${colors.tertiary}`, borderRadius: 10, paddingLeft: 15, paddingRight: 15, paddingTop: 10, paddingBottom: 10}}>
            <h1>{following ? 'Following' : 'Follow'}</h1>
        </button>
    )
}

export default FollowButton;