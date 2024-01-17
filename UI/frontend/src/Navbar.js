import React from 'react';
import { useNavigate } from 'react-router-dom';
import './navbar.css';

const Navbar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
   
    localStorage.removeItem('user');
 
    const user = localStorage.getItem('user');
    console.log(user);
    navigate('/login'); 
  };

  const user = JSON.parse(localStorage.getItem('user'));
  const isAdmin = user && user.isAdmin === true; 
  const isUser = user && user.isAdmin === false;

  console.log('User:', user);
  console.log('isAdmin:', isAdmin);

  return (
    <nav className="navbar">
      <h1>Sistem za razmenu novca</h1>
      <div className="links">
        {isAdmin && (
          <>
            <a href="/profile">Pregled profila</a>
            <a href="/add">Dodaj korisnika</a>
            <a href="/verification">Verifikacija korisnickih naloga</a>
            <a href="/live">Live pracenje transakcije</a>
          </>
        )}
        {isUser && (
          <>
            <a href='/profile'>Pregled profila</a>
            <a href='/account_overview'>Pregled racuna</a>
            <a href='/payment'>Nova transakcija</a>
            <a href='/currency_conversion'>Konverzija valuta</a>
          </>
        )}
        {user && <button onClick={handleLogout}>Odjava</button>}
      </div>
    </nav>
  );
};

export default Navbar;
