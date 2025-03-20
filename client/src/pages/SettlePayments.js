import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Container, Card, Form, Button, Alert, Row, Col, 
  InputGroup 
} from 'react-bootstrap';
import { fetchGroupById } from '../store/groupSlice';
import { settleExpense } from '../store/expenseSlice';

const SettlePayments = () => {
  const { id: groupId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user } = useSelector(state => state.auth);
  const { currentGroup } = useSelector(state => state.groups);
  const { loading, error } = useSelector(state => state.expenses);
  
  const [validated, setValidated] = useState(false);
  const [expense, setExpense] = useState(null);
  const [formData, setFormData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    method: 'cash',
    notes: ''
  });
  
  useEffect(() => {
    if (!currentGroup) {
      dispatch(fetchGroupById(groupId));
    }
    
    // Get expense from location state
    if (location.state?.expense) {
      setExpense(location.state.expense);
      
      // Find the user's share in the expense
      const userShare = location.state.expense.splits.find(
        split => split.userId === user.id
      );
      
      if (userShare) {
        setFormData(prev => ({
          ...prev,
          amount: userShare.amount.toFixed(2)
        }));
      }
    }
  }, [dispatch, groupId, currentGroup, location.state, user.id]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    if (!expense) {
      return;
    }
    
    const settlementData = {
      amount: parseFloat(formData.amount),
      date: formData.date,
      method: formData.method,
      notes: formData.notes,
      payerId: user.id,
      payeeId: expense.paidBy.id
    };
    
    try {
      const resultAction = await dispatch(settleExpense({
        expenseId: expense.id,
        settlementData
      }));
      
      if (settleExpense.fulfilled.match(resultAction)) {
        navigate(`/groups/${groupId}`);
      }
    } catch (err) {
      console.error('Failed to settle expense:', err);
    }
  };
  
  if (!expense) {
    return (
      <Container>
        <Alert variant="danger">
          No expense found to settle. Please select an expense from the group page.
        </Alert>
        <Button 
          variant="primary" 
          onClick={() => navigate(`/groups/${groupId}`)}
        >
          Back to Group
        </Button>
      </Container>
    );
  }
  
  return (
    <Container>
      <h2 className="page-header">Settle Payment</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">Expense Details</h5>
            </Card.Header>
            <Card.Body>
              <p><strong>Description:</strong> {expense.description}</p>
              <p><strong>Total Amount:</strong> ${expense.amount.toFixed(2)}</p>
              <p><strong>Paid By:</strong> {expense.paidBy.name}</p>
              <p>
                <strong>Your Share:</strong> $
                {expense.splits.find(split => split.userId === user.id)?.amount.toFixed(2) || '0.00'}
              </p>
            </Card.Body>
          </Card>
          
          <Card className="form-container">
            <Card.Header>
              <h5 className="mb-0">Payment Details</h5>
            </Card.Header>
            <Card.Body>
              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="amount">
                  <Form.Label>Amount to Pay</Form.Label>
                  <InputGroup>
                    <InputGroup.Text>$</InputGroup.Text>
                    <Form.Control
                      type="number"
                      name="amount"
                      placeholder="0.00"
                      step="0.01"
                      min="0.01"
                      value={formData.amount}
                      onChange={handleChange}
                      required
                    />
                    <Form.Control.Feedback type="invalid">
                      Please enter a valid amount.
                    </Form.Control.Feedback>
                  </InputGroup>
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="date">
                  <Form.Label>Payment Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Please select a date.
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="method">
                  <Form.Label>Payment Method</Form.Label>
                  <Form.Select
                    name="method"
                    value={formData.method}
                    onChange={handleChange}
                    required
                  >
                    <option value="cash">Cash</option>
                    <option value="bank_transfer">Bank Transfer</option>
                    <option value="venmo">Venmo</option>
                    <option value="paypal">PayPal</option>
                    <option value="other">Other</option>
                  </Form.Select>
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="notes">
                  <Form.Label>Notes (Optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="notes"
                    rows={3}
                    placeholder="Add any notes about this payment"
                    value={formData.notes}
                    onChange={handleChange}
                  />
                </Form.Group>
                
                <div className="d-flex justify-content-between mt-4">
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => navigate(`/groups/${groupId}`)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="success" 
                    type="submit" 
                    disabled={loading}
                  >
                    {loading ? 'Processing...' : 'Confirm Payment'}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SettlePayments;
