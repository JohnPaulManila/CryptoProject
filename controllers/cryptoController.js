const axios = require('axios');
const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
let lastPrices = {};

module.exports = {
  getCoinList: async (req, res) => {
    try {
      const { data } = await axios.get(`${COINGECKO_BASE}/coins/list`);
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch coin list', details: err.message });
    }
  },

  getCryptoPrice: async (req, res) => {
    try {
      const symbol = req.params.symbol.toLowerCase();
      const coinList = await axios.get(`${COINGECKO_BASE}/coins/list`);
      const match = coinList.data.find(c => c.symbol === symbol);
      if (!match) return res.status(404).json({ error: 'Symbol not found' });

      const price = await axios.get(`${COINGECKO_BASE}/simple/price`, {
        params: { ids: match.id, vs_currencies: 'usd' },
      });
      res.json({ symbol: symbol.toUpperCase(), price: price.data[match.id].usd });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch price', details: err.message });
    }
  },

  postPriceAlert: async (req, res) => {
    const { symbol, threshold } = req.body;
    try {
      const coinList = await axios.get(`${COINGECKO_BASE}/coins/list`);
      const match = coinList.data.find(c => c.symbol === symbol.toLowerCase());
      if (!match) return res.status(404).json({ error: 'Symbol not found' });

      const priceRes = await axios.get(`${COINGECKO_BASE}/simple/price`, {
        params: { ids: match.id, vs_currencies: 'usd' },
      });
      const currentPrice = priceRes.data[match.id].usd;

      const lastPrice = lastPrices[symbol] || currentPrice;
      lastPrices[symbol] = currentPrice;

      const alert = Math.abs(currentPrice - lastPrice) >= threshold;
      res.json({ symbol, currentPrice, alert });
    } catch (err) {
      res.status(500).json({ error: 'Failed to process webhook alert', details: err.message });
    }
  },

  convertCrypto: async (req, res) => {
    const { from, to } = req.query;
    try {
      const coinList = await axios.get(`${COINGECKO_BASE}/coins/list`);
      const fromCoin = coinList.data.find(c => c.symbol === from.toLowerCase());
      const toCoin = coinList.data.find(c => c.symbol === to.toLowerCase());
      if (!fromCoin || !toCoin) return res.status(404).json({ error: 'Invalid symbol(s)' });

      const prices = await axios.get(`${COINGECKO_BASE}/simple/price`, {
        params: { ids: `${fromCoin.id},${toCoin.id}`, vs_currencies: 'usd' },
      });

      const fromPrice = prices.data[fromCoin.id].usd;
      const toPrice = prices.data[toCoin.id].usd;
      const rate = fromPrice / toPrice;
      res.json({ from: from.toUpperCase(), to: to.toUpperCase(), rate });
    } catch (err) {
      res.status(500).json({ error: 'Failed to convert currency', details: err.message });
    }
  },

  getHistory: async (req, res) => {
    const { symbol } = req.params;
    try {
      const coinList = await axios.get(`${COINGECKO_BASE}/coins/list`);
      const match = coinList.data.find(c => c.symbol === symbol.toLowerCase());
      if (!match) return res.status(404).json({ error: 'Symbol not found' });

      const marketData = await axios.get(`${COINGECKO_BASE}/coins/${match.id}/market_chart`, {
        params: { vs_currency: 'usd', days: '7', interval: 'daily' },
      });
      res.json(marketData.data);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch history', details: err.message });
    }
  },

  getTopMovers: async (req, res) => {
    try {
      const { data } = await axios.get(`${COINGECKO_BASE}/coins/markets`, {
        params: { vs_currency: 'usd', order: 'market_cap_desc', per_page: 100, page: 1, price_change_percentage: '24h' },
      });
      const sorted = [...data].sort((a, b) => b.price_change_percentage_24h - a.price_change_percentage_24h);
      res.json({ top_gainers: sorted.slice(0, 5), top_losers: sorted.slice(-5).reverse() });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch movers', details: err.message });
    }
  },

  getNewListings: async (req, res) => {
    try {
      const { data } = await axios.get(`${COINGECKO_BASE}/coins/markets`, {
        params: { vs_currency: 'usd', order: 'market_cap_asc', per_page: 10, page: 1 },
      });
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch new listings', details: err.message });
    }
  },

  getTrending: async (req, res) => {
    try {
      const { data } = await axios.get(`${COINGECKO_BASE}/search/trending`);
      res.json(data.coins);
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch trending tokens', details: err.message });
    }
  },
};