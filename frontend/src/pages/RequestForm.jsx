import { useState } from 'react';
import { Container, TextField, Button } from '@mui/material';

export default function RequestForm() {
  const [item, setItem] = useState('');
  const [quantity, setQuantity] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await fetch('/api/requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ item, quantity }),
    });
    setItem('');
    setQuantity('');
  };

  return (
    <Container sx={{ mt: 2 }}>
      <h2>Submit Request</h2>
      <form onSubmit={handleSubmit}>
        <TextField
          label="Item"
          value={item}
          onChange={(e) => setItem(e.target.value)}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Quantity"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          fullWidth
          margin="normal"
        />
        <Button type="submit" variant="contained" sx={{ mt: 2 }}>
          Submit
        </Button>
      </form>
    </Container>
  );
}

