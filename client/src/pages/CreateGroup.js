import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import { createGroup } from '../store/groupSlice';

const CreateGroup = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [validated, setValidated] = useState(false);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(state => state.groups);

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
    
    try {
      const resultAction = await dispatch(createGroup(formData));
      if (createGroup.fulfilled.match(resultAction)) {
        navigate(`/groups/${resultAction.payload.id}`);
      }
    } catch (err) {
      console.error('Failed to create group:', err);
    }
  };

  return (
    <Container>
      <h2 className="page-header">Create New Group</h2>
      
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="form-container">
            <Card.Body>
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form noValidate validated={validated} onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="name">
                  <Form.Label>Group Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Enter group name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                  <Form.Control.Feedback type="invalid">
                    Please provide a group name.
                  </Form.Control.Feedback>
                </Form.Group>

                <Form.Group className="mb-3" controlId="description">
                  <Form.Label>Description (Optional)</Form.Label>
                  <Form.Control
                    as="textarea"
                    name="description"
                    rows={3}
                    placeholder="Describe the purpose of this group"
                    value={formData.description}
                    onChange={handleChange}
                  />
                </Form.Group>

                <div className="d-flex justify-content-between mt-4">
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => navigate('/')}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Group'}
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

export default CreateGroup;
