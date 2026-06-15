const { Client } = require('pg');
const bcrypt = require('bcrypt');

const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'learning_db',
});

async function main() {
  await client.connect();
  const hash = await bcrypt.hash('password123', 10);
  
  // Truncate first to clear any leftovers
  await client.query('TRUNCATE TABLE users CASCADE;');
  
  await client.query(`
    INSERT INTO users (id, name, email, password, role, "isActive", "createdAt", "updatedAt")
    VALUES 
      ('3c3631e1-03c7-4068-a67d-0437d027ee22', 'Admin User', 'admin@example.com', $1, 'ADMIN', true, NOW()::text, NOW()::text),
      ('c2b8e90f-6deb-4f85-baca-bcc01a0330c9', 'Student User', 'student@example.com', $1, 'STUDENT', true, NOW()::text, NOW()::text),
      ('ce3df81a-ae54-4edf-aac1-2d5de600776f', 'Marina Alves', 'marina.alves@example.com', $1, 'STUDENT', true, NOW()::text, NOW()::text)
  `, [hash]);
  
  console.log('Database seeded successfully!');
  await client.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
