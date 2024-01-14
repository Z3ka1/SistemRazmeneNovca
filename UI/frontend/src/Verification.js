import React, { useState, useEffect } from 'react';
import './verification.css'

const Verification = () => {
  const [cards, setCards] = useState([]);

  useEffect(() => {
    console.log('Pokušavam dohvatiti kartice...');
    fetch('http://localhost:8000/returnAllCards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((responseData) => {
        console.log("Response Data:", responseData);
        setCards(responseData.cards);
      })
      .catch((error) => {
        console.error("Fetch Error:", error);
      });
  });

  const handleVerifyClick = (cardId, holderId) => {
    console.log(`Verifikacija kartice sa ID: ${cardId} za korisnika sa ID: ${holderId}`);

    fetch('http://localhost:8000/verifyCard', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cardId: cardId,
        holderId: holderId,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then((responseData) => {
        console.log("Response Data:", responseData);
      })
      .catch((error) => {
        console.error("Fetch Error:", error);
      });
  };

  return (
    <div className='ver-div'>
      <h1 className='ver-header'>Verifikacija</h1>
      <table className='ver-table'>
        <thead className='ver-thead'>
          <tr className='ver-tr'>
            <th className='ver-th'>Broj kartice</th>
            <th>Ime vlasnika</th>
            <th>Prezime vlasnika</th>
            <th>Saldo</th>
            <th>Valuta</th>
            <th>Verifikovan</th>
            <th>Akcija</th>
          </tr>
        </thead>
        <tbody className='ver-tbody'>
          {cards.map((card) => (
            <tr key={card.id} className='ver-tr'>
              <td>{card.number}</td>
              <td>{card.holderFirstName}</td>
              <td>{card.holderLastName}</td>
              <td>{card.balance}</td>
              <td>{card.currency}</td>
              <td>{card.isVerified ? 'Da' : 'Ne'}</td>
              <td>
                <button className='ver-button' onClick={() => handleVerifyClick(card.id, card.holderId)}>
                  {card.isVerified ? 'Verifikovan' : 'Verifikuj'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Verification;
