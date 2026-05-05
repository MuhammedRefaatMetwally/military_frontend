'use client';

import React from 'react';
import { ChartTitleFlagBadge } from './ChartTitleFlagBadge';

interface SectionTitleWithFlagProps {
    title: string;
    titleClassName?: string;
}

export default function SectionTitleWithFlag({
    title,
    titleClassName = 'text-sm font-bold',
}: SectionTitleWithFlagProps) {
    return (
        <div className="flex items-center gap-2">
            <ChartTitleFlagBadge flag="green" size="sm" />
            <h3 className={titleClassName} style={{ color: 'var(--text-primary)' }}>{title}</h3>
        </div>
    );
}
