module.exports = function extend(app, pool, authRequired, roleRequired) {
  // Approval rules list already exists at GET /api/approval-rules (admin)

  // Update a rule
  app.patch('/api/approval-rules/:id', authRequired, roleRequired('admin'), async (req,res)=>{
    const id = Number(req.params.id);
    const { name, min_amount, max_amount, category_id, vendor_id, stages, active } = req.body || {};
    try{
      const r = await pool.query(
        `UPDATE approval_rules SET
           name=COALESCE($1,name),
           min_amount=COALESCE($2,min_amount),
           max_amount=$3,
           category_id=$4,
           vendor_id=$5,
           stages=COALESCE($6,stages),
           active=COALESCE($7,active)
         WHERE id=$8
         RETURNING *`,
        [name ?? null, min_amount ?? null,
         (max_amount===null)? null : (max_amount ?? null),
         (category_id??null), (vendor_id??null),
         Array.isArray(stages)? JSON.stringify(stages) : null,
         (typeof active==='boolean'? active:null), id]
      );
      if (!r.rows.length) return res.status(404).json({error:'not found'});
      res.json(r.rows[0]);
    }catch(e){ res.status(500).json({error:'update failed'}); }
  });

  // Delete a rule
  app.delete('/api/approval-rules/:id', authRequired, roleRequired('admin'), async (req,res)=>{
    const id = Number(req.params.id);
    try{
      const r = await pool.query('DELETE FROM approval_rules WHERE id=$1', [id]);
      if (!r.rowCount) return res.status(404).json({error:'not found'});
      res.json({ok:true});
    }catch(e){ res.status(500).json({error:'delete failed'}); }
  });

  // Vendor detail & update
  app.get('/api/vendors/:id', async (req,res)=>{
    const id = Number(req.params.id);
    const { rows } = await pool.query('SELECT * FROM vendors WHERE id=$1', [id]);
    if (!rows.length) return res.status(404).json({error:'not found'});
    res.json(rows[0]);
  });

  app.patch('/api/vendors/:id', authRequired, roleRequired('admin','approver'), async (req,res)=>{
    const id = Number(req.params.id);
    const { name, risk, status, website, notes } = req.body || {};
    try{
      const r = await pool.query(
        `UPDATE vendors SET
           name=COALESCE($1,name),
           risk=COALESCE($2,risk),
           status=COALESCE($3,status),
           website=COALESCE($4,website),
           notes=COALESCE($5,notes)
         WHERE id=$6 RETURNING *`,
        [name ?? null, risk ?? null, status ?? null, website ?? null, notes ?? null, id]
      );
      if (!r.rows.length) return res.status(404).json({error:'not found'});
      res.json(r.rows[0]);
    }catch(e){ res.status(500).json({error:'update failed'}); }
  });
}

// ===== Request comments =====
module.exports.extendComments = function(app, pool, authRequired) {
  app.get('/api/requests/:id/comments', authRequired, async (req,res)=>{
    const id = Number(req.params.id);
    const { rows } = await pool.query(
      `SELECT c.id, c.body, c.created_at, u.email as author
         FROM request_comments c
         LEFT JOIN users u ON u.id = c.user_id
        WHERE c.request_id = $1
        ORDER BY c.created_at DESC`, [id]);
    res.json(rows);
  });

  app.post('/api/requests/:id/comments', authRequired, async (req,res)=>{
    const id = Number(req.params.id);
    const { body } = req.body || {};
    if (!body || !String(body).trim()) return res.status(400).json({error:'comment body required'});
    const r = await pool.query(
      `INSERT INTO request_comments(request_id, user_id, body)
       VALUES ($1, $2, $3)
       RETURNING id, body, created_at`, [id, req.user.id, String(body).trim()]
    );
    // write to audit log, if table exists
    try {
      await pool.query(
        'INSERT INTO audit_log(object_type, object_id, action, actor_id, meta) VALUES($1,$2,$3,$4,$5)',
        ['request', id, 'comment', req.user.id, JSON.stringify({ body: String(body).trim().slice(0,500) })]
      );
    } catch {}
    res.status(201).json(r.rows[0]);
  });

  // ===== Request audit feed (compact) =====
  app.get('/api/requests/:id/audit', authRequired, async (req,res)=>{
    const id = Number(req.params.id);
    try{
      const { rows } = await pool.query(
        `SELECT object_type, action, actor_id, meta, created_at
           FROM audit_log
          WHERE object_type='request' AND object_id=$1
          ORDER BY created_at DESC`, [id]
      );
      res.json(rows);
    }catch(e){ res.status(500).json({error:'audit fetch failed'}); }
  });
};
