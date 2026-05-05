import EnterpriseTable, { TableColumn } from "@/components/ui/EnterpriseTable";
import { Agreement, agreements } from "../../utils/agreements";

const columns: TableColumn<Agreement>[] = [
  { key: "name", header: "الاتفاقية", sortable: true },
  { key: "partner", header: "الشريك", sortable: true },
  { key: "typeAr", header: "النوع" },
  {
    key: "value",
    header: "القيمة",
    sortable: true,
    align: "right",
    format: "currency",
  },
  { key: "materials", header: "المواد", align: "center" },
  {
    key: "profitMargin",
    header: "الهامش %",
    align: "center",
    render: (val: unknown) => (
      <span
        className="text-xs font-semibold"
        style={{
          color: Number(val) > 0 ? "var(--accent-green)" : "var(--text-muted)",
        }}
        dir="ltr"
      >
        {Number(val) > 0 ? `${val}%` : "—"}
      </span>
    ),
  },
  {
    key: "discountRate",
    header: "الخصم %",
    align: "center",
    render: (val: unknown) => (
      <span
        className="text-xs font-semibold"
        style={{
          color: Number(val) > 0 ? "var(--accent-amber)" : "var(--text-muted)",
        }}
        dir="ltr"
      >
        {Number(val) > 0 ? `${val}%` : "—"}
      </span>
    ),
  },
  {
    key: "statusAr",
    header: "الحالة",
    align: "center",
    render: (val: unknown, row: Agreement) => {
      const color =
        row.status === "Active"
          ? "var(--accent-green)"
          : row.status === "Expiring"
            ? "var(--accent-amber)"
            : "var(--accent-blue)";
      return (
        <span
          className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
          style={{
            background: `color-mix(in srgb, ${String(color)} 15%, transparent)`,
            color: String(color),
          }}
        >
          {String(val)}
        </span>
      );
    },
  },
];

const AgreementsGuide = () => {
  return (
    <EnterpriseTable
      title="دليل الاتفاقيات"
      columns={columns}
      data={agreements}
      pageSize={10}
    />
  );
};

export default AgreementsGuide;
