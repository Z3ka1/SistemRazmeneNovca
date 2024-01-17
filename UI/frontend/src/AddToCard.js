import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';

const AddBalanceForm = () => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState(''); 
  const [response, setResponse] = useState("");
  const location = useLocation();

  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/account_overview' );
  }

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
          alert("Unesite iznos koji zelite da uplatite!");
          throw new Error(`HTTP error! Status: ${response.status}`);
          
        }
        return response.json();
      })
      .then(responseData => {
        console.log(responseData.message);
        setResponse(responseData.message)
      })
      .catch(error => {
        console.error('Fetch Error:', error);
      });
      navigate('/account_overview' );
  };

  return (
    <div className='div11'>
      {selectedCard && (
        <div className='div2'>
          <p className='p'>Broj kartice: {selectedCard.number}</p>
          <p className='p'>Security Code: {selectedCard.securityCode}</p>
          <p className='p'>Saldo: {selectedCard.balance.toFixed(2)}</p>
          <p className='p'>Valuta: {selectedCard.currency}</p>

        
          <label className='label1'>
            Iznos:
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </label>

          <label>
            <select 
                    value={currency}
                    onChange={(e) => {
                    console.log("Izabrana valuta:", e.target.value);
                    setCurrency(e.target.value);
                }}
                >
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
                <option className='option'>IDR</option>
                <option className='option'>TRY</option>
                <option className='option'>JMD</option>
                <option className='option'>JPY</option>
                <option className='option'>JOD</option>
                <option className='option'>LRD</option>
                <option className='option'>MKD</option>
            </select>
          </label>
          <br></br>
          <p>{response}</p>
          <button className='back-button' onClick={handleBack}>Nazad</button>
          <button onClick={handleDeposit}>Uplati</button>
        </div>
      )}
    </div>
  );
};

export default AddBalanceForm;
