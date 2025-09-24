-- Expand allowed user roles to include buyer and finance positions
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users
  ADD CONSTRAINT users_role_check
  CHECK (role IN ('requester','approver','buyer','finance','admin'));

UPDATE users
SET role = 'requester'
WHERE role IS NULL OR role NOT IN ('requester','approver','buyer','finance','admin');
