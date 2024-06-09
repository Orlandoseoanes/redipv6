import config from "../config.mjs";
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import routerRedes from '../router/Routeripv6.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(morgan("dev"));

app.get('/', (req, res) => {
    res.send('express');
});

app.use(express.json());
app.use('/MEDIA', express.static(path.join(__dirname, 'MEDIA')));
app.use(cors(config.application.cors.server));

app.use("/API/V2", routerRedes); // Corrected mounting paths

export default app;
