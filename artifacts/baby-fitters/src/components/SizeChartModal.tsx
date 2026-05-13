import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { getSizeChart, DEFAULT_SIZE_CHART, type SizeChartRow } from "@/lib/site-settings";

export function SizeChartModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [rows, setRows] = useState<SizeChartRow[]>(DEFAULT_SIZE_CHART);

  useEffect(() => {
    if (open) {
      getSizeChart().then(setRows);
    }
  }, [open]);

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
                <p className="eyebrow">Size Guide</p>
                <h2 className="font-display text-2xl mt-1">Baby Fitters Size Chart</h2>
              </div>
              <button onClick={onClose} className="w-9 h-9 rounded-full hover:bg-muted flex items-center justify-center">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 overflow-y-auto max-h-[70vh]">
              <p className="text-[14px] text-muted-foreground mb-4">
                Sizes are in inches. For a relaxed fit, choose one size up. Measurements may vary slightly by style.
              </p>
              <div className="overflow-x-auto rounded-2xl border border-border">
                <table className="w-full text-[14px]">
                  <thead className="bg-muted">
                    <tr className="text-left">
                      <th className="px-4 py-3 font-bold">Size</th>
                      <th className="px-4 py-3 font-bold">Chest</th>
                      <th className="px-4 py-3 font-bold">Length</th>
                      <th className="px-4 py-3 font-bold">Weight</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.size} className="border-t border-border hover:bg-muted/40">
                        <td className="px-4 py-3 font-bold">{r.size}</td>
                        <td className="px-4 py-3">{r.chest}</td>
                        <td className="px-4 py-3">{r.length}</td>
                        <td className="px-4 py-3">{r.weight}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
