import "./profile.css"
import React, { useState, useEffect } from 'react';

const ProfileUpdate = () => {
  const [editMode, setEditMode] = useState(false);
  const [editUserData, setEditUserData] = useState({});
  const [message, setMessage] = useState('');
  const [user, setUser] = useState('');

  useEffect(() => {
    const userFromStorage = localStorage.getItem('user');
    const parsedUserFromStorage = JSON.parse(userFromStorage);
    setUser(parsedUserFromStorage);
  }, []);

  const handleInputChange = (e) => {
    setEditUserData({ ...editUserData, [e.target.name]: e.target.value });
  };

  const handleCancelClick = () => {
    setEditMode(false);
    setEditUserData({});
  };

  const handleEditClick = () => {
    setEditMode(true);
    setEditUserData({
      firstName: user.firstName,
      lastName: user.lastName,
      address: user.address,
      city: user.city,
      country: user.country,
      phoneNumber: user.phoneNumber,
      email: user.email,
      password: '',
      newPassword: '',
    });
  };

  const handleUpdateClick = () => {

    if (!editUserData.password || !editUserData.newPassword) {
      alert('Morate uneti obe lozinke. Ako ne zelite da menjate lozinku, potvrdite staru!');
      return; // Prekida izvršavanje funkcije ako lozinke nisu popunjene
    }

    const stariEmail = user.email;

    const data = {
      firstName: editUserData.firstName || user.firstName,
      lastName: editUserData.lastName || user.lastName,
      address: editUserData.address || user.address,
      city: editUserData.city || user.city,
      country: editUserData.country || user.country,
      phoneNumber: editUserData.phoneNumber || user.phoneNumber,
      email: editUserData.email || user.email,
      password: editUserData.password || '',
      newPassword: editUserData.newPassword || '',
      oldEmail: stariEmail,
    };

    //updateUser ocekuje da mu se prosledi njegov sadasnji pasword i njegov novi (ako se ostavi prazno polje ne zeli da ga menja)

    fetch('http://localhost:8000/updateUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((responseData) => {
        console.log("Response Data:", responseData);

        if (responseData.message === 'Vasi podaci uspesno izmenjeni!') {
          setMessage(responseData.message);
          console.log(responseData.user)
          localStorage.setItem('user', JSON.stringify(responseData.user))
          setUser(responseData.user);
          setEditMode(false);
        } else {
          setMessage(responseData.message);
        }
      })
      .catch((error) => {
        console.error("Fetch Error:", error);
      });
  };

  return (
    
    <div className='profile-update-container'>
      
      {
        !editMode && (
      <div className='user-details'>
        <h1 className='profile-update-heading'>Pregled profila</h1>
        <p><strong>Ime:</strong> {user.firstName}</p>
        <p><strong>Prezime:</strong> {user.lastName}</p>
        <p><strong>Adresa:</strong> {user.address}</p>
        <p><strong>Grad:</strong> {user.city}</p>
        <p><strong>Država:</strong> {user.country}</p>
        <p><strong>Broj telefona:</strong> {user.phoneNumber}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <button onClick={handleEditClick}>IZMENI</button>
        {message && <p style={{color:'green'}}>{message}</p>}
      </div>
)}
      {editMode && (
        
       <form className='update-form'>
        <table>
        <th colSpan={2}><h1 className='profile-update-heading'>Izmena profila</h1></th>
          <tbody>
            { !user.isVerified && (
              <>
              <tr>
              <td><label>Ime:</label></td>
              <td><input
                type='text'
                name='firstName'
                value={editUserData.firstName || user.firstName}
                onChange={handleInputChange}
              /></td>
            </tr>
            <tr>
              <td><label>Prezime:</label></td>
              <td><input
                type='text'
                name='lastName'
                value={editUserData.lastName || user.lastName}
                onChange={handleInputChange}
              /></td>
            </tr>
            </>
          )}
            
            <tr>
              <td><label>Adresa:</label></td>
              <td><input
                type='text'
                name='address'
                value={editUserData.address || user.address}
                onChange={handleInputChange}
              /></td>
            </tr>
            <tr>
              <td><label>Grad:</label></td>
              <td><input
                type='text'
                name='city'
                value={editUserData.city || user.city}
                onChange={handleInputChange}
              /></td>
            </tr>
            <tr>
              <td><label>Država:</label></td>
              <td><input
                type='text'
                name='country'
                value={editUserData.country || user.country}
                onChange={handleInputChange}
              /></td>
            </tr>
            <tr>
              <td><label>Broj telefona:</label></td>
              <td><input
                type='text'
                name='phoneNumber'
                value={editUserData.phoneNumber || user.phoneNumber}
                onChange={handleInputChange}
              /></td>
            </tr>
            <tr>
              <td><label>Email:</label></td>
              <td><input
                type='text'
                name='email'
                value={editUserData.email || user.email}
                onChange={handleInputChange}
              /></td>
            </tr>
            <tr>
              <td><label>Trenutna lozinka:</label></td>
              <td><input
                required
                type='password'
                name='password'
                value={editUserData.password || ''}
                onChange={handleInputChange}
              /></td>
            </tr>
            <tr>
              <td><label>Nova lozinka:</label></td>
              <td><input
                required
                type='password'
                name='newPassword'
                value={editUserData.newPassword || ''}
                onChange={handleInputChange}
              /></td>
            </tr>

          </tbody>
        </table>
  <p>
  <button type='button' onClick={handleCancelClick}>NAZAD</button>
  <button type='button' onClick={handleUpdateClick}>IZMENI</button>
  </p>
</form>

      )}

      
    </div>
  );
};

export default ProfileUpdate;
