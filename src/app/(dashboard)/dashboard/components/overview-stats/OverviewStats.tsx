import { stats } from "./utils/stats";

const OverviewStats = () => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 items-center gap-3">
      {stats.map(({ icon: Icon, label, value, color, dir }, i) => (
        <div
          key={i}
          className="flex items-center gap-2 px-3 py-2 rounded-lg glass-panel"
        >
          <Icon size={14} style={{ color }} />
          <span
            className="text-xs font-medium"
            style={{ color: "var(--text-secondary)" }}
          >
            {label}
          </span>
          <span className="text-xs font-bold" style={{ color }} dir={dir}>
            {value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default OverviewStats;
