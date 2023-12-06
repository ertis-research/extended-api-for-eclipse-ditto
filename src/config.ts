import { Express, urlencoded, json } from 'express';
import cors from 'cors';

export const config = (app: Express) => {
    app.disable('x-powered-by');

    app.use(urlencoded({ extended: false }));
    app.use(json());
    app.use(cors());
}