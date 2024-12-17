const mysql = require('mysql2/promise');

async function deleteAdminUser() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'dubai'
  });

  try {
    await connection.execute(
      'DELETE FROM users WHERE email = ?',
      ['admin@dubai-luxury.com']
    );
    console.log('Admin user deleted successfully');
  } catch (error) {
    console.error('Error deleting admin user:', error);
  }
  
  await connection.end();
  process.exit(0);
}

deleteAdminUser().catch(console.error); 