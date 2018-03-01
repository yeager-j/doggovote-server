import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';

// App
import routes from './routes';

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

// Set port
const port = process.env.PORT || '3000';
app.set('port', port);

// Routes
routes(app);

// Server
app.listen(port, () => console.log(`Server running on localhost:${port}`));

