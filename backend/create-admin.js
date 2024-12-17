const bcrypt = require('bcryptjs');
const mysql = require('mysql2/promise');

async function createAdminUser() {
  const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'dubai'
  });

  const hashedPassword = await bcrypt.hash('admin123', 10);
  
  try {
    await connection.execute(
      'INSERT INTO users (username, email, password, role, status, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      ['admin', 'admin@dubai-luxury.com', hashedPassword, 'admin', 'active']
    );
    console.log('Admin user created successfully');
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log('Admin user already exists');
    } else {
      console.error('Error creating admin user:', error);
    }
  }
  
  await connection.end();
  process.exit(0);
}

createAdminUser().catch(console.error); 