import React, { useState } from 'react';
import { useEffect } from 'react';
import './transaction.css'

const TransactionForm = () => {
    const [formData, setFormData] = useState({
        senderCardNumber: '',
        recipientCardNumber: '',
        amount: '',
        recipientEmail: '',
        recipientFirstName: '',
        recipientLastName: ''
    });
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    //////////////////////////////////////

    const [cards, setCards] = useState([]);
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

    /////////////////////////////////////

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        fetch('http://localhost:8000/newTransaction', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        })
        .then((res) => {
            if (!res.ok) {
                throw res;
            }
            return res.json();
        })
        .then((data) => {
            setMessage("Uspesno izvrsena transakcija!");
            setError(''); 
            setFormData({
                senderCardNumber: '',
                recipientCardNumber: '',
                amount: '',
                recipientEmail: '',
                recipientFirstName: '',
                recipientLastName: ''
            }); 
        })
        .catch((res) => {
            res.json().then((data) => {
                setError(data.message);
                setMessage('');
            }).catch((error) => {
                console.error('Error:', error);
                setMessage('');
                setError('Došlo je do greške pri obradi zahteva.');
            });
        });
    };

    return (
        <div className='container'>
            <h2 className="header">Nova Transakcija</h2>
            {error && <p className="error">{error}</p>}
            <p className="message">{message}</p>
            <form className="form" onSubmit={handleSubmit}>
            <select className='selection-cards'
                    name="senderCardNumber"
                    value={formData.senderCardNumber}
                    onChange={handleChange}
                    placeholder="Broj kartice pošiljaoca"   
                >
            {cards.map((card) => (
                   <option key={card.id}>{card.number} {card.currency}</option>
            ))}
            </select>
                <input 
                    type="text"
                    name="recipientCardNumber"
                    value={formData.recipientCardNumber}
                    onChange={handleChange}
                    placeholder="Broj kartice primaoca"
                />
                <input
                    type="number"
                    required
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="Iznos"
                />
                <input
                    type="email"
                    name="recipientEmail"
                    value={formData.recipientEmail}
                    onChange={handleChange}
                    placeholder="Email primaoca"
                />
                <input
                    type="text"
                    name="recipientFirstName"
                    value={formData.recipientFirstName}
                    onChange={handleChange}
                    placeholder="Ime primaoca"
                />
                <input
                    type="text"
                    name="recipientLastName"
                    value={formData.recipientLastName}
                    onChange={handleChange}
                    placeholder="Prezime primaoca"
                />
                <button type="submit">
                Potvrdi Transakciju
                </button>
            </form>
        </div>
    );
};
    
export default TransactionForm;
