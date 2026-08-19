import express from 'express';
const app = express();
app.use('/api', (req, res) => {
  res.send('API hit for ' + req.url);
});
app.use((req, res) => res.send('Fallback'));
app.listen(3002, () => console.log('Listening'));
