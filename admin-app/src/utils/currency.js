export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(amount);
};

export const parseAmount = (amount) => {
  if (typeof amount === 'string') {
    // Remove currency symbol, commas and spaces
    return parseFloat(amount.replace(/[₹,\s]/g, ''));
  }
  return amount;
};
