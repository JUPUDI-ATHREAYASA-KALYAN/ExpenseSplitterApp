import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Container, Form, Button, Card, Alert, Row, Col, 
  ListGroup, InputGroup 
} from 'react-bootstrap';
import { fetchGroupById } from '../store/groupSlice';
import { createExpense } from '../store/expenseSlice';

const AddExpense = () => {
  const { id: groupId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const { user } = useSelector(state => state.auth);
  const { currentGroup, loading: groupLoading, error: groupError } = useSelector(state => state.groups);
  const { loading: expenseLoading, error: expenseError } = useSelector(state => state.expenses);
  
  const [validated, setValidated] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paidById: '',
    splitType: 'equal',
    customSplits: []
  });
  
  useEffect(() => {
    dispatch(fetchGroupById(groupId));
  }, [dispatch, groupId]);
  
  useEffect(() => {
    if (currentGroup) {
      // Set the current user as the default payer
      setFormData(prev => ({
        ...prev,
        paidById: user.id,
        // Initialize custom splits with all members having 0 amounts
        customSplits: currentGroup.members.map(member => ({
          userId: member.id,
          amount: 0
        }))
      }));
    }
  }, [currentGroup, user.id]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // If amount changes and using equal split, update custom split amounts
    if (name === 'amount' && formData.splitType === 'equal' && currentGroup) {
      const amount = parseFloat(value) || 0;
      const memberCount = currentGroup.members.length;
      const equalAmount = memberCount > 0 ? (amount / memberCount) : 0;
      
      setFormData(prev => ({
        ...prev,
        customSplits: prev.customSplits.map(split => ({
          ...split,
          amount: parseFloat(equalAmount.toFixed(2))
        }))
      }));
    }
    
    // If split type changes to equal, recalculate splits
    if (name === 'splitType' && value === 'equal' && currentGroup) {
      const amount = parseFloat(formData.amount) || 0;
      const memberCount = currentGroup.members.length;
      const equalAmount = memberCount > 0 ? (amount / memberCount) : 0;
      
      setFormData(prev => ({
        ...prev,
        customSplits: prev.customSplits.map(split => ({
          ...split,
          amount: parseFloat(equalAmount.toFixed(2))
        }))
      }));
    }
  };
  
  const handleCustomSplitChange = (userId, value) => {
    const amount = parseFloat(value) || 0;
    
    setFormData(prev => ({
      ...prev,
      customSplits: prev.customSplits.map(split => 
        split.userId === userId ? { ...split, amount } : split
      )
    }));
  };
  
  const getTotalSplitAmount = () => {
    return formData.customSplits.reduce((sum, split) => sum + (parseFloat(split.amount) || 0), 0);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    // Validate that split amounts equal total amount
    const totalAmount = parseFloat(formData.amount) || 0;
    const totalSplitAmount = getTotalSplitAmount();
    
    if (Math.abs(totalAmount - totalSplitAmount) > 0.01) {
      alert('Split amounts must equal the total expense amount');
      return;
    }
    
    const expenseData = {
      groupId,
      description: formData.description,
      amount: parseFloat(formData.amount),
      date: formData.date,
      paidById: formData.paidById,
      splits: formData.customSplits
    };
    
    try {
      const resultAction = await dispatch(createExpense(expenseData));
      if (createExpense.fulfilled.match(resultAction)) {
        navigate(`/groups/${groupId}`);
      }
    } catch (err) {
      console.error('Failed to create expense:', err);
    }
  };
  
  if (groupLoading) {
    return (
      <Container>
        <div className="text-center my-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      </Container>
    );
  }
  
  if (!currentGroup) {
    return (
      <Container>
        <Alert variant="danger">Group not found or you don't have access</Alert>
      </Container>
    );
  }
  
  return (
    <Container>
      <h2 className="page-header">Add Expense to {currentGroup.name}</h2>
      
      {groupError && <Alert variant="danger">{groupError}</Alert>}
      {expenseError && <Alert variant="danger">{expenseError}</Alert>}
      
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="form-container">
            <Card.Body>
              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="description">
                  <Form.Label>Description</Form.Label>
                  <Form.Control
                    type="text"
                    name="description"
                    placeholder="What is this expense for?"
                    value={formData.description}
                    onChange={handleChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide a description.
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="amount">
                      <Form.Label>Amount</Form.Label>
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
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="date">
                      <Form.Label>Date</Form.Label>
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
                  </Col>
                </Row>
                
                <Form.Group className="mb-3" controlId="paidById">
                  <Form.Label>Paid by</Form.Label>
                  <Form.Select
                    name="paidById"
                    value={formData.paidById}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Select who paid</option>
                    {currentGroup.members.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.id === user.id ? `${member.name} (You)` : member.name}
                      </option>
                    ))}
                  </Form.Select>
                  <Form.Control.Feedback type="invalid">
                    Please select who paid.
                  </Form.Control.Feedback>
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="splitType">
                  <Form.Label>Split Type</Form.Label>
                  <Form.Select
                    name="splitType"
                    value={formData.splitType}
                    onChange={handleChange}
                    required
                  >
                    <option value="equal">Split Equally</option>
                    <option value="custom">Custom Split</option>
                  </Form.Select>
                </Form.Group>
                
                {formData.splitType === 'custom' && (
                  <div className="mb-4">
                    <div className="d-flex justify-content-between mb-2">
                      <h6>Custom Split</h6>
                      <div>
                        <span className={getTotalSplitAmount() === parseFloat(formData.amount) ? 'text-success' : 'text-danger'}>
                          ${getTotalSplitAmount().toFixed(2)} / ${parseFloat(formData.amount).toFixed(2)}
                        </span>
                      </div>
                    </div>
                    <ListGroup>
                      {currentGroup.members.map(member => (
                        <ListGroup.Item key={member.id}>
                          <div className="d-flex justify-content-between align-items-center">
                            <div>{member.name}</div>
                            <InputGroup className="w-50">
                              <InputGroup.Text>$</InputGroup.Text>
                              <Form.Control
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.customSplits.find(split => split.userId === member.id)?.amount || 0}
                                onChange={(e) => handleCustomSplitChange(member.id, e.target.value)}
                              />
                            </InputGroup>
                          </div>
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </div>
                )}
                
                <div className="d-flex justify-content-between mt-4">
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => navigate(`/groups/${groupId}`)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={expenseLoading}
                  >
                    {expenseLoading ? 'Adding...' : 'Add Expense'}
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

export default AddExpense;
