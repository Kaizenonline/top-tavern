import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{padding:"40px",fontFamily:"monospace",color:"#ff6060",background:"#1a0808",minHeight:"100vh"}}>
          <h2 style={{color:"#ef4444",marginBottom:"20px"}}>RENDER ERROR</h2>
          <pre style={{whiteSpace:"pre-wrap",fontSize:"13px",color:"#ffaaaa"}}>
            {this.state.error?.toString()}
            {"\n\n"}
            {this.state.error?.stack}
          </pre>
          <p style={{color:"#888",marginTop:"20px",fontSize:"12px"}}>
            Please copy this error and share it for debugging.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
)
