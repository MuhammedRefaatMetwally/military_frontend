import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type VerticalIndicatorCardProps = {
  icon: LucideIcon;
  /** خلفية الدائرة خلف الأيقونة */
  iconOrbBackground: string;
  /** لون الأيقونة */
  iconColor: string;
  titleAr: string;
  titleEn: string;
  /** القيمة الرئيسية (نص أو عنصر) */
  value: ReactNode;
  valueColor: string;
};

export default function VerticalIndicatorCard({
  icon: Icon,
  iconOrbBackground,
  iconColor,
  titleAr,
  titleEn,
  value,
  valueColor,
}: VerticalIndicatorCardProps) {
  return (
    <div className="glass-panel ai-module p-4 text-center w-full flex flex-col items-center gap-4">
      <div
        className="mx-auto w-10 h-10 rounded-full flex items-center justify-center mb-2"
        style={{ background: iconOrbBackground }}
      >
        <Icon size={18} style={{ color: iconColor }} />
      </div>
      <p
        className="text-[12px] font-semibold"
        style={{ color: "var(--text-muted)" }}
      >
        {titleAr}
      </p>
      <p className="text-[12px]" style={{ color: "var(--text-muted)" }}>
        {titleEn}
      </p>
      <p
        className="text-xl font-bold mt-1"
        style={{ color: valueColor }}
        dir="ltr"
      >
        {value}
      </p>
    </div>
  );
}
