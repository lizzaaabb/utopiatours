import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Footer from './Footer';

// Tours components
import Tours from './Tours';
import TourDetail from './TourDetail';
import TourBooking from './TourBooking';
import Payment from './Payment';

// Error Boundary component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children;
  }
}

const App = () => {
  console.log('App rendering');
  return (
    <BrowserRouter basename="/utopiatours">
      <ErrorBoundary>
        <Routes>
          <Route path="/" element={<Tours />} />
          <Route path="/tours" element={<Tours />} />
          <Route path="/tours/:id" element={<TourDetail />} />
          <Route path="/tours/:id/booking" element={<TourBooking />} />
          <Route path="/tours/:id/payment" element={<Payment />} />
          <Route path="*" element={<div>404 - Page Not Found</div>} />
        </Routes>
        <Footer />
      </ErrorBoundary>
    </BrowserRouter>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
