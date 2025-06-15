const express = require('express');
const path = require('path');
const cors = require('cors');
const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Payze.io Configuration
const PAYZE_CONFIG = {
    API_URL: process.env.PAYZE_ENV === 'production' 
        ? 'https://payze.io/v2/api' 
        : 'https://sandbox.payze.io/v2/api', // Use sandbox for testing
    API_KEY: process.env.PAYZE_API_KEY,
    SECRET_KEY: process.env.PAYZE_SECRET_KEY,
    MERCHANT_ID: process.env.PAYZE_MERCHANT_ID,
    WEBHOOK_SECRET: process.env.PAYZE_WEBHOOK_SECRET
};

// Helper function to generate Payze signature
const generatePayzeSignature = (data, secretKey) => {
    const sortedKeys = Object.keys(data).sort();
    const signString = sortedKeys.map(key => `${key}=${data[key]}`).join('&');
    return crypto.createHmac('sha256', secretKey).update(signString).digest('hex');
};

// API Routes

// Create Payze Payment - Updated to match frontend expectations
app.post('/api/create-payze-payment', async (req, res) => {
    try {
        const {
            amount,
            currency,
            description,
            customer,
            booking,
            success_url,
            cancel_url,
            callback_url
        } = req.body;

        // Generate unique order ID
        const orderId = `TOUR_${booking.tourId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        // Prepare payment data for Payze
        const paymentData = {
            method: 'PUT',
            apiKey: PAYZE_CONFIG.API_KEY,
            merchantId: PAYZE_CONFIG.MERCHANT_ID,
            orderId: orderId,
            amount: Math.round(amount * 100), // Payze expects amount in cents
            currency: currency || 'USD',
            description: description,
            
            // Customer information
            customerFirstName: customer.name.split(' ')[0] || customer.name,
            customerLastName: customer.name.split(' ').slice(1).join(' ') || '',
            customerEmail: customer.email,
            customerPhone: customer.phone || '',
            
            // URLs - Use provided URLs or fallback to defaults
            successUrl: success_url || `${req.protocol}://${req.get('host')}/booking-success?orderId=${orderId}`,
            errorUrl: cancel_url || `${req.protocol}://${req.get('host')}/tours/${booking.tourId}/booking?error=payment_cancelled`,
            callbackUrl: callback_url || `${req.protocol}://${req.get('host')}/api/payze-webhook`,
            
            // Additional data
            language: 'en',
            
            // Custom fields for booking details
            customFields: JSON.stringify({
                tourId: booking.tourId,
                tourTitle: booking.tourTitle,
                bookingDate: booking.date,
                participants: booking.participants,
                specialRequests: booking.specialRequests,
                originalAmount: amount,
                originalCurrency: currency
            })
        };

        // Generate signature
        const signature = generatePayzeSignature(paymentData, PAYZE_CONFIG.SECRET_KEY);
        paymentData.signature = signature;

        console.log('Creating Payze payment:', {
            orderId: orderId,
            amount: amount,
            currency: currency,
            customerEmail: customer.email,
            tourTitle: booking.tourTitle
        });

        // Make request to Payze API
        const response = await axios.put(`${PAYZE_CONFIG.API_URL}/payment`, paymentData, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('Payze API response:', response.data);

        if (response.data.status === 'success') {
            // Store order details (implement your database storage here)
            const orderDetails = {
                orderId: orderId,
                payzeTransactionId: response.data.transactionId,
                amount: amount,
                currency: currency,
                customerInfo: customer,
                bookingDetails: booking,
                status: 'pending',
                createdAt: new Date().toISOString()
            };

            // TODO: Save to database
            // await saveOrderToDatabase(orderDetails);

            console.log('Payment created successfully:', orderDetails);

            res.json({
                success: true,
                orderId: orderId,
                paymentId: response.data.transactionId,
                paymentUrl: response.data.paymentUrl
            });
        } else {
            throw new Error(response.data.message || 'Payment creation failed');
        }

    } catch (error) {
        console.error('Payze payment creation error:', error);
        
        let errorMessage = 'Payment initialization failed';
        let errorDetails = null;

        if (error.response) {
            console.error('Payze API error response:', error.response.data);
            errorMessage = error.response.data.message || errorMessage;
            errorDetails = error.response.data;
        } else if (error.message) {
            errorMessage = error.message;
        }

        res.status(500).json({
            success: false,
            error: errorMessage,
            details: errorDetails
        });
    }
});

