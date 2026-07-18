import logger from '../config/logger.js';
import pool from '../config/db.js';

export const getSuppliers = async (req, res) => {
  try {
    const suppliers = await pool.query('SELECT * FROM suppliers ORDER BY created_at DESC');
    res.json(suppliers.rows);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getSupplierById = async (req, res) => {
  try {
    const supplier = await pool.query('SELECT * FROM suppliers WHERE id = $1', [req.params.id]);
    if (supplier.rows.length === 0) return res.status(404).json({ message: 'Supplier not found' });
    res.json(supplier.rows[0]);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
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
    logger.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const updateSupplier = async (req, res) => {
  const { id } = req.params;
  const { company_name, category, contact_person, phone_china, email, factory_address, verification_level, notes } = req.body;
  try {
    const updated = await pool.query(
      `UPDATE suppliers SET
        company_name = COALESCE($1, company_name),
        category = COALESCE($2, category),
        contact_person = COALESCE($3, contact_person),
        phone_china = COALESCE($4, phone_china),
        email = COALESCE($5, email),
        factory_address = COALESCE($6, factory_address),
        verification_level = COALESCE($7, verification_level),
        notes = COALESCE($8, notes)
      WHERE id = $9 RETURNING *`,
      [company_name, category, contact_person, phone_china, email, factory_address, verification_level, notes, id]
    );
    if (updated.rows.length === 0) return res.status(404).json({ message: 'Supplier not found' });
    res.json(updated.rows[0]);
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const deleteSupplier = async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM suppliers WHERE id = $1 RETURNING id', [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Supplier not found' });
    res.json({ message: 'Supplier deleted successfully' });
  } catch (error) {
    logger.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
};
