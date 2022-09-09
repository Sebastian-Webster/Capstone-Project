import useColorScheme from "../hooks/useColorScheme";

const FollowButton = ({following, onPress, extraStyles = {}, followBack}) => {
    const colors = useColorScheme()

    return (
        <button onClick={onPress} style={{backgroundColor: colors.primary, border: `2px solid ${colors.tertiary}`, borderRadius: 10, paddingLeft: 20, paddingRight: 20, paddingTop: 10, paddingBottom: 10, ...extraStyles}}>
            <h1 style={{color: colors.tertiary, margin: 0}}>{following ? 'Following' : followBack ? 'Follow Back' : 'Follow'}</h1>
        </button>
    )
}

export default FollowButton;