import { Router } from 'express';
import { validationResult } from 'express-validator';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

import * as Controllers from '../controllers/application';

const routes = Router();

routes.post('/', async (req, res) => {
    try {
        const validationErrors = Controllers.validateApplicationData(req.body);
        if (validationErrors.length > 0) {
            return res.status(400).json({ errors: validationErrors });
        }
    
        const app = await Controllers.createApplication(req.body);
        res.json({
            id: app.id,
            message: `Start a new insurance application with id ${app.id}`,
            application: app,
        });
    } catch (error) {
        const errorMessage = (error instanceof Error) ? error.message : 'An unknown error occurred';
        res.status(500).json({ error: errorMessage });    
    }
});

routes.get('/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const application = await Controllers.getApplicationById(id);
      if (application) {
        res.json(application);
      } else {
        res.status(404).json({ message: `Application with ID ${id} not found.` });
      }
    } catch (error) {
        const errorMessage = (error instanceof Error) ? error.message : 'An unknown error occurred';
        res.status(500).json({ error: errorMessage });    
    }
  });

routes.put('/:id', Controllers.updateApplicationValidation, async (req : Request, res : Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const id = parseInt(req.params.id);
    const updateData = req.body;

    try {
        const updatedApplication = await Controllers.updateApplication(id, updateData)
        res.json(updatedApplication);
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError) {
            // Application Does not exist
            if (error.code === 'P2025') {
                return res.status(404).json({ message: `Application with ID ${id} not found.` });
            }
        }
        console.error('Failed to update application:', error);
        res.status(500).json({ message: 'An error occurred while updating the application.' });
    }
});

routes.post('/:id/submit', (req, res) => {
    res.json({
        quote: 123,
        message: `Submit insurance application with id ${req.params.id}`,
    });
});

export default routes;
