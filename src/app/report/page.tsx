'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import ComingSoon from '../../components/ComingSoon';

export default function ReportPage() {
  const router = useRouter();
  return <ComingSoon featureName="Report" onNavigate={(item) => router.push(`/${item}`)} />;
}
