import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './accountoverview.css'

const AccountOverview = () => {
  const [cards, setCards] = useState([]);
  const [userId, setUserId] = useState(""); 
  const [showAddCardForm, setShowAddCardForm] = useState(false); 

  const navigate = useNavigate();

  const userFromStorage = localStorage.getItem('user');

  useEffect(() => {
    console.log(userFromStorage)
    const parsedUserFromStorage = JSON.parse(userFromStorage);
    if (parsedUserFromStorage) {
      setUserId(parsedUserFromStorage.id); 
    }
  }, []);

  useEffect(() => {
    //localStorage.setItem('user', JSON.stringify(responseData.user))

    if (userId) {
      fetch('http://localhost:8000/returnCardsByHolderId', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ holderId: userId }),
      })
        .then((response) => response.json())
        .then((responseData) => {
          console.log("Response Data:", responseData);
          
          setCards(responseData.cards);
        })
        .catch((error) => {
          console.error("Fetch Error:", error);
        });
    }
  }); 

  const handleAddCardClick = () => {
    setShowAddCardForm(true);
  };

  const handlePaymentClick = (selectedCard) => {
    // Prosledi podatke o izabranoj kartici na putanju /add_to_card
    navigate('/add_to_card', { state: { selectedCard } });
  }
  

  const handleAddCardSubmit = (data) => {

    const userFromStorage = localStorage.getItem('user');
    const parsedUserFromStorage = JSON.parse(userFromStorage);
    

    if (parsedUserFromStorage) {
      data.holderId = parsedUserFromStorage.id;
      data.holderFirstName = parsedUserFromStorage.firstName;
      
      data.holderLastName = parsedUserFromStorage.lastName;
      console.log(data.holderLastName)
     
      fetch('http://localhost:8000/addCard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })
        .then((response) => response.json())
        .then((responseData) => {
          console.log("Response Data:", responseData);
        
          fetchCards();
          setShowAddCardForm(false); 
        })
        .catch((error) => {
          console.error("Fetch Error:", error);
        });
    } else {
      console.error("Podaci o ulogovanom korisniku nisu dostupni.");
    }
  };
  
  

  const fetchCards = () => {
    if (userId) {
      fetch('http://localhost:8000/returnCardsByHolderId', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ holderId: userId }),
      })
        .then((response) => response.json())
        .then((responseData) => {
          console.log("Response Data:", responseData);
          setCards(responseData.cards);
        })
        .catch((error) => {
          console.error("Fetch Error:", error);
        });
    }
  };

  

  return (
  <div className='div1'>
    {!showAddCardForm && (
      
      <div className='div2'>
        <h1 className='header'>Pregled računa</h1>

        <table className='table'>
          <thead className='thead'>
            <tr className='tr'>
              <th className='th'>Broj kartice</th>
              <th className='th'>Ime vlasnika</th>
              <th className='th'>Prezime vlasnika</th>
              <th className='th'>Saldo</th>
              <th className='th'>Valuta</th>
              <th className='th'colSpan={2}>Verifikovan</th>
            </tr>
          </thead>
          <tbody className='tbody'>
            {cards.map((card) => (
              <tr className='tr' key={card.id}>
                <td className='td'>{card.number}</td>
                <td className='td'>{card.holderFirstName}</td>
                <td className='td'>{card.holderLastName}</td>
                <td className='td'>{card.balance.toFixed(2)}</td>
                <td className='td'>{card.currency}</td>
                <td className='td'>{card.isVerified ? 'Da' : 'Ne'}</td>
                {card.isVerified && (
                <td>
                <button className='payment-button' onClick={() => handlePaymentClick(card)}>
                  Uplati na račun
                </button>
              </td>
              
                )}
              </tr>
            ))}
          </tbody>
        </table>

        <button className='add-button' onClick={handleAddCardClick} style={{ float: 'right' }}>
          Dodaj novu karticu
        </button>
      </div>
    )}
    <div className='div3'>
      {showAddCardForm && (
        <form className='form'
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const data = {};
            formData.forEach((value, key) => {
              data[key] = value;
            });
            handleAddCardSubmit(data);
          }}
        >
          <label className='label'>Broj kartice:</label>
          <input className='input'  type="number" name="number" maxLength="16" required  onInput={(e) => (e.target.value = Math.max(0, parseInt(e.target.value)).toString().slice(0, 16))}  />
          <label className='label'>Security Code:</label>
          <input className='input' type="number" maxLength="3" name="securityCode" required  onInput={(e) => (e.target.value = Math.max(0, parseInt(e.target.value)).toString().slice(0, 3))} />
          <label className='label'>Saldo:</label>
          <input className='input' type="number" name="balance" required />
          <label className='label'>Valuta:</label>
          <select className='selection' name="currency" required >
            <option className='option'>EUR</option>
            <option className='option'>BAM</option>
            <option className='option'>RSD</option>      
            <option className='option'>USD</option>
            <option className='option'>BGN</option>
            <option className='option'>CAD</option>
            <option className='option'>CNY</option>
            <option className='option'>CZK</option>
            <option className='option'>DKK</option>
            <option className='option'>EGP</option>
            <option className='option'>HNL</option>
            <option className='option'>HUF</option>
            <option className='option'>INR</option>
            <option className='option'>TRY</option>
            <option className='option'>ILS</option>
            <option className='option'>JMD</option>
            <option className='option'>JPY</option>
            <option className='option'>JOD</option>
            <option className='option'>LRD</option>
            <option className='option'>MKD</option>
          </select>
          <button className='add-card-button' type="submit">Dodaj karticu</button>
          <button className='back-button' type="button" onClick={() => setShowAddCardForm(false)}>
            Nazad
          </button>
        </form>
      )}
    </div>
  
    
  </div>
);

  
};

export default AccountOverview;