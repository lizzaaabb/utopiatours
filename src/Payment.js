import React, { useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import Footer from './Footer';
import './TourBooking.css';

const Payment = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    
    // Get booking data from navigation state or localStorage fallback
    const bookingData = location.state?.bookingData || JSON.parse(localStorage.getItem('bookingData') || '{}');
    
    const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' or 'payze'
    const [paymentData, setPaymentData] = useState({
        cardNumber: '',
        expiryDate: '',
        cvv: '',
        cardholderName: ''
    });

    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState('');

    const toursData = [
        {
            id: 1,
            category: "CULTURAL",
            title: "Tbilisi Old Town Walking Tour",
            rating: 4.8,
            reviews: 245,
            price: "$45",
            priceNumeric: 45,
            image: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=600&h=400&fit=crop",
            description: "Explore the charming cobblestone streets of Tbilisi's Old Town, discovering hidden courtyards, ancient churches, and traditional Georgian architecture.",
            duration: "3 hours",
            groupSize: "Max 15 people"
        },
        {
            id: 2,
            category: "ADVENTURE",
            title: "Kazbegi Mountain & Gergeti Trinity",
            rating: 4.6,
            reviews: 189,
            price: "$85",
            priceNumeric: 85,
            image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
            description: "Journey to the stunning Kazbegi region and visit the iconic Gergeti Trinity Church perched high in the Caucasus Mountains.",
            duration: "Full day",
            groupSize: "Max 12 people"
        },
        {
            id: 3,
            category: "WINE",
            title: "Kakheti Wine Region Experience",
            rating: 4.7,
            reviews: 312,
            price: "$75",
            priceNumeric: 75,
            image: "https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?w=600&h=400&fit=crop",
            description: "Discover Georgia's premier wine region in Kakheti, home to 8,000 years of winemaking tradition.",
            duration: "Full day",
            groupSize: "Max 20 people"
        },
        {
            id: 4,
            category: "COASTAL",
            title: "Batumi Black Sea Adventure",
            rating: 4.5,
            reviews: 156,
            price: "$65",
            priceNumeric: 65,
            image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&h=400&fit=crop",
            description: "Experience the vibrant coastal city of Batumi with its modern architecture, botanical gardens, and Black Sea beaches.",
            duration: "Full day",
            groupSize: "Max 18 people"
        },
        {
            id: 5,
            category: "HISTORICAL",
            title: "Mtskheta Ancient Capital Tour",
            rating: 4.9,
            reviews: 278,
            price: "$55",
            priceNumeric: 55,
            image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&h=400&fit=crop",
            description: "Step back in time in Mtskheta, the ancient capital of Georgia and a UNESCO World Heritage Site.",
            duration: "Half day",
            groupSize: "Max 16 people"
        },
        {
            id: 6,
            category: "NATURE",
            title: "Svaneti Towers & Alpine Lakes",
            rating: 4.4,
            reviews: 134,
            price: "$95",
            priceNumeric: 95,
            image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&h=400&fit=crop",
            description: "Adventure into the remote Svaneti region, home to medieval stone towers and pristine alpine landscapes.",
            duration: "2 days",
            groupSize: "Max 10 people"
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

    if (!bookingData.firstName) {
        return (
            <div className="booking-body">
                <div className="tour-not-found">
                    <h2>No booking data found</h2>
                    <p style={{color: 'rgba(255, 255, 255, 0.7)', marginBottom: '30px'}}>
                        Please complete the booking form first.
                    </p>
                    <button className="return-btn" onClick={() => navigate(`/tours/${id}/booking`)}>
                        Go to Booking
                    </button>
                </div>
            </div>
        );
    }

    const totalPrice = tour.priceNumeric * (bookingData.participants || 1);

    const handlePaymentInputChange = (e) => {
        const { name, value } = e.target;
        let formattedValue = value;

        // Format card number with spaces
        if (name === 'cardNumber') {
            formattedValue = value.replace(/\s+/g, '').replace(/(\d{4})(?=\d)/g, '$1 ').slice(0, 19);
        }
        // Format expiry date
        else if (name === 'expiryDate') {
            formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5);
        }
        // Format CVV
        else if (name === 'cvv') {
            formattedValue = value.replace(/\D/g, '').slice(0, 3);
        }

        setPaymentData(prev => ({
            ...prev,
            [name]: formattedValue
        }));
    };

    const validatePaymentForm = () => {
        if (paymentMethod === 'payze') return true; // Payze handles validation
        
        const { cardNumber, expiryDate, cvv, cardholderName } = paymentData;
        return cardNumber.replace(/\s/g, '').length === 16 && 
               expiryDate.length === 5 && 
               cvv.length === 3 && 
               cardholderName.trim();
    };

    const processPayzePayment = async () => {
        setIsProcessing(true);
        setPaymentError('');

        try {
            const paymentPayload = {
                tourId: tour.id,
                tourTitle: tour.title,
                amount: totalPrice,
                currency: 'USD',
                customerInfo: {
                    firstName: bookingData.firstName,
                    lastName: bookingData.lastName,
                    email: bookingData.email,
                    phone: bookingData.phone || ''
                },
                bookingDetails: {
                    date: bookingData.date,
                    participants: bookingData.participants,
                    specialRequests: bookingData.specialRequests || ''
                }
            };

            const response = await fetch('/api/create-payze-payment', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(paymentPayload)
            });

            const result = await response.json();

            if (result.success) {
                // Redirect to Payze payment page
                window.location.href = result.paymentUrl;
            } else {
                throw new Error(result.message || 'Payment initialization failed');
            }
        } catch (error) {
            console.error('Payment error:', error);
            setPaymentError(error.message || 'Payment failed. Please try again.');
        } finally {
            setIsProcessing(false);
        }
    };

    const processCardPayment = async () => {
        if (!validatePaymentForm()) {
            setPaymentError('Please fill in all payment details correctly');
            return;
        }

        setIsProcessing(true);
        
        // Simulate card payment processing
        setTimeout(() => {
            setIsProcessing(false);
            // Clear booking data from localStorage
            localStorage.removeItem('bookingData');
            alert(`Payment successful! You will receive a confirmation email at ${bookingData.email}`);
            navigate(`/tours/${id}`);
        }, 3000);
    };

    const processPayment = () => {
        if (paymentMethod === 'payze') {
            processPayzePayment();
        } else {
            processCardPayment();
        }
    };

    const goBackToBooking = () => {
        navigate(`/tours/${id}/booking`, { state: { bookingData } });
    };

    return (
        <div className="booking-body">
            <div className="booking-container">
                {/* Header */}
                <div className="booking-header">
                    <button 
                        className="return-btn"
                        onClick={goBackToBooking}
                    >
                        ← Back to Booking
                    </button>
                    <div className="booking-steps">
                        <span className="step completed">
                            1. Booking Details
                        </span>
                        <span className="step active">
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
                            
                            {/* Booking Summary */}
                            <div style={{marginTop: '20px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.2)'}}>
                                <h4 style={{color: 'white', fontSize: '1.1rem', marginBottom: '10px'}}>Booking Details</h4>
                                <div style={{color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', lineHeight: '1.6'}}>
                                    <p><strong>Name:</strong> {bookingData.firstName} {bookingData.lastName}</p>
                                    <p><strong>Email:</strong> {bookingData.email}</p>
                                    <p><strong>Date:</strong> {bookingData.date}</p>
                                    <p><strong>Participants:</strong> {bookingData.participants}</p>
                                </div>
                            </div>
                            
                            <div className="price-summary">
                                <div className="price-breakdown">
                                    <span>{tour.price} × {bookingData.participants} participant{bookingData.participants > 1 ? 's' : ''}</span>
                                    <span className="total-price">${totalPrice}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment Form */}
                    <div className="payment-form">
                        <h2>Payment Information</h2>
                        
                        {/* Payment Method Selection */}
                        <div className="payment-methods">
                            <div 
                                className={`payment-method ${paymentMethod === 'payze' ? 'active' : ''}`}
                                onClick={() => setPaymentMethod('payze')}
                            >
                                <span>🏦 Payze (Secure Payment)</span>
                            </div>
                            <div 
                                className={`payment-method ${paymentMethod === 'card' ? 'active' : ''}`}
                                onClick={() => setPaymentMethod('card')}
                            >
                                <span>💳 Credit/Debit Card</span>
                            </div>
                        </div>

                        {paymentError && (
                            <div style={{
                                color: '#ff6b6b',
                                background: 'rgba(255, 107, 107, 0.1)',
                                padding: '10px',
                                borderRadius: '8px',
                                marginBottom: '20px',
                                border: '1px solid rgba(255, 107, 107, 0.3)'
                            }}>
                                {paymentError}
                            </div>
                        )}

                        {paymentMethod === 'payze' ? (
                            <div className="payze-payment-info">
                                <div style={{
                                    background: 'rgba(74, 144, 226, 0.1)',
                                    padding: '20px',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(74, 144, 226, 0.3)',
                                    textAlign: 'center',
                                    marginBottom: '20px'
                                }}>
                                    <h3 style={{color: '#4a90e2', marginBottom: '10px'}}>Secure Payment with Payze</h3>
                                    <p style={{color: 'rgba(255, 255, 255, 0.8)', fontSize: '14px', lineHeight: '1.6'}}>
                                        You will be redirected to Payze's secure payment page where you can pay with:
                                    </p>
                                    <div style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        gap: '20px',
                                        marginTop: '15px',
                                        flexWrap: 'wrap'
                                    }}>
                                        <span style={{fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)'}}>💳 Credit Cards</span>
                                        <span style={{fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)'}}>🍎 Apple Pay</span>
                                        <span style={{fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)'}}>📱 Google Pay</span>
                                        <span style={{fontSize: '12px', color: 'rgba(255, 255, 255, 0.7)'}}>🏦 Bank Transfer</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="card-payment-form">
                                <div className="form-group">
                                    <label>Cardholder Name *</label>
                                    <input
                                        type="text"
                                        name="cardholderName"
                                        value={paymentData.cardholderName}
                                        onChange={handlePaymentInputChange}
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>

                                <div className="form-group">
                                    <label>Card Number *</label>
                                    <input
                                        type="text"
                                        name="cardNumber"
                                        value={paymentData.cardNumber}
                                        onChange={handlePaymentInputChange}
                                        placeholder="1234 5678 9012 3456"
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label>Expiry Date *</label>
                                        <input
                                            type="text"
                                            name="expiryDate"
                                            value={paymentData.expiryDate}
                                            onChange={handlePaymentInputChange}
                                            placeholder="MM/YY"
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>CVV *</label>
                                        <input
                                            type="text"
                                            name="cvv"
                                            value={paymentData.cvv}
                                            onChange={handlePaymentInputChange}
                                            placeholder="123"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="payment-security">
                            <p>🔒 Your payment information is secure and encrypted</p>
                        </div>

                        <div className="payment-actions">
                            <button className="back-btn" onClick={goBackToBooking}>
                                ← Back to Details
                            </button>
                            <button 
                                className="pay-btn" 
                                onClick={processPayment}
                                disabled={isProcessing}
                            >
                                {isProcessing ? 'Processing...' : `Pay $${totalPrice} USD`}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Payment;