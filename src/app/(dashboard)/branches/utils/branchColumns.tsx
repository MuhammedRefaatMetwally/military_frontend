import { TableColumn } from "@/components/ui/EnterpriseTable";
import type { BranchData } from "@/lib/mockData";

export function getBranchColumns(
  branches: BranchData[],
): TableColumn<BranchData>[] {
  const maxRev = Math.max(...branches.map((b) => b.revenue), 1);
  const maxOrd = Math.max(...branches.map((b) => b.orders), 1);
  const maxCust = Math.max(...branches.map((b) => b.customers), 1);
  return [
    { key: "nameAr", header: "الفرع", sortable: true },
    { key: "regionAr", header: "المنطقة", sortable: true },
    {
      key: "revenue",
      header: "الإيرادات",
      sortable: true,
      align: "center",
      format: "currency",
      analyticsBar: { max: maxRev },
    },
    {
      key: "orders",
      header: "الطلبات",
      sortable: true,
      align: "center",
      format: "number",
      analyticsBar: { max: maxOrd },
    },
    {
      key: "customers",
      header: "العملاء",
      sortable: true,
      align: "center",
      format: "number",
      analyticsBar: { max: maxCust },
    },
    {
      key: "growth",
      header: "النمو",
      sortable: true,
      align: "right",
      format: "change",
    },
    {
      key: "performance",
      header: "الأداء",
      sortable: true,
      align: "center",
      render: (val: unknown) => {
        const v = Number(val);
        const color =
          v >= 85
            ? "var(--accent-green)"
            : v >= 70
              ? "var(--accent-amber)"
              : "var(--accent-red)";
        return (
          <div className="flex items-center gap-2 justify-center">
            <div
              className="w-16 h-1.5 rounded-full overflow-hidden"
              style={{ background: "var(--bg-elevated)" }}
            >
              <div
                className="h-full rounded-full"
                style={{ width: `${v}%`, background: color }}
              />
            </div>
            <span className="text-xs font-semibold" style={{ color }} dir="ltr">
              {v}%
            </span>
          </div>
        );
      },
    },
  ];
}
