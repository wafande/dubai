import { useState, useEffect } from 'react';
import { apiService } from '../../services/api';

function ExampleComponent() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const results = await apiService.read('/api/users');
        setData(results);
        setError(null);
      } catch (error) {
        setError(error.message);
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSave = async (newData) => {
    setLoading(true);
    try {
      await apiService.create('/api/users', newData);
      const updatedData = await apiService.read('/api/users');
      setData(updatedData);
      setError(null);
    } catch (error) {
      setError(error.message);
      console.error('Error saving data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      {/* Add your UI components here */}
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}

export default ExampleComponent; 