 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/backend/index.js b/backend/index.js
index 08a063023e6a56a41c8abebc2fb143f3ac649ba7..c7374b2efd5581e42067d65c4f238696745ca5fd 100644
--- a/backend/index.js
+++ b/backend/index.js
@@ -1,12 +1,16 @@
 import express from 'express';
 
 const app = express();
-const port = process.env.PORT || 3000;
 
 app.get('/', (req, res) => {
   res.send('Hello World from backend!');
 });
 
-app.listen(port, () => {
-  console.log(`Server running on port ${port}`);
-});
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