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
    .then((res) => res.json())
      .then((data) => {
        setMessage(data.message)
      })
      .catch((error) => {
        console.log(error);
      });
   
  };
  
  const handleChange = (event) => {
    const { name, value } = event.target;
    setUserData({ ...userData, [name]: value });
  };

  return (
    <div className='add-div'>
      <h2 className='add-header'>Dodavanje novog korisnika</h2>
     
      <form className='add-form' onSubmit={handleSubmit}>
        <input className='add-input' type="text" name="firstName" value={userData.firstName} onChange={handleChange} placeholder="Ime" required />
        <input className='add-input' type="text" name="lastName" value={userData.lastName} onChange={handleChange} placeholder="Prezime" required />
        <input className='add-input' type="text" name="address" value={userData.address} onChange={handleChange} placeholder="Adresa" required />
        <input className='add-input' type="text" name="city" value={userData.city} onChange={handleChange} placeholder="Grad" required />
        <input className='add-input' type="text" name="country" value={userData.country} onChange={handleChange} placeholder="Država" required />
        <input className='add-input' type="text" name="phoneNumber" value={userData.phoneNumber} onChange={handleChange} placeholder="Broj telefona" required />
        <input className='add-input' type="email" name="email" value={userData.email} onChange={handleChange} placeholder="Email" required/>
        <input className='add-input' type="password" name="password" value={userData.password} onChange={handleChange} placeholder="Lozinka" required />

        <button className='add-button' type="submit">Dodaj korisnika</button>
      </form>
     <p>{message}</p>
    </div>
  );
};

export default AddUserPage;