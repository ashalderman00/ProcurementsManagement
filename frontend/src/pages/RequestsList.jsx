import { useEffect, useState } from 'react';
import {
  CircularProgress,
  Alert,
  List,
  ListItem,
  Typography,
} from '@mui/material';

export default function RequestsList() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/api/requests')
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((json) => setData(json))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">Error: {error.message}</Alert>;

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Requests
      </Typography>
      <List>
        {data.map((item, idx) => (
          <ListItem key={idx}>{JSON.stringify(item)}</ListItem>
        ))}
      </List>
    </>
  );
}
