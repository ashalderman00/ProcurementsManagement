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
    try {
      const { rows } = await pool.query(
        `SELECT object_type, action, actor_id, meta, created_at
           FROM audit_log
          WHERE object_type='request' AND object_id=$1
          ORDER BY created_at DESC`, [id]
      );
      res.json(rows);
    } catch (e) {
      res.status(500).json({error:'audit fetch failed'});
    }
  });
};
