const crypto = require('crypto');

// 1. PASTE YOUR HMAC SECRET HERE (From .env)
const HMAC_SECRET = "9BCBA52995BA7B4FF2FEA13B90E954B7";

// 2. PASTE A REAL USER ID FROM YOUR DATABASE HERE
const USER_ID = "64f1a2b3c4d5e6f7g8h9i0j1";

// Data to simulate
const data = {
        amount_cents: 20000, // 200 EGP
        created_at: new Date().toISOString(),
        currency: "EGP",
        error_occured: false,
        has_parent_transaction: false,
        id: Math.floor(Math.random() * 1000000), // Random Transaction ID
        integration_id: 12345,
        is_3d_secure: false,
        is_auth: false,
        is_capture: false,
        is_refunded: false,
        is_standalone_payment: false,
        is_voided: false,
        order_id: Math.floor(Math.random() * 1000000),
        owner: 123,
        pending: false,
        source_data_pan: "2346",
        source_data_sub_type: "Visa",
        source_data_type: "card",
        success: true
};

// 3. CONSTRUCT THE MERCHANT_ORDER_ID EXACTLY LIKE YOUR CONTROLLER DOES
// Format: user_id---type---plan_id---timestamp
const customMerchantId = `${USER_ID}---SUBSCRIPTION---professional---${Date.now()}`;

// Calculate HMAC
const lexicon = [
        data.amount_cents, data.created_at, data.currency, data.error_occured,
        data.has_parent_transaction, data.id, data.integration_id, data.is_3d_secure,
        data.is_auth, data.is_capture, data.is_refunded, data.is_standalone_payment,
        data.is_voided, data.order_id, data.owner, data.pending,
        data.source_data_pan, data.source_data_sub_type, data.source_data_type,
        data.success
].join('');

const hmac = crypto.createHmac('sha512', HMAC_SECRET).update(lexicon).digest('hex');

// Output JSON for Postman
console.log(JSON.stringify({
        type: "TRANSACTION",
        obj: {
                ...data,
                order: {
                        id: data.order_id,
                        merchant_order_id: customMerchantId // Inject the custom ID
                }
        },
        hmac: hmac
}, null, 2));