import db from '../db';
import { body } from 'express-validator';
import { Prisma } from '@prisma/client';

interface VehicleData {
    VIN: string;
    year: number;
    make: string;
    model: string;
}
  
interface ApplicationData {
    firstName: string;
    lastName: string;
    dob: string;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    vehicles: string;
}

export function validateApplicationData(data: ApplicationData) {
    const errors = [];
    
    // Validate name
    if (!data.firstName || !data.lastName) {
        errors.push("First and Last name are required.");
    }

    // Validate Date of Birth
    const dob = new Date(data.dob);

    if (!data.dob) {
      errors.push("Missing DOB");
    }


    if (isNaN(dob.getTime())) {
        errors.push("Malformed date of birth.");
    } else {
        const today = new Date()
        const cutoffDate = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
        if(dob > cutoffDate) {
            errors.push("Applicant too young.");
        }
    }

    // Validate Address
    if (!data.street || !data.city || !data.state || !data.zipCode || isNaN(Number(data.zipCode))) {
        errors.push("Address is incomplete or ZipCode is not numeric.");
    }

    // Vehicles validation and parsing
    let vehicles: VehicleData[] = [];
    try {
        vehicles = JSON.parse(data.vehicles);
    } catch (error) {
        errors.push("Failed to parse vehicles data. Ensure it is valid JSON.");
        return errors;
    }
    
    if (vehicles.length < 1 || vehicles.length > 3) {
        errors.push("Vehicle count must be between 1 and 3.");
    } else {
        vehicles.forEach(vehicle => {
            if (!vehicle.VIN || isNaN(Number(vehicle.year)) || vehicle.year < 1985 || vehicle.year > new Date().getFullYear() + 1 || !vehicle.make || !vehicle.model) {
                errors.push(`Vehicle with VIN ${vehicle.VIN} has invalid data.`);
            }
        });
    }

    return errors;
}

export async function createApplication(data: ApplicationData) {    
    const application = await db.application.create({
        data: {
            firstName: data.firstName,
            lastName: data.lastName,
            dob: data.dob,
            street: data.street,
            city: data.city,
            state: data.state,
            zipCode: data.zipCode,
            vehicles: data.vehicles,
        },
    });

    return application;
}

export async function getApplicationById(id: string) {    
    const application = await db.application.findUnique({
        where: { id: parseInt(id) },
    });

    return application;
}


//TODO: ideally these rules should be reused in the POST/ code path to avoid duplication.
export const updateApplicationValidation = [
    body('firstName').optional().isString().withMessage('First name must be a string'),
    body('lastName').optional().isString().withMessage('Last name must be a string'),
    body('dob').optional().isString().withMessage('Date of birth must be a valid date')
    .custom((value) => {
      const dob = new Date(value);
      const today = new Date();
      const cutoffDate = new Date(today.getFullYear() - 16, today.getMonth(), today.getDate());
      if (dob > cutoffDate) {
        throw new Error("Applicant too young.");
      }
      return true;
    }), 
    body('street').optional().not().isEmpty().withMessage('Street is required.'),
    body('city').optional().not().isEmpty().withMessage('City is required.'),
    body('state').optional().not().isEmpty().withMessage('State is required.'),
    body('zipCode').optional().isNumeric().withMessage('ZipCode must be numeric'),
    body('vehicles').optional().custom((value) => {
      // Attempt to parse the vehicles JSON string
      let vehicles;
      try {
          vehicles = JSON.parse(value);
      } catch (error) {
          throw new Error('Vehicles must be a valid JSON string.');
      }

      // Now that we have parsed vehicles, validate its structure
      if (!Array.isArray(vehicles) || vehicles.length < 1 || vehicles.length > 3) {
          throw new Error('Vehicle count must be between 1 and 3.');
      }

      vehicles.forEach((vehicle) => {
          if (!vehicle.VIN || isNaN(Number(vehicle.year)) || vehicle.year < 1985 || 
              vehicle.year > new Date().getFullYear() + 1 || !vehicle.make || !vehicle.model) {
              throw new Error(`Vehicle with VIN ${vehicle.VIN} has invalid data.`);
          }
      });

      return true;
    }),
  ];
  
  interface UpdateApplicationData {
    firstName?: string;
    lastName?: string;
    dob?: string;
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    vehicles?: string;
  }
  
  export async function updateApplication(id: number, updateData: UpdateApplicationData) {
    const prismaData: Prisma.ApplicationUpdateInput = {
      ...updateData,
      ...(updateData.vehicles !== undefined && {
        vehicles: updateData.vehicles,
      }),
    };
  
    try {
      const updatedApplication = await db.application.update({
        where: { id },
        data: prismaData,
      });
      return updatedApplication;
    } catch (error) {
      throw error;
    }
  }