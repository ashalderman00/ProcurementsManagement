import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props){ super(props); this.state = { hasError: false, error: null }; }
  static getDerivedStateFromError(error){ return { hasError: true, error }; }
  componentDidCatch(error, info){ console.error("ErrorBoundary", error, info); }
  render(){
    if (this.state.hasError){
      return <div className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-800">
        <div className="font-semibold mb-1">Something went wrong.</div>
        <div>{String(this.state.error?.message||"")}</div>
      </div>;
    }
    return this.props.children;
  }
}
