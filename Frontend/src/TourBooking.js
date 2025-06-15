import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Footer from './Footer';
import './TourBooking.css';
import pic1 from './tour1.jpeg';
import pic2 from './tour2.jpeg';
import pic3 from './tour3.jpeg';
import pic4 from './tour4.jpeg';

import { sevenNightsEightDays } from './Array';
import { nineNightsTenDays } from './Array';
import { fourteenNightsFifteenDays } from './Array';
import { twelveNightsThirteenDays } from './Array';

// Define your backend and frontend URLs at the top for easy management
const API_URL = 'https://utopiatours.onrender.com';
const FRONTEND_URL = 'https://lizzaaabb.github.io/utopiatours';

const TourBooking = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [bookingData, setBookingData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        date: '',
        participants: 1,
        specialRequests: ''
    });

    const [isProcessing, setIsProcessing] = useState(false);

    const toursData = [
        { id: 1, title: sevenNightsEightDays.en.title, priceNumeric: 45, image: pic1, duration: "8 Days", groupSize: "Max 15 people", rating: 4.8, reviews: 245 },
        { id: 2, title: nineNightsTenDays.en.title, priceNumeric: 85, image: pic2, duration: "10 Days", groupSize: "Max 12 people", rating: 4.9, reviews: 189 },
        { id: 3, title: twelveNightsThirteenDays.en.title, priceNumeric: 75, image: pic3, duration: "13 Days", groupSize: "Max 20 people", rating: 4.9, reviews: 312 },
        { id: 4, title: fourteenNightsFifteenDays.en.title, priceNumeric: 65, image: pic4, duration: "15 Days", groupSize: "Max 18 people", rating: 4.8, reviews: 156 }
    ];

    const tour = toursData.find(t => t.id === parseInt(id));

    if (!tour) {
        return (
            <div className="booking-body">
                <div className="tour-not-found">
                    <h2>Tour not found</h2>
                    {/* FIX #1: Navigate to the root path */}
                    <button className="return-btn" onClick={() => navigate('/')}>Back to Tours</button>
                </div>
            </div>
        );
    }

    const totalPrice = tour.priceNumeric * bookingData.participants;

    const handleBookingInputChange = (e) => {
        const { name, value } = e.target;
        setBookingData(prev => ({ ...prev, [name]: value }));
    };

    const validateBookingForm = () => {
        const { firstName, lastName, email, phone, date } = bookingData;
        return firstName && lastName && email && phone && date;
    };

    const proceedToPayment = async () => {
        if (!validateBookingForm()) { alert('Please fill in all required fields'); return; }
        setIsProcessing(true);

        try {
            const paymentData = {
                amount: totalPrice,
                currency: 'USD',
                description: `Tour Booking: ${tour.title}`,
                customer: { email: bookingData.email, phone: bookingData.phone, name: `${bookingData.firstName} ${bookingData.lastName}` },
                booking: { tourId: tour.id, tourTitle: tour.title, date: bookingData.date, participants: bookingData.participants, specialRequests: bookingData.specialRequests },
                // FIX #4: Use the full HashRouter URLs
                success_url: `${FRONTEND_URL}/#/booking-success`, // Create a route for this page
                cancel_url: `${FRONTEND_URL}/#/tours/${id}`, // Go back to the tour detail page on cancel
                callback_url: `${API_URL}/api/payze-webhook`
            };

            // FIX #3: Use the full backend API URL
            const response = await fetch(`${API_URL}/api/create-payze-payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paymentData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Failed to create payment');
            }

            const result = await response.json();
            
            if (result.paymentUrl) {
                window.location.href = result.paymentUrl;
            } else {
                throw new Error('No payment URL received');
            }

        } catch (error) {
            console.error('Payment creation failed:', error);
            alert(`Failed to create payment: ${error.message}`);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="booking-body">
            <div className="booking-container">
                <div className="booking-header">
                    {/* FIX #2: Use navigate(-1) for a robust back button */}
                    <button className="return-btn" onClick={() => navigate(-1)}>
                        ← Back to Tour
                    </button>
                    <div className="booking-steps">
                        <span className="step active">1. Booking Details</span>
                        <span className="step">2. Payment</span>
                    </div>
                </div>

                <div className="booking-content">
                    <div className="tour-summary">
                        <img src={tour.image} alt={tour.title} className="tour-summary-image" />
                        <div className="tour-summary-details">
                            <h3>{tour.title}</h3>
                            <div className="tour-summary-info">
                                <span>⏱️ {tour.duration}</span>
                                <span>👥 {tour.groupSize}</span>
                                <span>⭐ {tour.rating} ({tour.reviews} reviews)</span>
                            </div>
                            <div className="price-summary">
                                <div className="price-breakdown">
                                    <span>${tour.priceNumeric} × {bookingData.participants} participant{bookingData.participants > 1 ? 's' : ''}</span>
                                    <span className="total-price">${totalPrice}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="booking-form">
                        <h2>Booking Details</h2>
                        <div className="form-row">
                            <div className="form-group"><label>First Name *</label><input type="text" name="firstName" value={bookingData.firstName} onChange={handleBookingInputChange} required /></div>
                            <div className="form-group"><label>Last Name *</label><input type="text" name="lastName" value={bookingData.lastName} onChange={handleBookingInputChange} required /></div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label>Email *</label><input type="email" name="email" value={bookingData.email} onChange={handleBookingInputChange} required /></div>
                            <div className="form-group"><label>Phone *</label><input type="tel" name="phone" value={bookingData.phone} onChange={handleBookingInputChange} required /></div>
                        </div>
                        <div className="form-row">
                            <div className="form-group"><label>Tour Date *</label><input type="date" name="date" value={bookingData.date} onChange={handleBookingInputChange} min={new Date().toISOString().split('T')[0]} required /></div>
                            <div className="form-group"><label>Number of Participants</label><select name="participants" value={bookingData.participants} onChange={handleBookingInputChange}>{ [1,2,3,4,5,6,7,8].map(num => (<option key={num} value={num}>{num}</option>)) }</select></div>
                        </div>
                        <div className="form-group"><label>Special Requests (Optional)</label><textarea name="specialRequests" value={bookingData.specialRequests} onChange={handleBookingInputChange} rows="3" placeholder="Any dietary restrictions, accessibility needs, or special requests..." /></div>
                        <button className="proceed-btn" onClick={proceedToPayment} disabled={isProcessing}>
                            {isProcessing ? 'Creating Payment...' : `Proceed to Payment - $${totalPrice}`}
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default TourBooking;