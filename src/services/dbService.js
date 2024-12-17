import createConnection from '../config/database';

export const dbService = {
  async query(sql, params) {
    const connection = await createConnection();
    try {
      const [results] = await connection.execute(sql, params);
      return results;
    } catch (error) {
      console.error('Query error:', error);
      throw error;
    } finally {
      await connection.end();
    }
  },

  // Example methods for CRUD operations
  async create(table, data) {
    const keys = Object.keys(data);
    const values = Object.values(data);
    const sql = `INSERT INTO ${table} (${keys.join(',')}) VALUES (${keys.map(() => '?').join(',')})`;
    return await this.query(sql, values);
  },

  async read(table, conditions = {}) {
    const where = Object.keys(conditions).length 
      ? `WHERE ${Object.keys(conditions).map(key => `${key} = ?`).join(' AND ')}`
      : '';
    const sql = `SELECT * FROM ${table} ${where}`;
    return await this.query(sql, Object.values(conditions));
  },

  async update(table, data, conditions) {
    const updates = Object.keys(data).map(key => `${key} = ?`).join(',');
    const where = Object.keys(conditions).map(key => `${key} = ?`).join(' AND ');
    const sql = `UPDATE ${table} SET ${updates} WHERE ${where}`;
    return await this.query(sql, [...Object.values(data), ...Object.values(conditions)]);
  },

  async delete(table, conditions) {
    const where = Object.keys(conditions).map(key => `${key} = ?`).join(' AND ');
    const sql = `DELETE FROM ${table} WHERE ${where}`;
    return await this.query(sql, Object.values(conditions));
  }
}; 