import React, { useState } from 'react';
import './login.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState(false);


  const handleLogin = (event) => {
    event.preventDefault();

    fetch('http://localhost:8000/returnUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }), 
    })
      .then((res) => res.json())
      .then((data) => {
       
        if (data.user) {
          // Ako server vrati korisnika, sačuvaj podatke korisnika u lokalnom skladištu
          localStorage.setItem('user', JSON.stringify(data.user));
          console.log(data)
          window.location.href = '/profile';
        } else {
          setLoginError(true);
        }
      })
      .catch((error) => {
        console.log(error);
      });
  };

  return (
    <div className='login-div'>
      <h2 className='header-login'>Prijava korisnika</h2>
      <form className='form-login' onSubmit={handleLogin}>
        <label className='label-login'>
          Email:
          <input 
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </label>
        <br />
        <label className='label-login'> 
          Lozinka: 
          <input 
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </label>
        <br />
        <button className='button-login' type="submit">Prijavi se</button>
        {loginError && <p style={{ color: 'red' }}>Pogrešno korisničko ime ili lozinka.</p>}
      </form>
    </div>
  );
};

export default LoginPage;
