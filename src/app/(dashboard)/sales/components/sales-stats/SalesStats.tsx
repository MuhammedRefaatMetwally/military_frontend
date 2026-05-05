import { salesStats } from "./utils/salesStats";
import SalesStatCard from "./SalesStatCard";
import SalesStatHeader from "./SalesStatHeader";

const SalesStats = () => {
  return (
    <>
      <SalesStatHeader />

      {/* 6 KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {salesStats.map((s, i) => (
          <SalesStatCard key={i} s={s} i={i} />
        ))}
      </div>
    </>
  );
};

export default SalesStats;
