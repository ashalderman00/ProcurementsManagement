 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/backend/index.js b/backend/index.js
index 58b6f367da30c073021c7bc58de7da81a69b1d4b..91dae8dc0f9811c92d16f8ac1122d9c1422cd2c8 100644
--- a/backend/index.js
+++ b/backend/index.js
@@ -1,29 +1,24 @@
- (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
-diff --git a/backend/index.js b/backend/index.js
-index 08a063023e6a56a41c8abebc2fb143f3ac649ba7..c7374b2efd5581e42067d65c4f238696745ca5fd 100644
---- a/backend/index.js
-+++ b/backend/index.js
-@@ -1,12 +1,16 @@
- import express from 'express';
- 
- const app = express();
--const port = process.env.PORT || 3000;
- 
- app.get('/', (req, res) => {
-   res.send('Hello World from backend!');
- });
- 
--app.listen(port, () => {
--  console.log(`Server running on port ${port}`);
--});
-+if (process.env.NODE_ENV !== 'test') {
-+  const port = process.env.PORT || 3000;
-+  app.listen(port, () => {
-+    console.log(`Server running on port ${port}`);
-+  });
-+}
-+
-+export default app;
- 
-EOF
-)
+import express from 'express';
+import { authRouter } from './routes/auth.js';
+import requestsRouter from './routes/requests.js';
+import approvalsRouter from './routes/approvals.js';
+
+const app = express();
+app.use(express.json());
+
+app.get('/', (req, res) => {
+  res.send('Hello World from backend!');
+});
+
+app.use('/auth', authRouter);
+app.use('/requests', requestsRouter);
+app.use('/approvals', approvalsRouter);
+
+if (process.env.NODE_ENV !== 'test') {
+  const port = process.env.PORT || 3000;
+  app.listen(port, () => {
+    console.log(`Server running on port ${port}`);
+  });
+}
+
+export default app;
 
EOF
)