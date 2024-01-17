import React, { useState, useEffect } from 'react';

const CurrencyConversion = () => {
  
    const [cards, setCards] = useState([]);
    const [selectedCurrency, setSelectedCurrency] = useState("EUR");
    const [userId, setUserId] = useState(""); 
  
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
        fetch('http://localhost:8000/returnVerifiedCardsByHolderId', {
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
  
    const handleCurrencyConversion = (cardId) => {
      fetch('http://localhost:8000/convertCardCurrency', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ cardId: cardId, currency: selectedCurrency }),
      })
        .then((response) => response.json())
        .then(() => {
          console.log("Konverzija uspešna.");
          updateCardBalance(cardId);
        })
        .catch((error) => {
          console.error("Fetch Error:", error);
        });
    };
  
    const updateCardBalance = (cardId) => {
      // Ažuriranje stanja kartica
      const updatedCards = cards.map((card) => {
        if (card.id === cardId) {
          return {...card, currency: selectedCurrency};
        }
        return card;
      });
      setCards(updatedCards);
    };
    
  return (
    <div className='div'>
      <h1 className='h'>Verifikovane Kartice</h1>
      <table className='table'>
        <thead className='thead'>
          <tr className='tr'>
            <th className='th'>Broj Kartice</th>
            <th className='th'>Vlasnik</th>
            <th className='th'>Saldo</th>
            <th className='th'>Valuta</th>
            <th className='th'>Konverzija</th>
          </tr>
        </thead>
        <tbody className='tbody'>
          {cards.map((card) => (
            <tr className='tr' key={card.id}>
              <td className='td'>{card.number}</td>
              <td className='td'>{card.holderFirstName} {card.holderLastName}</td>
              <td className='td'>{card.balance.toFixed(2)}</td>
              <td className='td'>{card.currency}</td>
              <td className='td'>
                <select className='option' onChange={(e) => setSelectedCurrency(e.target.value)}>
                    <option className='option' value="EUR">EUR</option>
                    <option className='option' value="BAM">BAM</option>
                    <option className='option' value="RSD">RSD</option>
                    <option className='option' value="USD">USD</option>
                    <option className='option' value="BGN">BGN</option>
                    <option className='option' value="CAD">CAD</option>
                    <option className='option' value="CNY">CNY</option>
                    <option className='option' value="CZK">CZK</option>
                    <option className='option' value="DKK">DKK</option>
                    <option className='option' value="EGP">EGP</option>
                    <option className='option' value="HNL">HNL</option>
                    <option className='option' value="HUF">HUF</option>
                    <option className='option' value="INR">INR</option>
                    <option className='option' value="IDR">IDR</option>
                    <option className='option' value="TRY">TRY</option>
                    <option className='option' value="JMD">JMD</option>
                    <option className='option' value="JPY">JPY</option>
                    <option className='option' value="JOD">JOD</option>
                    <option className='option' value="LRD">LRD</option>
                    <option className='option' value="MKD">MKD</option>
                </select>
                <button className='button' onClick={() => handleCurrencyConversion(card.id)}>
                  Konvertuj u {selectedCurrency}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CurrencyConversion;
