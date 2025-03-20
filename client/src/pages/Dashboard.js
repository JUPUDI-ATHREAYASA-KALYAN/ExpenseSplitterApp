import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { fetchGroups } from '../store/groupSlice';

const Dashboard = () => {
  const dispatch = useDispatch();
  const { groups, loading, error } = useSelector(state => state.groups);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(fetchGroups());
  }, [dispatch]);

  if (loading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  // Ensure groups is always an array even if backend returns undefined/null
  const safeGroups = groups || [];

  return (
    <Container>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="page-header">Dashboard</h2>
        <Button 
          as={Link} 
          to="/groups/create" 
          variant="primary"
        >
          Create New Group
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        <Col md={8}>
          <h4 className="mb-3">Your Groups</h4>
          
          {safeGroups.length === 0 ? (
            <Card className="text-center py-4">
              <Card.Body>
                <Card.Title>No groups yet</Card.Title>
                <Card.Text>
                  Create a new group to start splitting expenses with friends.
                </Card.Text>
                <Button 
                  as={Link} 
                  to="/groups/create" 
                  variant="primary"
                >
                  Create First Group
                </Button>
              </Card.Body>
            </Card>
          ) : (
            safeGroups.map(group => (
              <Card key={group.id} className="mb-3 card">
                <Card.Body>
                  <Card.Title>{group.name || 'Unnamed Group'}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">
                    {group.members && Array.isArray(group.members) ? `${group.members.length} members` : 'No members'}
                  </Card.Subtitle>
                  <Card.Text>
                    {group.description || 'No description'}
                  </Card.Text>
                  <div className="d-flex">
                    <Button 
                      as={Link}
                      to={`/groups/${group.id}`}
                      variant="outline-primary"
                      className="me-2"
                    >
                      View Details
                    </Button>
                    <Button 
                      as={Link}
                      to={`/groups/${group.id}/expenses/add`}
                      variant="outline-success"
                    >
                      Add Expense
                    </Button>
                  </div>
                </Card.Body>
              </Card>
            ))
          )}
        </Col>
        
        <Col md={4}>
          <Card className="mb-3">
            <Card.Header>
              <h5 className="mb-0">Welcome, {user?.name || 'User'}!</h5>
            </Card.Header>
            <Card.Body>
              <Card.Text>
                Track and split expenses with your friends, family, or roommates.
                Create a group, add expenses, and see who owes what.
              </Card.Text>
            </Card.Body>
          </Card>
          
          <Card>
            <Card.Header>
              <h5 className="mb-0">Quick Actions</h5>
            </Card.Header>
            <Card.Body>
              <div className="d-grid gap-2">
                <Button 
                  as={Link} 
                  to="/groups/create" 
                  variant="outline-primary"
                >
                  Create New Group
                </Button>
                {safeGroups.length > 0 && (
                  <Button 
                    as={Link} 
                    to={`/groups/${safeGroups[0].id}/expenses/add`}
                    variant="outline-success"
                  >
                    Add Expense to Recent Group
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard;