// Payze Webhook Handler
app.post('/api/payze-webhook', (req, res) => {
    try {
        const webhookData = req.body;
        console.log('Payze webhook received:', webhookData);
        
        // Verify webhook signature if webhook secret is configured
        if (PAYZE_CONFIG.WEBHOOK_SECRET) {
            const expectedSignature = generatePayzeSignature(webhookData, PAYZE_CONFIG.WEBHOOK_SECRET);
            const receivedSignature = req.headers['x-payze-signature'] || webhookData.signature;
            
            if (expectedSignature !== receivedSignature) {
                console.error('Invalid webhook signature');
                return res.status(400).json({ error: 'Invalid signature' });
            }
        }

        // Process webhook based on status
        switch (webhookData.status) {
            case 'success':
            case 'succeeded':
                handleSuccessfulPayment(webhookData);
                break;
            case 'failed':
            case 'error':
                handleFailedPayment(webhookData);
                break;
            case 'pending':
                handlePendingPayment(webhookData);
                break;
            default:
                console.log('Unknown payment status:', webhookData.status);
        }

        res.json({ status: 'ok', received: true });

    } catch (error) {
        console.error('Webhook processing error:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
});

// Payment status handlers
const handleSuccessfulPayment = (paymentData) => {
    console.log('🎉 Payment successful:', {
        orderId: paymentData.orderId,
        transactionId: paymentData.transactionId,
        amount: paymentData.amount
    });
    
    // Parse custom fields to get booking details
    let bookingDetails = {};
    try {
        if (paymentData.customFields) {
            bookingDetails = JSON.parse(paymentData.customFields);
        }
    } catch (e) {
        console.error('Error parsing custom fields:', e);
    }

    // TODO: Implement your business logic here:
    // 1. Update booking status in database
    // 2. Send confirmation email to customer
    // 3. Send notification to tour operator
    // 4. Create booking record with confirmed status
    
    console.log('Booking confirmed for:', {
        tourTitle: bookingDetails.tourTitle,
        customerEmail: paymentData.customerEmail,
        bookingDate: bookingDetails.bookingDate,
        participants: bookingDetails.participants
    });

    // Example of what you might implement:
    /*
    await Promise.all([
        updateBookingStatus(paymentData.orderId, 'confirmed'),
        sendBookingConfirmationEmail({
            email: paymentData.customerEmail,
            orderId: paymentData.orderId,
            tourTitle: bookingDetails.tourTitle,
            bookingDate: bookingDetails.bookingDate,
            participants: bookingDetails.participants,
            amount: bookingDetails.originalAmount,
            currency: bookingDetails.originalCurrency
        }),
        notifyTourOperator(bookingDetails)
    ]);
    */
};

const handleFailedPayment = (paymentData) => {
    console.log('❌ Payment failed:', {
        orderId: paymentData.orderId,
        transactionId: paymentData.transactionId,
        reason: paymentData.errorMessage || 'Unknown error'
    });
    
    // TODO: Handle failed payment:
    // 1. Update database status to 'failed'
    // 2. Send failure notification to customer
    // 3. Release reserved resources if any
    // 4. Log for monitoring/analytics
};

const handlePendingPayment = (paymentData) => {
    console.log('⏳ Payment pending:', {
        orderId: paymentData.orderId,
        transactionId: paymentData.transactionId
    });
    
    // TODO: Handle pending payment:
    // 1. Update database status to 'pending'
    // 2. Set up monitoring for status changes
    // 3. Optionally notify customer about pending status
};

// Payment status check endpoint
app.get('/api/payment-status/:orderId', async (req, res) => {
    try {
        const { orderId } = req.params;
        
        // Query Payze API for payment status
        const statusData = {
            apiKey: PAYZE_CONFIG.API_KEY,
            orderId: orderId
        };
        
        const signature = generatePayzeSignature(statusData, PAYZE_CONFIG.SECRET_KEY);
        statusData.signature = signature;

        const response = await axios.get(`${PAYZE_CONFIG.API_URL}/payment/status`, {
            params: statusData
        });

        res.json({
            success: true,
            orderId: orderId,
            status: response.data.status,
            transactionId: response.data.transactionId,
            amount: response.data.amount,
            currency: response.data.currency
        });

    } catch (error) {
        console.error('Payment status check error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to check payment status'
        });
    }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        payze: {
            configured: !!(PAYZE_CONFIG.API_KEY && PAYZE_CONFIG.SECRET_KEY && PAYZE_CONFIG.MERCHANT_ID),
            environment: PAYZE_CONFIG.API_URL.includes('sandbox') ? 'sandbox' : 'production'
        }
    });
});

