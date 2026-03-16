
const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled'
};

const PLAN_NAMES = {
  MONTHLY: 'Monthly',
  ANNUAL: 'Annual'
};

// const PLAN_PRICES = {
//   Monthly: {
//     amount: 3,
//     currency: 'NGN',
//     interval: 'month',
//     description: 'Billed monthly via Paystack',
//     recommended: false,
//     savings: null
//   },
//   Annual: {
//     amount: 16,
//     currency: 'NGN',
//     interval: 'year',
//     description: '~$1.33/month · Billed annually',
//     recommended: true,
//     savings: 'SAVE 56%'
//   }
// };

const PLAN_PRICES = {
  Monthly: {
    amount: 3,        // $3 display ke liye
    amount_ngn: 5000, // NGN mein test ke liye (5000 kobo = 50 Naira)
    currency: 'NGN',
  },
  Annual: {
    amount: 16,
    amount_ngn: 10000, // NGN mein test ke liye
    currency: 'NGN',
  }
};

module.exports = {
  SUBSCRIPTION_STATUS,
  PLAN_NAMES,
  PLAN_PRICES
};