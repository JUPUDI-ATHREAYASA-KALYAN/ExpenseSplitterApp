import React from 'react';
import { Card, ListGroup } from 'react-bootstrap';
import { useSelector } from 'react-redux';

const BalanceSummary = ({ balances }) => {
  const { user } = useSelector(state => state.auth);

  const userOwes = balances.filter(balance => 
    balance.from.id === user.id && balance.amount > 0
  );

  const owedToUser = balances.filter(balance => 
    balance.to.id === user.id && balance.amount > 0
  );

  const getTotalBalance = () => {
    let total = 0;
    
    // Add what others owe you
    owedToUser.forEach(balance => {
      total += balance.amount;
    });
    
    // Subtract what you owe others
    userOwes.forEach(balance => {
      total -= balance.amount;
    });
    
    return total;
  };

  const totalBalance = getTotalBalance();
  const balanceClass = totalBalance >= 0 ? 'user-balance-positive' : 'user-balance-negative';

  return (
    <Card className="mb-4">
      <Card.Header className="bg-light">
        <h5 className="mb-0">Balance Summary</h5>
      </Card.Header>
      <Card.Body>
        <div className="text-center mb-4">
          <h4>Your Total Balance</h4>
          <h3 className={balanceClass}>
            ${500}
          </h3>
          <div className="text-muted small">
            {totalBalance >= 0 
              ? 'You are owed money overall' 
              : 'You owe money overall'}
          </div>
        </div>

        {userOwes.length > 0 && (
          <div className="mb-3">
            <h5 className="mb-2">You owe</h5>
            <ListGroup variant="flush">
              {userOwes.map((balance, index) => (
                <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                  <div>{balance.to.name}</div>
                  <div className="user-balance-negative">${balance.amount.toFixed(2)}</div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        )}

        {owedToUser.length > 0 && (
          <div>
            <h5 className="mb-2">You are owed</h5>
            <ListGroup variant="flush">
              {owedToUser.map((balance, index) => (
                <ListGroup.Item key={index} className="d-flex justify-content-between align-items-center">
                  <div>{balance.from.name}</div>
                  <div className="user-balance-positive">${balance.amount.toFixed(2)}</div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default BalanceSummary;
