import express, { Request, Response } from 'express';
import routes from './routes';

const PORT = process.env.API_PORT || 8000;

const app = express();

app.use(express.json());

const cors = require('cors');
app.use(cors());

app.get('/ping', (req: Request, res: Response) => {
    res.json({ message: 'pong' });
});

app.use(routes);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
