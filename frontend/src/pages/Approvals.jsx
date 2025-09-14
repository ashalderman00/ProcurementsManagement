import { useEffect, useState } from 'react';
import { Container, List, ListItem, ListItemText, Button, Stack } from '@mui/material';

export default function Approvals() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    fetch('/api/requests/pending')
      .then((res) => res.json())
      .then(setRequests)
      .catch(() => setRequests([]));
  }, []);

  const handleAction = async (id, action) => {
    await fetch(`/api/requests/${id}/${action}`, { method: 'POST' });
    setRequests((current) => current.filter((r) => r.id !== id));
  };

  return (
    <Container sx={{ mt: 2 }}>
      <h2>Pending Requests</h2>
      <List>
        {requests.map((req) => (
          <ListItem key={req.id} disableGutters>
            <ListItemText primary={`${req.item} - ${req.quantity}`} />
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleAction(req.id, 'approve')}
              >
                Approve
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={() => handleAction(req.id, 'reject')}
              >
                Reject
              </Button>
            </Stack>
          </ListItem>
        ))}
      </List>
    </Container>
  );
}

