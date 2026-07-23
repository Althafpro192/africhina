import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import { parse } from 'pg-connection-string';
dotenv.config();

const dbUrl = process.env.DATABASE_URL || 'postgres://postgres:160907@localhost:5432/africhina';
const config = parse(dbUrl);

if (config.password !== undefined) {
  config.password = String(config.password);
}
if (process.env.DB_PASSWORD !== undefined) {
  config.password = String(process.env.DB_PASSWORD);
}

const pool = new Pool(config);

export default pool;
