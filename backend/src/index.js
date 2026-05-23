import 'dotenv/config';
import app from './app.js';

const port = Number(process.env.PORT || 5001);
const host = process.env.HOST || '127.0.0.1';
app.listen(port, host, () => {
  console.log(`GATE_SCORE API running on http://${host}:${port}`);
});
