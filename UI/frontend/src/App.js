import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import Home from './Home';
import Navbar from './Navbar'
import AddUserPage from './AddUserPage';
import ProfileOverview from './ProfileOverview';
import AccountOverview from './AccountOverview';

function App() {

  return (
    <Router>
      <div className="App">
        <Navbar/>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/home" element={<Home />} />
          <Route path="/add" element={<AddUserPage />} />
          <Route path='/profile' element={<ProfileOverview />} />
          <Route path='/account_overview' element={<AccountOverview/>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
