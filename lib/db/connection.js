import mysql from 'mysql2/promise';

// Parse your connection string
// mysql+pymysql://u649168233_lux:Revolution_100@82.197.82.158/u649168233_revolution
const DB_HOST = '82.197.82.158';
const DB_USER = 'u649168233_lux';
const DB_PASSWORD = 'Revolution_100';
const DB_NAME = 'u649168233_revolution';
const DB_PORT = 3306; // Default MySQL port

let pool;

export async function getConnection() {
  if (!pool) {
    try {
      pool = mysql.createPool({
        host: DB_HOST,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        port: DB_PORT,
        waitForConnections: true,
        connectionLimit: 5, // Lower limit for shared hosting
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0,
        // Add these for better compatibility
        connectTimeout: 10000, // 10 second timeout
        ssl: false, // Your hosting might not need SSL
      });

      // Test the connection
      const connection = await pool.getConnection();
      console.log('✅ Database connected successfully');
      connection.release();

    } catch (error) {
      console.error('❌ Database connection failed:', error.message);
      throw error;
    }
  }
  return pool;
}

export async function query(sql, params) {
  let connection;
  try {
    connection = await getConnection();
    const [results] = await connection.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Database query error:', error);
    console.error('SQL:', sql);
    console.error('Params:', params);
    throw error;
  }
}

// Test function to verify connection
export async function testConnection() {
  try {
    const result = await query('SELECT 1 as test');
    console.log('✅ Database query test successful');
    return true;
  } catch (error) {
    console.error('❌ Database query test failed:', error.message);
    return false;
  }
}