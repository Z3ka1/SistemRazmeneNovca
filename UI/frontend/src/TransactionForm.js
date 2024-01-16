import React, { useState } from 'react';
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
                <input
                    type="text"
                    name="senderCardNumber"
                    value={formData.senderCardNumber}
                    onChange={handleChange}
                    placeholder="Broj kartice pošiljaoca"
                />
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
