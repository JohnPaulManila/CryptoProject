const express = require('express');
const router = express.Router();
const cryptoController = require('../controllers/cryptoController');

router.get('/coins/list', cryptoController.getCoinList);
router.get('/price/:symbol', cryptoController.getCryptoPrice);
router.post('/webhook/price-alert', cryptoController.postPriceAlert);
router.get('/convert', cryptoController.convertCrypto);
router.get('/history/:symbol', cryptoController.getHistory);
router.get('/top/movers', cryptoController.getTopMovers);
router.get('/new/listings', cryptoController.getNewListings);
router.get('/trending', cryptoController.getTrending);

module.exports = router;