require('dotenv').config();
const bcrypt = require('bcryptjs');
const sequelize = require('./config/db');
const User = require('./models/User');
require('./models/Voucher');

const demoUsers = [
  { name: 'Alice Employee', email: 'employee@company.com', password: 'password123', role: 'employee', department: 'Engineering', employeeCode: 'EMP-001' },
  { name: 'Daniel Director', email: 'director@company.com', password: 'password123', role: 'director', department: 'Management' },
  { name: 'Amara Accounts', email: 'accounts@company.com', password: 'password123', role: 'accounts', department: 'Finance' },
];

async function seed() {
  await sequelize.sync();

  for (const u of demoUsers) {
    const existing = await User.findOne({ where: { email: u.email } });
    if (existing) {
      console.log(`Skipping (already exists): ${u.email}`);
      continue;
    }
    const hashed = await bcrypt.hash(u.password, 10);
    await User.create({ ...u, password: hashed });
    console.log(`Created ${u.role}: ${u.email} / ${u.password}`);
  }

  console.log('\nSeeding complete. Demo login credentials:');
  demoUsers.forEach(u => console.log(`  ${u.role.padEnd(10)} ${u.email} / ${u.password}`));
  process.exit(0);
}

seed().catch(err => {
  console.error('Seeding failed:', err);
  process.exit(1);
});
