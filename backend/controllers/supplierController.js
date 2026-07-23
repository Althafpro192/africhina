import logger from '../config/logger.js';
import pool from '../config/db.js';
import catchAsync from '../utils/catchAsync.js';
import AppError from '../utils/appError.js';

export const getSuppliers = catchAsync(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const offset = (page - 1) * limit;

  const totalRes = await pool.query('SELECT count(*) FROM suppliers');
  const total = parseInt(totalRes.rows[0].count, 10);

  const suppliers = await pool.query(
    'SELECT * FROM suppliers ORDER BY created_at DESC LIMIT $1 OFFSET $2',
    [limit, offset]
  );

  res.json({
    data: suppliers.rows,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }
  });
});

export const getSupplierById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const supplier = await pool.query('SELECT * FROM suppliers WHERE id = $1', [id]);
  if (supplier.rows.length === 0) throw new AppError('Supplier not found', 404);
  res.json(supplier.rows[0]);
});

export const createSupplier = catchAsync(async (req, res) => {
  const { company_name, category, contact_person, phone_china, email, factory_address, verification_level } = req.body;

  const newSupplier = await pool.query(
    'INSERT INTO suppliers (company_name, category, contact_person, phone_china, email, factory_address, verification_level) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
    [company_name, category, contact_person, phone_china, email, factory_address, verification_level]
  );
  res.status(201).json(newSupplier.rows[0]);
});

export const updateSupplier = catchAsync(async (req, res) => {
  const { id } = req.params;
  const { company_name, category, contact_person, phone_china, email, factory_address, verification_level, notes } = req.body;

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
  if (updated.rows.length === 0) throw new AppError('Supplier not found', 404);
  res.json(updated.rows[0]);
});

export const deleteSupplier = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await pool.query('DELETE FROM suppliers WHERE id = $1 RETURNING id', [id]);
  if (result.rows.length === 0) throw new AppError('Supplier not found', 404);
  res.json({ message: 'Supplier deleted successfully' });
});
