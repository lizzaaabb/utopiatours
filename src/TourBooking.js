import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Footer from './Footer';
import './TourBooking.css';
import pic1 from './tour1.jpeg'
import pic2 from './tour2.jpeg'
import pic3 from './tour3.jpeg'
import pic4 from './tour4.jpeg'

import { sevenNightsEightDays } from './Array'
import {nineNightsTenDays} from './Array'
import {fourteenNightsFifteenDays} from './Array'
import {twelveNightsThirteenDays} from './Array'

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
        {
            id: 1,
            category: "INDIVIDUAL",
            title: sevenNightsEightDays.en.title,
            rating: 4.8,
            price: "$45",
            priceNumeric: 45,
            image: pic1,
            description: "Explore the charming cobblestone streets of Tbilisi's Old Town, discovering hidden courtyards, ancient churches, and traditional Georgian architecture.",
            duration: "8 Days",
            groupSize: "Max 15 people"
        },
        {
            id: 2,
            category: "INDIVIDUAL",
            title: nineNightsTenDays.en.title,
            rating: 4.9,
            price: "$85",
            priceNumeric: 85,
            image: pic2,
            description: "Journey to the stunning Kazbegi region and visit the iconic Gergeti Trinity Church perched high in the Caucasus Mountains.",
            duration: "10 Days",
            groupSize: "Max 12 people"
        },
        {
            id: 3,
            category: "INDIVIDUAL",
            title: twelveNightsThirteenDays.en.title,
            rating: 4.9,
            price: "$75",
            priceNumeric: 75,
            image: pic3,
            description: "Discover Georgia's premier wine region in Kakheti, home to 8,000 years of winemaking tradition.",
            duration: "13 Days",
            groupSize: "Max 20 people"
        },
        {
            id: 4,
            category: "INDIVIDUAL",
            title: fourteenNightsFifteenDays.en.title,
            rating: 4.8,
            price: "$65",
            priceNumeric: 65,
            image: pic4,
            description: "Experience the vibrant coastal city of Batumi with its modern architecture, botanical gardens, and Black Sea beaches.",
            duration: "15 Days",
            groupSize: "Max 18 people"
        }
    ];

    const tour = toursData.find(t => t.id === parseInt(id));

    if (!tour) {
        return (
            <div className="booking-body">
                <div className="tour-not-found">
                    <h2>Tour not found</h2>
                    <button className="return-btn" onClick={() => navigate('/tours')}>Back to Tours</button>
                </div>
            </div>
        );
    }

    const totalPrice = tour.priceNumeric * bookingData.participants;

    const handleBookingInputChange = (e) => {
        const { name, value } = e.target;
        setBookingData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const validateBookingForm = () => {
        const { firstName, lastName, email, phone, date } = bookingData;
        return firstName && lastName && email && phone && date;
    };

    // Payze integration function
    const proceedToPayment = async () => {
        if (!validateBookingForm()) {
            alert('Please fill in all required fields');
            return;
        }

        setIsProcessing(true);

        try {
            // Create payment request to your backend
            const paymentData = {
                amount: totalPrice,
                currency: 'USD', // or 'GEL' for Georgian Lari
                description: `Tour Booking: ${tour.title}`,
                customer: {
                    email: bookingData.email,
                    phone: bookingData.phone,
                    name: `${bookingData.firstName} ${bookingData.lastName}`
                },
                booking: {
                    tourId: tour.id,
                    tourTitle: tour.title,
                    date: bookingData.date,
                    participants: bookingData.participants,
                    specialRequests: bookingData.specialRequests
                },
                // Callback URLs
                success_url: `${window.location.origin}/booking-success`,
                cancel_url: `${window.location.origin}/tours/${id}/booking`,
                callback_url: `${window.location.origin}/api/payze-callback` // Your webhook endpoint
            };

            // Make request to your backend to create Payze payment
            const response = await fetch('/api/create-payze-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(paymentData)
            });

            if (!response.ok) {
                throw new Error('Failed to create payment');
            }

            const result = await response.json();
            
            // Redirect to Payze payment page
            if (result.paymentUrl) {
                window.location.href = result.paymentUrl;
            } else {
                throw new Error('No payment URL received');
            }

        } catch (error) {
            console.error('Payment creation failed:', error);
            alert('Failed to create payment. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="booking-body">
            <div className="booking-container">
                {/* Header */}
                <div className="booking-header">
                    <button 
                        className="return-btn"
                        onClick={() => navigate(`/tours/${id}`)}
                    >
                        ← Back to Tour
                    </button>
                    <div className="booking-steps">
                        <span className="step active">
                            1. Booking Details
                        </span>
                        <span className="step">
                            2. Payment
                        </span>
                    </div>
                </div>

                <div className="booking-content">
                    {/* Tour Summary */}
                    <div className="tour-summary">
                        <img src={tour.image} alt={tour.title} className="tour-summary-image" />
                        <div className="tour-summary-details">
                            <h3>{tour.title}</h3>
                            <p className="tour-category">{tour.category}</p>
                            <div className="tour-summary-info">
                                <span>⏱️ {tour.duration}</span>
                                <span>👥 {tour.groupSize}</span>
                                <span>⭐ {tour.rating} ({tour.reviews} reviews)</span>
                            </div>
                            <div className="price-summary">
                                <div className="price-breakdown">
                                    <span>{tour.price} × {bookingData.participants} participant{bookingData.participants > 1 ? 's' : ''}</span>
                                    <span className="total-price">${totalPrice}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Booking Form */}
                    <div className="booking-form">
                        <h2>Booking Details</h2>
                        
                        <div className="form-row">
                            <div className="form-group">
                                <label>First Name *</label>
                                <input
                                    type="text"
                                    name="firstName"
                                    value={bookingData.firstName}
                                    onChange={handleBookingInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Last Name *</label>
                                <input
                                    type="text"
                                    name="lastName"
                                    value={bookingData.lastName}
                                    onChange={handleBookingInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Email *</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={bookingData.email}
                                    onChange={handleBookingInputChange}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Phone *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={bookingData.phone}
                                    onChange={handleBookingInputChange}
                                    required
                                />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label>Tour Date *</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={bookingData.date}
                                    onChange={handleBookingInputChange}
                                    min={new Date().toISOString().split('T')[0]}
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Number of Participants</label>
                                <select
                                    name="participants"
                                    value={bookingData.participants}
                                    onChange={handleBookingInputChange}
                                >
                                    {[1,2,3,4,5,6,7,8].map(num => (
                                        <option key={num} value={num}>{num}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="form-group">
                            <label>Special Requests (Optional)</label>
                            <textarea
                                name="specialRequests"
                                value={bookingData.specialRequests}
                                onChange={handleBookingInputChange}
                                rows="3"
                                placeholder="Any dietary restrictions, accessibility needs, or special requests..."
                            />
                        </div>

                        <button 
                            className="proceed-btn" 
                            onClick={proceedToPayment}
                            disabled={isProcessing}
                        >
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