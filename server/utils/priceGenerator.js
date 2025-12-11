// server/utils/priceGenerator.js
// Creates a currentPrices object, updates prices every second, and emits to ticker rooms.

const SUPPORTED_TICKERS = (process.env.SUPPORTED_TICKERS || 'GOOG,TSLA,AMZN,META,NVDA').split(',');

// Seed base prices (arbitrary)
const seedPrices = {
  GOOG: 2900.00,
  TSLA: 800.00,
  AMZN: 3300.00,
  META: 300.00,
  NVDA: 200.00
};

module.exports = function(io) {
  const prices = {};
  SUPPORTED_TICKERS.forEach(t => {
    prices[t] = seedPrices[t] || +(100 + Math.random() * 1000).toFixed(2);
  });

  // Emit initial prices once after short timeout
  setTimeout(() => {
    SUPPORTED_TICKERS.forEach(t => {
      io.to('ticker:' + t).emit('price_update', { ticker: t, price: prices[t], ts: Date.now() });
    });
  }, 200);

  setInterval(() => {
    for (const t of SUPPORTED_TICKERS) {
      // small random percent change -1%..+1%
      const pct = (Math.random() - 0.5) * 0.02;
      const newPrice = +(prices[t] * (1 + pct)).toFixed(2);
      prices[t] = newPrice;
      // Emit to room for this ticker
      io.to('ticker:' + t).emit('price_update', { ticker: t, price: newPrice, ts: Date.now() });
    }
  }, 1000);

  // Optionally expose a getter for the current prices
  return {
    getPrices: () => ({ ...prices })
  };
};
