/**
 * HtmlLegend - Custom HTML legend for chart
 */

interface LegendItem {
  color: string;
  name: string;
}

interface HtmlLegendProps {
  items: LegendItem[];
}

export function HtmlLegend({ items }: HtmlLegendProps) {
  return (
    <div
      className="flex items-center justify-center gap-4"
      style={{ padding: "2px 0 6px" }}
    >
      {items.map((item) => (
        <div key={item.name} className="flex items-center gap-1.5">
          <span
            style={{
              display: "inline-block",
              width: 12,
              height: 8,
              borderRadius: 2,
              background: item.color,
              flexShrink: 0,
            }}
          />
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
            {item.name}
          </span>
        </div>
      ))}
    </div>
  );
}
