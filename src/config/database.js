import mysql from 'mysql2/promise';

const dbConfig = {
  host: import.meta.env.VITE_DB_HOST || 'localhost',
  user: import.meta.env.VITE_DB_USERNAME || 'root',
  password: import.meta.env.VITE_DB_PASSWORD || '',
  database: import.meta.env.VITE_DB_DATABASE || 'dubai',
  port: import.meta.env.VITE_DB_PORT || 3306
};

const createConnection = async () => {
  try {
    const connection = await mysql.createConnection(dbConfig);
    console.log('Database connected successfully');
    return connection;
  } catch (error) {
    console.error('Database connection failed:', error);
    throw error;
  }
};

export default createConnection; 