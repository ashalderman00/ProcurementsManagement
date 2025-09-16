import { AnimatePresence, motion } from "framer-motion";

export default function Drawer({ open, title, children, onClose, footer }) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[9998] flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-black/30" onClick={onClose} />
          <motion.aside
            initial={{ x: 420 }}
            animate={{ x: 0 }}
            exit={{ x: 420 }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            className="ml-auto h-full w-full max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col"
          >
            <header className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base font-semibold">{title}</h3>
              <button
                onClick={onClose}
                className="rounded-md border px-3 py-1.5 text-sm hover:bg-slate-50"
              >
                Close
              </button>
            </header>
            <div className="p-5 overflow-auto">{children}</div>
            {footer && (
              <div className="mt-auto p-4 border-t border-slate-100">{footer}</div>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
