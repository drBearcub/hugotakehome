import request from 'supertest';
import express from 'express';
import routes from './routes'; 

const app = express();
app.use(express.json());
app.use(routes);


describe('Post Get Update integration tests', () => {
  let createdApplicationId: number;
  it('should create a new insurance application and return the app id', async () => {
    const applicationPayload = {
      firstName: "John",
      lastName: "Doe",
      dob: "2000-01-01", 
      street: "123 Main St",
      city: "Anytown",
      state: "Anystate",
      zipCode: "12345", 
      vehicles: "[{\"VIN\":\"1HGBH41JXMN109188\",\"year\":2022,\"make\":\"Toyota\",\"model\":\"Camry\"}]"
    };

    const response = await request(app)
      .post('/applications')
      .send(applicationPayload);

    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('message');
    expect(response.body.message).toContain('Start a new insurance application with id');
    createdApplicationId = response.body.id;
  });


  
  it('should retrieve the created insurance application by ID', async () => {
    if (!createdApplicationId) {
      throw new Error('Application ID not set from POST /applications response.');
    }

    const getResponse = await request(app)
      .get(`/applications/${createdApplicationId}`);


    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.body).toHaveProperty('id', createdApplicationId);
    expect(getResponse.body).toHaveProperty('dob', "2000-01-01");
    expect(getResponse.body.vehicles).toEqual("[{\"VIN\":\"1HGBH41JXMN109188\",\"year\":2022,\"make\":\"Toyota\",\"model\":\"Camry\"}]");
  });

  it('should update an existing insurance application and verify the update', async () => {
    const updatePayload = {
      firstName: "David", 
      vehicles: "[{\"VIN\":\"1HGBH41JXMN109188\",\"year\":2022,\"make\":\"Toyota\",\"model\":\"Camry\"}]"
    };


    const putResponse = await request(app)
      .put(`/applications/${createdApplicationId}`)
      .send(updatePayload);


    expect(putResponse.statusCode).toBe(200);
    expect(putResponse.body).toHaveProperty('firstName', 'David'); 
    expect(putResponse.body.vehicles).toEqual("[{\"VIN\":\"1HGBH41JXMN109188\",\"year\":2022,\"make\":\"Toyota\",\"model\":\"Camry\"}]");

    const getResponse = await request(app).get(`/applications/${createdApplicationId}`);
    expect(getResponse.statusCode).toBe(200);
    expect(getResponse.body).toHaveProperty('firstName', 'David');
  });


});