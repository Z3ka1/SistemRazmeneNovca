import React, { useState, useEffect } from 'react';
import './history.css'

const TransactionHistory = () => {
    const [transactions, setTransactions] = useState([]);

    useEffect(() => {
        const fetchTransactions = () => {
            fetch('http://localhost:8000/returnAllTransactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' }
            })
            .then(res => {
                if (!res.ok) {
                    throw new Error('Server response wasnt OK');
                }
                return res.json();
            })
            .then(data => {
                setTransactions(data.transactions);
            })
            .catch(error => {
                console.error('Error fetching transactions:', error);
            });
        };

        fetchTransactions();
        const interval = setInterval(fetchTransactions, 5000); // Ažurira svakih 5 sekundi

        return () => clearInterval(interval);
    }, []);

    return (
        <div className='tr-div'>
            <h2 className='tr-header'>Istorija Transakcija</h2>
            <table className='tr-table'>
                <thead className='tr-thead'>
                    <tr className='tr-tr'>
                        <th className='tr-td'>ID</th>
                        <th className='tr-td'>Broj Kartice Pošiljaoca</th>
                        <th className='tr-td'>Broj Kartice Primaoca</th>
                        <th className='tr-td'>Iznos</th>
                        <th className='tr-td'>Valuta</th>
                        <th className='tr-td'>Završeno</th>
                    </tr>
                </thead>
                <tbody>
                    {transactions.map((transaction, index) => (
                        <tr className='tr-tr' key={index}>
                            <td className='tr-td'>{transaction.id}</td>
                            <td className='tr-td'>{transaction.senderCardNumber}</td>
                            <td className='tr-td'>{transaction.recipientCardNumber}</td>
                            <td className='tr-td'>{transaction.amount}</td>
                            <td className='tr-td'>{transaction.currency}</td>
                            <td className='tr-td'>{transaction.isDone ? 'Da' : 'Ne'}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TransactionHistory;
