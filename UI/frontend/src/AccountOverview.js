import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
  }, [userId]); 

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
  <div>
    {!showAddCardForm && (
      
      <div>
        <h1>Pregled računa</h1>

        <table>
          <thead>
            <tr>
              <th>Broj kartice</th>
              <th>Ime vlasnika</th>
              <th>Prezime vlasnika</th>
              <th>Saldo</th>
              <th>Valuta</th>
              <th>Verifikovan</th>
            </tr>
          </thead>
          <tbody>
            {cards.map((card) => (
              <tr key={card.id}>
                <td>{card.number}</td>
                <td>{card.holderFirstName}</td>
                <td>{card.holderLastName}</td>
                <td>{card.balance}</td>
                <td>{card.currency}</td>
                <td>{card.isVerified ? 'Da' : 'Ne'}</td>
                {card.isVerified && (
                <td>
                <button onClick={() => handlePaymentClick(card)}>
                  Uplati na račun
                </button>
              </td>
              
                )}
              </tr>
            ))}
          </tbody>
        </table>

        <button onClick={handleAddCardClick} style={{ float: 'right' }}>
          Dodaj novu karticu
        </button>
      </div>
    )}

    <div>
      {showAddCardForm && (
        <form
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
          <label>Broj kartice:</label>
          <input type="text" name="number" required />
          <label>Security Code:</label>
          <input type="number" maxLength="3" name="securityCode" required  onInput={(e) => (e.target.value = Math.max(0, parseInt(e.target.value)).toString().slice(0, 3))} />
          <label>Saldo:</label>
          <input type="text" name="balance" required />
          <label>Valuta:</label>
          <select name="currency" required >
            <option>EUR</option>
            <option>BAM</option>
            <option>RSD</option>      
            <option>USD</option>
          </select>
          <button type="submit">Dodaj karticu</button>
          <button type="button" onClick={() => setShowAddCardForm(false)}>
            Nazad
          </button>
        </form>
      )}
    </div>
    
  </div>
);

  
};

export default AccountOverview;