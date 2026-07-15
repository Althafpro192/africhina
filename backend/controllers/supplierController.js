import pool from '../config/db.js';

export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await pool.query('SELECT * FROM suppliers ORDER BY created_at DESC');
    res.json(suppliers.rows);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createSupplier = async (req, res) => {
  const { company_name, category, contact_person, phone_china, email, factory_address, verification_level } = req.body;
  try {
    const newSupplier = await pool.query(
      'INSERT INTO suppliers (company_name, category, contact_person, phone_china, email, factory_address, verification_level) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [company_name, category, contact_person, phone_china, email, factory_address, verification_level]
    );
    res.status(201).json(newSupplier.rows[0]);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
