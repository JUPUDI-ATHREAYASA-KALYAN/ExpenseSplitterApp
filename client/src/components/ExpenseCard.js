import React from 'react';
import { Card, Badge, Button } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { format } from 'date-fns';

const ExpenseCard = ({ expense, onSettleClick }) => {
  const { user } = useSelector(state => state.auth);
  const isSettled = expense.isSettled;
  const isPayer = expense.paidBy.id === user.id;
  const userShare = expense.splits.find(split => split.userId === user.id);
  const cardClass = isSettled ? 'settled-expense' : 'expense-card';

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return format(date, 'MMM dd, yyyy');
  };

  return (
    <Card className={`mb-3 ${cardClass}`}>
      <Card.Body>
        <div className="d-flex justify-content-between align-items-center mb-2">
          <Card.Title>{expense.description}</Card.Title>
          <h5>
            <Badge bg={isSettled ? 'success' : 'primary'}>
              {isSettled ? 'Settled' : 'Unsettled'}
            </Badge>
          </h5>
        </div>
        
        <Card.Subtitle className="mb-2 text-muted">
          {formatDate(expense.date)}
        </Card.Subtitle>
        
        <div className="d-flex justify-content-between mb-3">
          <div>
            <strong>Total: </strong>${expense.amount.toFixed(2)}
          </div>
          <div>
            <strong>Paid by: </strong>{expense.paidBy.name}
            {isPayer && <span className="ms-1">(You)</span>}
          </div>
        </div>
        
        {userShare && !isPayer && !isSettled && (
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <strong>Your share: </strong>
              <span className="user-balance-negative">${userShare.amount.toFixed(2)}</span>
            </div>
            <Button 
              variant="outline-success" 
              size="sm" 
              onClick={() => onSettleClick(expense)}
            >
              Settle Up
            </Button>
          </div>
        )}
        
        {isPayer && !isSettled && (
          <div>
            <strong>You paid for this expense</strong>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default ExpenseCard;
