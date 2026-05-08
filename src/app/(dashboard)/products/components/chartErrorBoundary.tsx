import dynamic from 'next/dynamic';
import React from 'react';
import type { ChartCardTitleFlag } from '@/components/ui/chart-card/ChartCard';

const ChartCard = dynamic(
  () => import('@/components/ui/chart-card/ChartCard'),
  {
    ssr: false,
    loading: () => <div style={{ height: 320 }}>Loading chart...</div>,
  }
);

// ─── Wider error type ──────────────────────────────────────────────────────────
// ApiError from axiosInstance doesn't extend the native Error class (missing
// `name`), so we accept any object that has a `message` string instead of
// narrowing to Error | null.

type AnyError = { message?: string } | null | undefined;

interface ChartErrorBoundaryProps {
  title: string;
  subtitle: string;
  isLoading: boolean;
  error?: AnyError;
  onRetry?: () => void;
  children: React.ReactNode;
  height?: string;
  // Derived directly from ChartCard so this never drifts out of sync again
  titleFlag?: ChartCardTitleFlag;
  delay?: number;
}

export function ChartErrorBoundary({
  title,
  subtitle,
  isLoading,
  error,
  onRetry,
  children,
  height = '320px',
  titleFlag = 'green',
  delay = 1,
}: ChartErrorBoundaryProps) {
  if (isLoading) {
    return (
      <ChartCard
        title={title}
        subtitle={subtitle}
        titleFlag={titleFlag}
        option={{}}
        height={height}
        delay={delay}
      />
    );
  }

  if (error) {
    return (
      <div
        style={{
          height,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          backgroundColor: 'var(--bg-secondary)',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
        }}
      >
        <div style={{ textAlign: 'center' }}>
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>
            خطأ في تحميل البيانات
          </h3>
          <p
            style={{
              color: 'var(--text-muted)',
              fontSize: '12px',
              marginBottom: '12px',
            }}
          >
            {error.message ?? 'حدث خطأ غير متوقع'}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              style={{
                padding: '6px 12px',
                backgroundColor: 'var(--accent-green)',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              إعادة المحاولة
            </button>
          )}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}