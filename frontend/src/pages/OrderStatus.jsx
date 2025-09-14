import { useEffect, useState } from 'react';
import { Container, List, ListItem, ListItemText, Chip } from '@mui/material';

export default function OrderStatus() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    fetch('/api/orders')
      .then((res) => res.json())
      .then(setOrders)
      .catch(() => setOrders([]));
  }, []);

  return (
    <Container sx={{ mt: 2 }}>
      <h2>Order Status</h2>
      <List>
        {orders.map((order) => (
          <ListItem key={order.id} disableGutters>
            <ListItemText primary={`${order.item} - ${order.quantity}`} />
            <Chip label={order.status} sx={{ ml: 2 }} />
          </ListItem>
        ))}
      </List>
    </Container>
  );
}

