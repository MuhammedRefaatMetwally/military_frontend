import { motion } from "framer-motion";
import { activities } from "./utils/activities";

const LatestActivities = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="glass-panel p-5"
    >
      <h3
        className="text-sm font-semibold mb-4"
        style={{ color: "var(--text-primary)" }}
      >
        آخر الأنشطة
      </h3>
      <div className="space-y-3">
        {activities.map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-3 px-4 py-3 rounded-lg transition-colors"
            style={{ background: "transparent" }}
          >
            <span className="text-base">{item.icon}</span>
            <span
              className="text-xs flex-1"
              style={{ color: "var(--text-secondary)" }}
            >
              {item.text}
            </span>
            <span
              className="text-[10px]"
              style={{ color: "var(--text-muted)" }}
            >
              {item.time}
            </span>
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: item.color }}
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default LatestActivities;
