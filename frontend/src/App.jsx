import { AppBar, Toolbar, Button, Container } from '@mui/material';
import { Routes, Route, Link } from 'react-router-dom';
import RequestsList from './pages/RequestsList.jsx';
import Approvals from './pages/Approvals.jsx';
import PurchaseOrders from './pages/PurchaseOrders.jsx';

export default function App() {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Button color="inherit" component={Link} to="/requests">
            Requests
          </Button>
          <Button color="inherit" component={Link} to="/approvals">
            Approvals
          </Button>
          <Button color="inherit" component={Link} to="/orders">
            Orders
          </Button>
        </Toolbar>
      </AppBar>
      <Container sx={{ mt: 2 }}>
        <Routes>
          <Route path="/requests" element={<RequestsList />} />
          <Route path="/approvals" element={<Approvals />} />
          <Route path="/orders" element={<PurchaseOrders />} />
          <Route path="/" element={<RequestsList />} />
        </Routes>
      </Container>
    </>
  );
}
