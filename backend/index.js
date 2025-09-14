 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/backend/index.js b/backend/index.js
index 08a063023e6a56a41c8abebc2fb143f3ac649ba7..b2308f9d2ce1ebb0f5a69ad18d1f88e1ae027a4b 100644
--- a/backend/index.js
+++ b/backend/index.js
@@ -1,12 +1,36 @@
 import express from 'express';
+import dotenv from 'dotenv';
+import { authRouter, ROLES } from './routes/auth.js';
+import { authenticateToken, authorizeRoles } from './middleware/auth.js';
+
+dotenv.config();
+
+if (!process.env.JWT_SECRET) {
+  console.error('JWT_SECRET is not defined');
+  process.exit(1);
+}
 
 const app = express();
 const port = process.env.PORT || 3000;
 
+app.use(express.json());
+
+app.use('/auth', authRouter);
+
+// Example protected route requiring administrator role
+app.get(
+  '/admin',
+  authenticateToken,
+  authorizeRoles(ROLES.ADMINISTRATOR),
+  (req, res) => {
+    res.json({ message: 'Administrator content' });
+  }
+);
+
 app.get('/', (req, res) => {
   res.send('Hello World from backend!');
 });
 
 app.listen(port, () => {
   console.log(`Server running on port ${port}`);
 });
 
EOF
)