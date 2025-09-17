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
