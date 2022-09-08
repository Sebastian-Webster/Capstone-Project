import React, {Component} from 'react'

class ErrorBoundary extends Component {
    constructor(props) {
        super(props)
        this.state = {
            error: null,
            errorInfo: null
        }
    }

    componentDidCatch(error, errorInfo) {
        // Catch errors in any components below and re-render with error message
        this.setState({
          error: error,
          errorInfo: errorInfo
        })
    }

    render() {
        if (this.state.error) {
            return (
                <div style={{height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column'}}>
                    <h1 style={{color: 'red'}}>An error occured! Please reload the page and try again.</h1>
                    <h3 style={{color: 'red'}}>{this.state.error && this.state.error.toString()}</h3>
                    <br />
                    <h3 style={{color: 'red'}}>{this.state.errorInfo.componentStack}</h3>
                </div>
            )
        }

        return this.props.children
    }
}

export default ErrorBoundary;