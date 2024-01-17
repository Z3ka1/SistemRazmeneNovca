import React from 'react';
import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './LoginPage';
import Home from './Home';
import Navbar from './Navbar'
import AddUserPage from './AddUserPage';
import ProfileOverview from './ProfileOverview';
import AccountOverview from './AccountOverview';
import Verification from './Verification';
import AddToCard from './AddToCard';
import TransactionForm from './TransactionForm';
import TransactionHistory from './TransactionHistory';
import CurrencyConversion from './CurrencyConversion';

function App() {
  const isLoggedIn = sessionStorage.getItem('user');

  useEffect(() => {
    sessionStorage.removeItem('user');
  }, []);

  return (
    <Router>
      <div className="App">
        <Navbar/>
        <Routes>
        <Route path="/" element={<Navigate replace to="/login" />} />
          <Route path="/login" element={isLoggedIn ? <Navigate replace to="/profile" /> : <LoginPage />} />
          <Route path="/add" element={<AddUserPage />} />
          <Route path='/profile' element={<ProfileOverview />} />
          <Route path='/account_overview' element={<AccountOverview/>} />
          <Route path='/verification' element={<Verification/>}/>
          <Route path='/add_to_card' element={<AddToCard/>}/>
          <Route path='/payment' element={<TransactionForm/>} />
          <Route path='/live' element={<TransactionHistory/>} />
          <Route path='/currency_conversion' element={<CurrencyConversion/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
