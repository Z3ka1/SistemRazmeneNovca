import React, { useEffect } from 'react';

const Home = () => {
  useEffect(() => {
  
    const user = JSON.parse(localStorage.getItem('user'));

   
    if (user && user.isAdmin) {
      console.log('Korisnik je admin');
    } else if (user) {
      console.log('Korisnik je običan');
    } else {
      console.log('Korisnik nije ulogovan');
    }
  }, []);

  return (
    <div className='Home'>
    </div>
  );
};

export default Home;
