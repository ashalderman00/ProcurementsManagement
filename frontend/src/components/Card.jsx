import { motion } from "framer-motion";

export function Card({children, className=""}) {
  return <motion.div
    initial={{ opacity: 0, y: 8 }}
    whileInView={{ opacity: 1, y: 0, transition: { duration: .24 } }}
    viewport={{ once: true, margin: "-20%" }}
    className={`card hover-card ${className}`}
  >{children}</motion.div>;
}
export function CardHeader({title, subtitle, actions}) {
  return (
    <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
      <div>
        <div className="text-base font-semibold">{title}</div>
        {subtitle && <div className="text-sm text-slate-500">{subtitle}</div>}
      </div>
      {actions}
    </div>
  );
}
export function CardBody({children, className=""}) {
  return <div className={`px-5 py-4 ${className}`}>{children}</div>;
}
