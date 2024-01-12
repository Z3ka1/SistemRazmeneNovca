import React, { useState } from 'react';


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

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');


  const handleSubmit = (event) => {
    event.preventDefault();
  
    fetch('http://localhost:8000/registerUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.message) {
          // Uspješno dodavanje korisnika
          setErrorMessage('');
          setSuccessMessage('Uspesno ste dodali korisnika.');
        } else {
          // Neuspješno dodavanje korisnika
          setErrorMessage(data.message);
        }
      })
      .catch((error) => {
        console.error('Error adding user:', error);
        setErrorMessage('Došlo je do greške prilikom slanja zahtjeva.');
      });
  };
  
  const handleChange = (event) => {
    const { name, value } = event.target;
    setUserData({ ...userData, [name]: value });
  };

  return (
    <div>
      <h2>Dodavanje novog korisnika</h2>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
      <form onSubmit={handleSubmit}>
        <input type="text" name="firstName" value={userData.firstName} onChange={handleChange} placeholder="Ime" />
        <input type="text" name="lastName" value={userData.lastName} onChange={handleChange} placeholder="Prezime" />
        <input type="text" name="address" value={userData.address} onChange={handleChange} placeholder="Adresa" />
        <input type="text" name="city" value={userData.city} onChange={handleChange} placeholder="Grad" />
        <input type="text" name="country" value={userData.country} onChange={handleChange} placeholder="Država" />
        <input type="text" name="phoneNumber" value={userData.phoneNumber} onChange={handleChange} placeholder="Broj telefona" />
        <input type="email" name="email" value={userData.email} onChange={handleChange} placeholder="Email" />
        <input type="password" name="password" value={userData.password} onChange={handleChange} placeholder="Lozinka" />

        <button type="submit">Dodaj korisnika</button>
      </form>
      {successMessage && <p style={{ color: 'green', align: 'center' }}><strong>{successMessage}</strong></p>}
    </div>
  );
};

export default AddUserPage;