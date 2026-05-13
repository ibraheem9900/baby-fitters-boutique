import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

const ROWS = [
  { size: "0–3 M", chest: "16\"", length: "14\"", weight: "3–6 kg" },
  { size: "3–6 M", chest: "17\"", length: "15\"", weight: "6–8 kg" },
  { size: "6–12 M", chest: "18\"", length: "16\"", weight: "8–10 kg" },
  { size: "1–2 Y", chest: "19\"", length: "17\"", weight: "10–12 kg" },
  { size: "2–3 Y", chest: "20\"", length: "18\"", weight: "12–14 kg" },
  { size: "3–4 Y", chest: "21\"", length: "19\"", weight: "14–16 kg" },
  { size: "5–6 Y", chest: "23\"", length: "21\"", weight: "16–20 kg" },
  { size: "7–8 Y", chest: "25\"", length: "23\"", weight: "20–25 kg" },
  { size: "9–10 Y", chest: "27\"", length: "25\"", weight: "25–32 kg" },
];

export function SizeChartModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] bg-foreground/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 240, damping: 24 }}
            className="bg-card rounded-3xl border border-border max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-pillow"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-bold">Size Guide</p>
                <h2 className="font-display text-2xl mt-1">Baby Fitters Size Chart</h2>
              </div>
              <button onClick={onClose} className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto max-h-[70vh]">
              <p className="text-sm text-muted-foreground mb-4">
                Sizes are in inches. For a relaxed fit, choose one size up. Measurements may vary slightly by style.
              </p>
              <div className="overflow-x-auto rounded-2xl border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted">
                    <tr className="text-left">
                      <th className="px-4 py-3 font-semibold">Size</th>
                      <th className="px-4 py-3 font-semibold">Chest</th>
                      <th className="px-4 py-3 font-semibold">Length</th>
                      <th className="px-4 py-3 font-semibold">Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ROWS.map((r) => (
                      <tr key={r.size} className="border-t border-border hover:bg-muted/40">
                        <td className="px-4 py-3 font-semibold">{r.size}</td>
                        <td className="px-4 py-3">{r.chest}</td>
                        <td className="px-4 py-3">{r.length}</td>
                        <td className="px-4 py-3">{r.weight}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-muted-foreground mt-4">
                Tip: Lay a similar garment flat and measure across the chest just below the armholes.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
