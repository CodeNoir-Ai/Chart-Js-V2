const express = require('express');
var yahooFinance = require('yahoo-finance');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());

app.get('/stockdata', async (req, res) => {
    try {
        const quotes = await yahooFinance.historical({
            symbol: 'AAPL',
            from: '2023-01-01',
            to: '2023-07-12',
            period: 'd'
        });

        const formattedData = quotes.map(quote => ({
            date: quote.date,
            open: quote.open,
            high: quote.high,
            low: quote.low,
            close: quote.close,
            volume: quote.volume,
            adjClose: quote.adjClose // adjusted close
        }));

        res.json(formattedData);
    } catch (error) {
        res.status(500).send("Error fetching data");
    }
});

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});