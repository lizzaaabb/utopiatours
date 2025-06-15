import React from 'react';
import ReactDOM from 'react-dom/client';
// 1. We import HashRouter, which is ideal for GitHub Pages.
import { HashRouter, Routes, Route } from 'react-router-dom';

// Import your components. Make sure the paths are correct.
// I'm assuming they are in the same folder for this example.
import Tours from './Tours';
import TourDetail from './TourDetail';
import TourBooking from './TourBooking';
import Payment from './Payment';
// Note: Footer is not a route, so it's typically included inside other components.

// Error Boundary a great practice to keep.
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error('Error caught by Error Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <h1>Something went wrong. Please refresh the page.</h1>;
    }

    return this.props.children;
  }
}


// This is our main application component.
const App = () => {
  return (
    // 2. We use HashRouter here. It does not need a 'basename' prop.
    <HashRouter>
      <ErrorBoundary>
        <Routes>
          {/* The root URL (.../#/) will show the Tours component. */}
          <Route path="/" element={<Tours />} />

          {/* This route handles the detail page for a specific tour. */}
          <Route path="/tours/:id" element={<TourDetail />} />

          {/* This route handles the booking page for a specific tour. */}
          <Route path="/tours/:id/booking" element={<TourBooking />} />

          {/* This route handles the payment page for a specific tour. */}
          <Route path="/tours/:id/payment" element={<Payment />} />

          {/* This is a "catch-all" route for any URL that doesn't match. */}
          <Route path="*" element={<div><h1>404</h1><p>Page Not Found</p></div>} />
        </Routes>
      </ErrorBoundary>
    </HashRouter>
  );
};


// This is the standard way to render a React 18 app. Your original code was correct here.
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);