import React, { useState, useEffect } from 'react';

const AccountOverview = () => {
  const [cards, setCards] = useState([]);
  const [userId, setUserId] = useState(""); 
  const [showAddCardForm, setShowAddCardForm] = useState(false); 

  useEffect(() => {
    const userFromStorage = localStorage.getItem('user');
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
          <input type="text" name="securityCode" required />
          <label>Saldo:</label>
          <input type="text" name="balance" required />
          <label>Valuta:</label>
          <input type="text" name="currency" required />

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