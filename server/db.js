const { Sequelize } = require('sequelize');
require('dotenv').config();

let sequelize;

if (process.env.USE_SQLITE === 'true') {
  const storagePath = process.env.DB_PATH || './database.sqlite';
  sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: storagePath,
    logging: false
  });
} else if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: process.env.DB_SSL === 'false' ? false : { require: true, rejectUnauthorized: false }
    }
  });
} else {
  sequelize = new Sequelize(
    process.env.DB_NAME || 'pos_inventory_db',
    process.env.DB_USER || 'postgres',
    process.env.DB_PASSWORD || 'postgres',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      dialect: 'postgres',
      logging: false
    }
  );
}

module.exports = sequelize;
