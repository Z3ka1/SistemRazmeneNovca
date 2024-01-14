import React from 'react'
import { useState } from 'react';
import './addUser.css'


const AddUserPage = () => {
  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    address: '',
    city: '',
    country: '',
    phoneNumber: '',
    email: '',
    password: ''
  });

  const [message, setMessage] = useState('');
  //const [successMessage, setSuccessMessage] = useState('');


  const handleSubmit = (event) => {
    event.preventDefault();
  
    fetch('http://localhost:8000/registerUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
    .then((response) => {
      if (!response.ok) {
        setMessage('Neuspješno dodavanje korisnika');
      }
      setMessage('Korusnik je uspesno dodat')
      return response.json();
     
    })
   
  };
  
  const handleChange = (event) => {
    const { name, value } = event.target;
    setUserData({ ...userData, [name]: value });
  };

  return (
    <div className='add-div'>
      <h2 className='add-header'>Dodavanje novog korisnika</h2>
     
      <form className='add-form' onSubmit={handleSubmit}>
        <input className='add-input' type="text" name="firstName" value={userData.firstName} onChange={handleChange} placeholder="Ime" />
        <input className='add-input' type="text" name="lastName" value={userData.lastName} onChange={handleChange} placeholder="Prezime" />
        <input className='add-input' type="text" name="address" value={userData.address} onChange={handleChange} placeholder="Adresa" />
        <input className='add-input' type="text" name="city" value={userData.city} onChange={handleChange} placeholder="Grad" />
        <input className='add-input' type="text" name="country" value={userData.country} onChange={handleChange} placeholder="Država" />
        <input className='add-input' type="text" name="phoneNumber" value={userData.phoneNumber} onChange={handleChange} placeholder="Broj telefona" />
        <input className='add-input' type="email" name="email" value={userData.email} onChange={handleChange} placeholder="Email" />
        <input className='add-input' type="password" name="password" value={userData.password} onChange={handleChange} placeholder="Lozinka" />

        <button className='add-button' type="submit">Dodaj korisnika</button>
      </form>
     <p>{message}</p>
    </div>
  );
};

export default AddUserPage;