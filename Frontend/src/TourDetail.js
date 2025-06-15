import React, { useState, useEffect } from 'react';
// 1. IMPORT Link as an alternative, though we'll fix navigate() for now.
import { useParams, useNavigate, Link } from 'react-router-dom'; 

import Footer from './Footer.js';
import './TourDetail.css';
import pic1 from './tour1.jpeg';
import pic2 from './tour2.jpeg';
import pic3 from './tour3.jpeg';
import pic4 from './tour4.jpeg';
import {
    sevenNightsEightDays,
    nineNightsTenDays,
    fourteenNightsFifteenDays,
    twelveNightsThirteenDays
} from './Array.js';

const allTourPackages = [
  { id: 1, details: sevenNightsEightDays, rating: 4.8, reviews: 245, price: "$1150", image: pic1 },
  { id: 2, details: nineNightsTenDays, rating: 4.9, reviews: 189, price: "$1380", image: pic2 },
  { id: 3, details: fourteenNightsFifteenDays, rating: 4.9, reviews: 312, price: "$1950", image: pic3},
  { id: 4, details: twelveNightsThirteenDays, rating: 4.8, reviews: 156, price: "$1620", image: pic4 }
];

const uiStrings = {
    backToTours: { en: '← Back to Tours', ar: '→ العودة إلى الجولات' },
    itineraryTitle: { en: 'Full Itinerary', ar: 'خط سير الرحلة الكامل' },
    bookButton: { en: 'Book This Tour', ar: 'احجز هذه الجولة' },
    tourNotFound: { en: 'Tour not found', ar: 'لم يتم العثور على الجولة' },
    reviews: { en: 'Reviews', ar: 'التقييمات' }
};


const TourDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [currentLanguage, setCurrentLanguage] = useState('en');
    const languageOptions = [
        { value: 'en', label: 'ENG' },
        { value: 'ar', label: 'العربية' }
    ];

    useEffect(() => {
        const savedLanguage = localStorage.getItem('selectedLanguage');
        if (savedLanguage) { setCurrentLanguage(savedLanguage); }
    }, []);

    const handleLanguageChange = (language) => {
        setCurrentLanguage(language);
        localStorage.setItem('selectedLanguage', language);
    };

    const tourPackage = allTourPackages.find(p => p.id === parseInt(id));

    if (!tourPackage) {
        return ( 
            <div className="tour-detail-body">
                <div className="tour-not-found">
                    <h2>{uiStrings.tourNotFound[currentLanguage]}</h2>
                    {/* --- FIX #1: This now navigates to the homepage path "/" --- */}
                    <button className="return" onClick={() => navigate('/')}>
                        {uiStrings.backToTours[currentLanguage]}
                    </button>
                </div>
            </div> 
        );
    }
    
    const tourContent = tourPackage.details[currentLanguage];

    const handleBook = () => { navigate(`/tours/${id}/booking`); };
    
    const languageClass = `lang-${currentLanguage}`;

    return (
        <div className={`tour-detail-body ${languageClass}`}>
            <div className="tour-detail-container">
                                
                <div className="tour-detail-header">
                    {/* --- FIX #2: This also navigates to the homepage path "/" --- */}
                    <button 
                        className="return"
                        onClick={() => navigate('/')}
                    >
                        {uiStrings.backToTours[currentLanguage]}
                    </button>
                   
                    <div className="language-selector-container">
                        <select 
                            value={currentLanguage} 
                            onChange={(e) => handleLanguageChange(e.target.value)}
                            className="language-dropdown"
                        >
                            {languageOptions.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="tour-detail-card">
                    <div className="tour-detail-image">
                        <img src={tourPackage.image} alt={tourContent.title} />
                    </div>

                    <div className="tour-detail-content">
                        <h1 className="tour-detail-title">{tourContent.title}</h1>
                        <div className="tour-detail-rating">
                            <span className="rating-score">{tourPackage.rating} ⭐</span>
                            <span className="rating-reviews">({tourPackage.reviews} {uiStrings.reviews[currentLanguage]})</span>
                            <span className="tour-detail-price">{tourPackage.price}</span>
                        </div>
                        <button className="tour-book-btn" onClick={handleBook}>{uiStrings.bookButton[currentLanguage]} - {tourPackage.price}</button>
                    </div>

                    <div className="itinerary-section">
                        <h2 className="itinerary-title">{uiStrings.itineraryTitle[currentLanguage]}</h2>
                        {tourContent.itinerary.map((dayItem, index) => (
                            <div className="itinerary-day" key={index}>
                                <h3>{dayItem.day}</h3>
                                <p>{dayItem.description}</p>
                            </div>
                        ))}
                    </div>
                    
                    <div className="tour-extras-container">
                        <div className="inclusions-exclusions-grid">
                            {tourContent.inclusions && (
                                <div className="info-section inclusions">
                                    <h3>{tourContent.inclusions.title}</h3>
                                    <ul>
                                        {tourContent.inclusions.items.map((item, index) => (<li key={index}>{item}</li>))}
                                    </ul>
                                </div>
                            )}
                            {tourContent.exclusions && (
                                <div className="info-section exclusions">
                                    <h3>{tourContent.exclusions.title}</h3>
                                    <ul>
                                        {tourContent.exclusions.items.map((item, index) => (<li key={index}>{item}</li>))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        {tourContent.optionalActivities && (
                            <div className="info-section optional-activities">
                                <h3>{tourContent.optionalActivities.title}</h3>
                                <ul>
                                    {tourContent.optionalActivities.items.map((item, index) => (<li key={index}>{item}</li>))}
                                </ul>
                            </div>
                        )}
                        {tourContent.farewell && (<p className="farewell-message">{tourContent.farewell}</p>)}
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default TourDetail;  