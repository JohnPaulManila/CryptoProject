const express = require('express');
const app = express();
const cryptoRoutes = require('./routes/cryptoRoutes');

app.use(express.json());
app.use(express.static('public'));
app.use('/', cryptoRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Crypto API running at http://localhost:${PORT}`);
});