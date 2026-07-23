require('dotenv').config();
const app = require('./app');
const sequelize = require('./config/db');
require('./models/User');
require('./models/Voucher');

const PORT = process.env.PORT || 5000;

async function start() {
  try {
    await sequelize.authenticate();
    // sync() auto-creates tables based on models; in production prefer real migrations.
    await sequelize.sync();
    console.log(`Database connected (${process.env.DB_DIALECT || 'sqlite'}) and synced.`);

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

start();
