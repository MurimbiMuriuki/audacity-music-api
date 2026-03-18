
const SUBSCRIPTION_STATUS = {
  ACTIVE: 'active',
  EXPIRED: 'expired',
  CANCELLED: 'cancelled'
};

const PLAN_NAMES = {
  MONTHLY: 'Monthly',
  ANNUAL: 'Annual'
};

const PLAN_PRICES = {
  Monthly: {
    amount: 300,       // 300 kobo = 3 NGN (test mode)
    display_amount: 3, // shown as $3 on frontend
    currency: 'NGN',
    interval: 'month',
  },
  Annual: {
    amount: 1600,       // 1600 kobo = 16 NGN (test mode)
    display_amount: 16, // shown as $16 on frontend
    currency: 'NGN',
    interval: 'year',
  }
};

module.exports = {
  SUBSCRIPTION_STATUS,
  PLAN_NAMES,
  PLAN_PRICES
};
