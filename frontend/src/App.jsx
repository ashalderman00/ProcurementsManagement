import { AppBar, Toolbar, Button, Container } from '@mui/material';
import { Routes, Route, Link } from 'react-router-dom';
import RequestForm from './pages/RequestForm.jsx';
import Approvals from './pages/Approvals.jsx';
import OrderStatus from './pages/OrderStatus.jsx';

export default function App() {
  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Button color="inherit" component={Link} to="/">
            Submit
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
          <Route path="/" element={<RequestForm />} />
          <Route path="/approvals" element={<Approvals />} />
          <Route path="/orders" element={<OrderStatus />} />
        </Routes>
      </Container>
    </>
  );
}
