import { useSalesStatsData } from "./hooks/useSalesStatsData";
import SalesStatCard from "./SalesStatCard";
import SalesStatHeader from "./SalesStatHeader";

const SalesStats = () => {
  const { items } = useSalesStatsData();

  return (
    <>
      <SalesStatHeader />

      {/* 6 KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
        {items.map((s, i) => (
          <SalesStatCard key={i} s={s} i={i} />
        ))}
      </div>
    </>
  );
};

export default SalesStats;