// Test endpoint for development
app.get('/api/test-payze-config', (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(404).json({ error: 'Not found' });
    }

    res.json({
        config: {
            hasApiKey: !!PAYZE_CONFIG.API_KEY,
            hasSecretKey: !!PAYZE_CONFIG.SECRET_KEY,
            hasMerchantId: !!PAYZE_CONFIG.MERCHANT_ID,
            hasWebhookSecret: !!PAYZE_CONFIG.WEBHOOK_SECRET,
            apiUrl: PAYZE_CONFIG.API_URL,
            environment: PAYZE_CONFIG.API_URL.includes('sandbox') ? 'sandbox' : 'production'
        }
    });
});

// Payment result pages
//app.get('/booking-success', (req, res) => {
    //const { orderId } = req.query;
    //console.log('Payment success page accessed:', { orderId });
    //res.sendFile(path.join(__dirname, '../build', 'index.html'));
//});

//app.get('/payment-error', (req, res) => {
    //const { orderId, error } = req.query;
    //console.log('Payment error page accessed:', { orderId, error });
    //res.sendFile(path.join(__dirname, '../build', 'index.html'));
//});



//commenting out the static file serving and React app routing for now
// Serve static files from React build folder
//app.use(express.static(path.join(__dirname, '../build')));

// Serve React app for all other routes
//app.get('*', (req, res) => {
    //res.sendFile(path.join(__dirname, '../build', 'index.html'));
//});

// Error handling middleware
app.use((error, req, res, next) => {
    console.error('Server error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        ...(process.env.NODE_ENV === 'development' && { error: error.message, stack: error.stack })
    });
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
    console.log(`Received ${signal}. Shutting down gracefully...`);
    // Close server and cleanup resources
    process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`💳 Payze environment: ${PAYZE_CONFIG.API_URL.includes('sandbox') ? 'SANDBOX' : 'PRODUCTION'}`);
    
    // Validate Payze configuration
    const requiredConfig = ['API_KEY', 'SECRET_KEY', 'MERCHANT_ID'];
    const missingConfig = requiredConfig.filter(key => !PAYZE_CONFIG[key]);
    
    if (missingConfig.length > 0) {
        console.warn(`⚠️  Warning: Missing Payze configuration: ${missingConfig.join(', ')}`);
        console.warn('   Please check your .env file for: PAYZE_API_KEY, PAYZE_SECRET_KEY, PAYZE_MERCHANT_ID');
    } else {
        console.log('✅ Payze configuration loaded successfully');
    }

    if (!PAYZE_CONFIG.WEBHOOK_SECRET) {
        console.warn('⚠️  Warning: PAYZE_WEBHOOK_SECRET not configured. Webhook signature verification disabled.');
    }
});