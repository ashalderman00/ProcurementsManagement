 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/backend/index.js b/backend/index.js
index 08a063023e6a56a41c8abebc2fb143f3ac649ba7..1b0453139d1898b39d38a6721ca742c7e8a032d3 100644
--- a/backend/index.js
+++ b/backend/index.js
@@ -1,12 +1,30 @@
 import express from 'express';
+import requestsRouter from './routes/requests.js';
+import approvalsRouter from './routes/approvals.js';
 
 const app = express();
 const port = process.env.PORT || 3000;
 
+app.use(express.json());
+
 app.get('/', (req, res) => {
   res.send('Hello World from backend!');
 });
 
+app.use('/api/requests', requestsRouter);
+app.use('/api/approvals', approvalsRouter);
+
+// 404 handler
+app.use((req, res) => {
+  res.status(404).json({ error: 'Not Found' });
+});
+
+// Error handler
+app.use((err, req, res, next) => {
+  console.error(err);
+  res.status(500).json({ error: 'Internal Server Error' });
+});
+
 app.listen(port, () => {
   console.log(`Server running on port ${port}`);
 });
 
EOF
)