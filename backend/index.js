 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/backend/index.js b/backend/index.js
index ccf42fb7512c2ca1231e5eab1efd7a03489f28f0..7ea2bed03d8098d01bee321349451d7bb1470e18 100644
--- a/backend/index.js
+++ b/backend/index.js
@@ -1,13 +1,23 @@
 const express = require('express');
 const app = express();
 
-app.get('/', (req, res) => {
-  res.send('Hello World from backend!');
-});
+const authRoutes = require('./routes/auth');
+const procurementRoutes = require('./routes/procurements');
+const { authenticate, authorize } = require('./middleware/auth');
+
+app.use(express.json());
+
+app.use('/auth', authRoutes);
+app.use(
+  '/procurements',
+  authenticate,
+  authorize(['Finance', 'Requester', 'Buyer', 'Approver', 'Admin']),
+  procurementRoutes
+);
 
 const port = process.env.PORT || 3000;
 app.listen(port, () => {
   console.log(`Server running on port ${port}`);
 });
 
 module.exports = app;
 
EOF
)