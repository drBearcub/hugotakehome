import React, { useState ,useEffect} from 'react';
import axios from 'axios'; 
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import { useLocation, useNavigate} from 'react-router-dom';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

interface Vehicle {
    VIN: string;
    year: number;
    make: string;
    model: string;
}

interface FormData {
    firstName: string;
    lastName: string;
    dob: Date | null;
    street: string;
    city: string;
    state: string;
    zipCode: string;
    vehicles: Vehicle[];
}

const apiUrl = 'http://localhost:8000/applications';

function Application() {
    const [formData, setFormData] = useState<FormData>({
        firstName: '',
        lastName: '',
        dob: null,
        street: '',
        city: '',
        state: '',
        zipCode: '',
        vehicles: [],
    });

    const [errors, setErrors] = useState<string[]>([]);
    const [quote, setQuote] = useState<string>();

    const navigate = useNavigate();
    let query = useQuery();
    let id = query.get('id');

    //Handles API errors
    const handleError = (error: unknown) => {
        if (axios.isAxiosError(error) && error.response) {
            const backendErrors = error.response.data.errors;
            if (backendErrors && Array.isArray(backendErrors)) {
                const errorMessages = backendErrors.map(err => JSON.stringify(err));
                setErrors(errorMessages);
            } else {
                setErrors(['An unexpected error occurred.']);
            }
        } else {
            setErrors(['An unexpected error occurred.']);
        }
    };
    
    //If id is present in the search param, load up an existing application
    useEffect(() => {
        const fetchApplicationData = async () => {
            if (id) {
                try {
                    const response = await axios.get(`${apiUrl}/${id}`);
                    const appData = response.data;
                    const vehicles: Vehicle[] = appData.vehicles ? JSON.parse(appData.vehicles) : [];

                    setFormData({
                        firstName: appData.firstName || '',
                        lastName: appData.lastName || '',
                        dob: appData.dob ? new Date(appData.dob) : null,
                        street: appData.street || '',
                        city: appData.city || '',
                        state: appData.state || '',
                        zipCode: appData.zipCode || '',
                        vehicles,
                    });
                    setErrors([])
                } catch (error) {
                    handleError(error);
                }
            }
        };
    
        fetchApplicationData();
    }, [id]);

    const handleChange = (e : React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleChangeDate = (date : Date) => {
        setFormData({ ...formData, dob: date });
    };

    const handleCreateOrUpdateApplication = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        
        const body = {
            ...formData,
            vehicles: JSON.stringify(formData.vehicles),
        };
    
        try {
            if (id) {
                await axios.put(`${apiUrl}/${id}`, body);
                alert('Application updated successfully');
            } else {
                await axios.post(apiUrl, body);
                const response = await axios.post(apiUrl, body);
                const newApplicationId = response.data.id;
                alert(`Application created successfully with ID: ${newApplicationId}`);
                navigate(`/application?id=${newApplicationId}`);
                setFormData({
                    firstName: '',
                    lastName: '',
                    dob: null,
                    street: '',
                    city: '',
                    state: '',
                    zipCode: '',
                    vehicles: [],
                });
            }
            setErrors([])
        } catch (error) {
            handleError(error);
        }       
    };

    const handleSubmitApplication = async (e: { preventDefault: () => void; }) => {
        e.preventDefault();
        
        const body = {
            ...formData,
            vehicles: JSON.stringify(formData.vehicles),
        };
    
        try {
            if (id) {
                const response = await axios.post(`${apiUrl}/${id}/submit`, body);
                const quote = response.data.quote;
                setQuote(quote)
                alert('Application submitted successfully');
            } 
            setErrors([])
        } catch (error) {
            handleError(error);
        }       
    };

    const title = !id ? "New Application" : "Modify Existing Application with ID : " + id 
    const createOrUpdate = !id ? "Create Application" : "Update Application"

    const errorDisplay = errors.length > 0 && (
        <div style={{ color: 'red' }}>
            <div>Errors</div>
            <ul>
                {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                ))}
            </ul>
        </div>
    );

    const quoteDisplay = quote && (
        <div style={{ color: 'green' }}>
            {`your quote is ${quote} dollars`}
        </div>
    )

    //vehicles section
    const handleVehicleChange = (index: number, field: string, value: string) => {
        const updatedVehicles = [...formData.vehicles];
        const updatedVehicle = { ...updatedVehicles[index], [field]: value };
        updatedVehicles[index] = updatedVehicle;
        setFormData({ ...formData, vehicles: updatedVehicles });
    };

    const handleAddVehicle = () => {
        setFormData({
            ...formData,
            vehicles: [...formData.vehicles, { VIN: '', year: 0, make: '', model: '' }]
        });
    };

    const handleRemoveVehicle = (index: number) => {
        const updatedVehicles = formData.vehicles.filter((_, i) => i !== index);
        setFormData({ ...formData, vehicles: updatedVehicles });
    };

    const vehiclesSection = (            
        <div>
            {Array.isArray(formData.vehicles) && formData.vehicles.map((vehicle, index) => (
            <div key={index}>
                <>Vehicle</>
                <input
                    type="text"
                    value={vehicle.VIN}
                    onChange={(e) => handleVehicleChange(index, 'VIN', e.target.value)}
                    placeholder="VIN"
                />            
                <input
                    type="text"
                    value={vehicle.year}
                    onChange={(e) => handleVehicleChange(index, 'year', e.target.value)}
                    placeholder="year"
                />                
                <input
                    type="text"
                    value={vehicle.make}
                    onChange={(e) => handleVehicleChange(index, 'make', e.target.value)}
                    placeholder="make"
                />                
                <input
                    type="text"
                    value={vehicle.model}
                    onChange={(e) => handleVehicleChange(index, 'model', e.target.value)}
                    placeholder="model"
                />
                <button type="button" onClick={() => handleRemoveVehicle(index)}>Remove Vehicle</button>
            </div>
        ))}
        <button type="button" onClick={handleAddVehicle}>Add Vehicle</button>
        </div>
    )

    return (
        <div>
            <h1>Super cool insurance application :D </h1>
            {errorDisplay}
            {quoteDisplay}
            <h2>{title}</h2>
            <form onSubmit={handleCreateOrUpdateApplication}>
            <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="First Name" />
            <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Last Name" />
            <DatePicker
                selected={formData.dob}
                onChange={handleChangeDate}
                dateFormat="yyyy-MM-dd"
                placeholderText="Date of Birth"
            />
            <input type="text" name="street" value={formData.street} onChange={handleChange} placeholder="Street" />
            <input type="text" name="city" value={formData.city} onChange={handleChange} placeholder="City" />
            <input type="text" name="state" value={formData.state} onChange={handleChange} placeholder="State" />
            <input type="text" name="zipCode" value={formData.zipCode} onChange={handleChange} placeholder="Zip Code" /> 
            {vehiclesSection}
            <button type="submit">{createOrUpdate}</button>
            <button onClick={handleSubmitApplication}>Submit Application</button>
            </form>
        </div>
    );
}

export default Application;
