import React from 'react'
import './ToursApp.css'
import Footer from './Footer'
import { useNavigate } from 'react-router-dom'
import { sevenNightsEightDays } from './Array'
import {nineNightsTenDays} from './Array'
import {fourteenNightsFifteenDays} from './Array'
import {twelveNightsThirteenDays} from './Array'
import pic1 from './tour1.jpeg'
import pic2 from './tour2.jpeg'
import pic3 from './tour3.jpeg'
import pic4 from './tour4.jpeg'


function ToursApp() {
    const navigate = useNavigate()

    const handleReturnHome = () => {
        navigate('/')
    }

    const handleBookNow = (tourId) => {
        navigate(`/tours/${tourId}`)
    }

    const toursData = [
        {
            id: 1,
            category: "INDIVIDUAL",
            title: sevenNightsEightDays.en.title,
            rating: 4.8,
            price: "$45",
            image: pic1
        },
        {
            id: 2,
            category: "INDIVIDUAL",
            title: nineNightsTenDays.en.title,
            rating: 4.9,
            price: "$85",
            image: pic2
        },
        {
            id: 3,
            category: "INDIVIDUAL",
            title: twelveNightsThirteenDays.en.title,
            rating: 4.9,
            price: "$75",
            image: pic3
        },
        {
            id: 4,
            category: "INDIVIDUAL",
            title: fourteenNightsFifteenDays.en.title,
            rating: 4.8,
            price: "$65",
            image: pic4
        }
    ];

    return (
        <div className='tours-app-body'>
            <div className="tours-app-container">
                <div className="tours-app-heading">
                    <div className="home-button">
                    <a
                    href="https://www.utopiaviptravel.com"
                    rel="noopener noreferrer"
                    className="return" // make sure your CSS gives it button styles
                    >
                        Return Home
                    </a>
                    </div>
                    <div className="tours-heading-title">
                        <h2>Discover Tours</h2>
                        <p>Lorem ipsum dolor sit amet consectetur adipisicing elit. Rerum corporis dolorem quos nihil illum iusto optio assumenda nobis libero? Tempore explicabo iste excepturi quisquam ipsum placeat aliquam labore. Mollitia, nisi!</p>
                    </div>
                </div>

                <div className="tours-card-container">
                    {toursData.map(tour => (
                        <div key={tour.id} className="tours-card">
                            <div className="tours-card-image">
                                <img src={tour.image} alt={tour.title} />
                            </div>
                            <div className="tours-card-content">
                                <span className="tours-category">{tour.category}</span>
                                <h3>{tour.title}</h3>
                                <div className="tours-rating">
                                    <span className="tours-score">{tour.rating} ⭐</span>
                                    
                                </div>
                                <div className="tours-price">
                                    <span className="tours-amount">{tour.price}</span>
                                </div>
                                <button 
                                    className="tours-purchase" 
                                    onClick={() => handleBookNow(tour.id)}
                                >
                                    Learn More
                                </button>
                            </div>
                            <button className="tours-favorite">♡</button>
                        </div>
                    ))}
                </div>
            </div>
            <Footer />
        </div>
    )
}

export default ToursApp