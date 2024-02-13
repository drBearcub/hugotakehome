import { Router } from 'express';

import * as Controllers from '../controllers/application';

const routes = Router();

routes.post('/', async (req, res) => {
    const app = await Controllers.createApplication();

    res.json({
        message: `Start a new insurance application with id ${app.id}`,
    });
});

routes.get('/:id', (req, res) => {
    res.json({
        message: `Get insurance application with id ${req.params.id}`,
    });
});

routes.put('/:id', (req, res) => {
    res.json({
        message: `Update insurance application with id ${req.params.id}`,
    });
});

routes.post('/:id/submit', (req, res) => {
    res.json({
        message: `Submit insurance application with id ${req.params.id}`,
    });
});

export default routes;
