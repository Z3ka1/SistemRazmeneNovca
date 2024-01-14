import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const AddBalanceForm = () => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(''); 
  const location = useLocation();

  useEffect(() => {
    if (location.state && location.state.selectedCard) {
      setSelectedCard(location.state.selectedCard);
    }
  }, [location.state]);

  const handleDeposit = () => {
    console.log(selectedCard.id)
    console.log(amount)
    fetch('http://localhost:8000/addBalance', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cardId: selectedCard.id,
        amount: parseFloat(amount),
        currency: currency,
      }),
    })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
      })
      .then(responseData => {
        console.log(responseData.message);
      })
      .catch(error => {
        console.error('Fetch Error:', error);
      });
  };

  return (
    <div>
      {selectedCard && (
        <div>
          <p>Broj kartice: {selectedCard.number}</p>
          <p>Security Code: {selectedCard.securityCode}</p>
          <p>Saldo: {selectedCard.balance}</p>
          <p>Valuta: {selectedCard.currency}</p>

          <label>
            Iznos:
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>

          <label>
            Valuta:
            <select
                    value={currency}
                    onChange={(e) => {
                    console.log("Izabrana valuta:", e.target.value);
                    setCurrency(e.target.value);
                }}
                >
                <option value="BAM">BAM</option>
                <option value="EUR">EUR</option>
                <option value="RSD">RSD</option>
            </select>
          </label>

          <button onClick={handleDeposit}>Uplati</button>
        </div>
      )}
    </div>
  );
};

export default AddBalanceForm;
