import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Container, Row, Col, Card, Button, Alert, Tabs, Tab, 
  ListGroup, Form, Modal, Spinner, Badge 
} from 'react-bootstrap';
import { fetchGroupById, inviteToGroup } from '../store/groupSlice';
import { fetchExpenses, fetchBalances } from '../store/expenseSlice';
import ExpenseCard from '../components/ExpenseCard';
import BalanceSummary from '../components/BalanceSummary';

const GroupDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const [email, setEmail] = useState('');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [validated, setValidated] = useState(false);
  
  const { currentGroup, loading: groupLoading, error: groupError } = useSelector(state => state.groups);
  const { expenses, balances, loading: expenseLoading, error: expenseError } = useSelector(state => state.expenses);
  
  useEffect(() => {
    dispatch(fetchGroupById(id));
    dispatch(fetchExpenses(id));
    dispatch(fetchBalances(id));
  }, [dispatch, id]);
  
  const handleSettleExpense = (expense) => {
    navigate(`/groups/${id}/settle`, { state: { expense } });
  };
  
  const handleInviteSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    dispatch(inviteToGroup({ groupId: id, email }));
    setEmail('');
    setShowInviteModal(false);
  };
  
  if (groupLoading || expenseLoading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
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
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="page-header">{currentGroup.name}</h2>
        <div>
          <Button 
            variant="outline-primary" 
            className="me-2"
            onClick={() => setShowInviteModal(true)}
          >
            Invite Member
          </Button>
          <Button 
            variant="primary"
            onClick={() => navigate(`/groups/${id}/expenses/add`)}
          >
            Add Expense
          </Button>
        </div>
      </div>
      
      {groupError && <Alert variant="danger">{groupError}</Alert>}
      {expenseError && <Alert variant="danger">{expenseError}</Alert>}
      
      <Row>
        <Col md={8}>
          <Card className="mb-4">
            <Card.Body>
              <Tabs defaultActiveKey="expenses" className="mb-3">
                <Tab eventKey="expenses" title="Expenses">
                  {expenses.length === 0 ? (
                    <div className="text-center py-4">
                      <p>No expenses yet</p>
                      <Button 
                        variant="outline-primary"
                        onClick={() => navigate(`/groups/${id}/expenses/add`)}
                      >
                        Add First Expense
                      </Button>
                    </div>
                  ) : (
                    expenses.map(expense => (
                      <ExpenseCard 
                        key={expense.id}
                        expense={expense}
                        onSettleClick={handleSettleExpense}
                      />
                    ))
                  )}
                </Tab>
                <Tab eventKey="members" title="Members">
                  <ListGroup variant="flush">
                    {currentGroup.members.map(member => (
                      <ListGroup.Item 
                        key={member.id}
                        className="d-flex justify-content-between align-items-center"
                      >
                        <div>
                          {member.name}
                          {member.id === currentGroup.createdBy.id && (
                            <Badge bg="info" className="ms-2">Admin</Badge>
                          )}
                        </div>
                        <div className="text-muted">{member.email}</div>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                </Tab>
              </Tabs>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={4}>
          <BalanceSummary balances={balances} />
          
          <Card>
            <Card.Header>
              <h5 className="mb-0">Group Info</h5>
            </Card.Header>
            <Card.Body>
              <p>
                <strong>Description: </strong>
                {currentGroup.description || 'No description'}
              </p>
              <p>
                <strong>Created by: </strong>
                {currentGroup.createdBy.name}
              </p>
              <p>
                <strong>Members: </strong>
                {currentGroup.members.length}
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Invite Modal */}
      <Modal show={showInviteModal} onHide={() => setShowInviteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Invite Member</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form noValidate validated={validated} onSubmit={handleInviteSubmit}>
            <Form.Group controlId="email">
              <Form.Label>Email address</Form.Label>
              <Form.Control
                type="email"
                placeholder="Enter email to invite"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Form.Control.Feedback type="invalid">
                Please provide a valid email.
              </Form.Control.Feedback>
              <Form.Text className="text-muted">
                An invitation will be sent to this email address.
              </Form.Text>
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowInviteModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleInviteSubmit}>
            Send Invitation
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default GroupDetails;
