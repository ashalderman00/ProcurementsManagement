const { Pool } = require('pg');

function pickRule({ amount, category_id, vendor_id, rules }) {
  return rules.find(r => {
    if (!r.active) return false;
    if (amount < Number(r.min_amount)) return false;
    if (r.max_amount !== null && amount > Number(r.max_amount)) return false;
    if (r.category_id && category_id && r.category_id !== category_id) return false;
    if (r.vendor_id && vendor_id && r.vendor_id !== vendor_id) return false;
    return true;
  }) || null;
}

async function materializeStages(client, request_id, stages) {
  for (let i = 0; i < stages.length; i++) {
    await client.query(
      'INSERT INTO request_approvals(request_id, stage_index, role_required, status) VALUES($1,$2,$3,$4)',
      [request_id, i, stages[i], 'pending']
    );
  }
}

async function recomputeRequestStatus(client, request_id) {
  const { rows } = await client.query(
    'SELECT status FROM request_approvals WHERE request_id=$1 ORDER BY stage_index',
    [request_id]
  );
  if (!rows.length) return;
  if (rows.some(r => r.status === 'denied')) {
    await client.query('UPDATE requests SET status=$1 WHERE id=$2', ['denied', request_id]);
    return;
  }
  if (rows.every(r => r.status === 'approved')) {
    await client.query('UPDATE requests SET status=$1 WHERE id=$2', ['approved', request_id]);
    return;
  }
  await client.query('UPDATE requests SET status=$1 WHERE id=$2', ['pending', request_id]);
}

module.exports = { pickRule, materializeStages, recomputeRequestStatus };
