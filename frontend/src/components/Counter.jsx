import { useEffect, useState } from "react";
export default function Counter({ value=0, duration=600 }) {
  const [n, setN] = useState(0);
  useEffect(()=>{
    const start = performance.now();
    let raf;
    const step = (t) => {
      const p = Math.min(1, (t - start) / duration);
      setN(Math.round(value * p));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <span>{n}</span>;
}
