'use client';

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';

interface HealthStatus {
  healthy: boolean;
  services: {
    shopify: string;
    postgres: string;
    redis: string;
    gemini: string;
    razorpay: string;
  };
  timestamp: string;
}

export default function IntegrationsPage() {
  const [status, setStatus] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const checkHealth = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setStatus(data);
    } catch (err) {
      console.error('Failed to fetch health status', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 10000); // Check every 10s
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (state: string) => {
    if (state === 'CONNECTED' || state === 'TEST MODE') return '#10B981'; // Green
    if (state === 'CONNECTED_NO_DATA') return '#F59E0B'; // Yellow
    return '#EF4444'; // Red
  };

  return (
    <PageContainer>
      <Header>
        <h1>System Integrations</h1>
        <p>Commerce Sentinel Core Connections</p>
      </Header>

      <Card>
        <CardHeader>
          <h2>Backend Services</h2>
          <RefreshButton onClick={checkHealth} disabled={loading}>
            {loading ? 'Checking...' : 'Refresh'}
          </RefreshButton>
        </CardHeader>

        {loading && !status ? (
          <LoadingState>Verifying connections...</LoadingState>
        ) : status ? (
          <ServiceList>
            <ServiceItem>
              <ServiceName>Shopify</ServiceName>
              <StatusBadge $color={getStatusColor(status.services.shopify)}>
                <StatusDot $color={getStatusColor(status.services.shopify)} />
                {status.services.shopify}
              </StatusBadge>
            </ServiceItem>

            <ServiceItem>
              <ServiceName>PostgreSQL</ServiceName>
              <StatusBadge $color={getStatusColor(status.services.postgres)}>
                <StatusDot $color={getStatusColor(status.services.postgres)} />
                {status.services.postgres}
              </StatusBadge>
            </ServiceItem>

            <ServiceItem>
              <ServiceName>Upstash Redis</ServiceName>
              <StatusBadge $color={getStatusColor(status.services.redis)}>
                <StatusDot $color={getStatusColor(status.services.redis)} />
                {status.services.redis}
              </StatusBadge>
            </ServiceItem>

            <ServiceItem>
              <ServiceName>Gemini</ServiceName>
              <StatusBadge $color={getStatusColor(status.services.gemini)}>
                <StatusDot $color={getStatusColor(status.services.gemini)} />
                {status.services.gemini}
              </StatusBadge>
            </ServiceItem>

            <ServiceItem>
              <ServiceName>Razorpay</ServiceName>
              <StatusBadge $color={getStatusColor(status.services.razorpay)}>
                <StatusDot $color={getStatusColor(status.services.razorpay)} />
                {status.services.razorpay}
              </StatusBadge>
            </ServiceItem>
          </ServiceList>
        ) : (
          <ErrorState>Failed to load integration status. Check network tab.</ErrorState>
        )}
      </Card>
      
      {status && (
        <LastUpdated>
          Last checked: {new Date(status.timestamp).toLocaleTimeString()}
        </LastUpdated>
      )}
    </PageContainer>
  );
}

// ─── STYLES ───

const PageContainer = styled.div`
  min-height: 100vh;
  background-color: #0f172a;
  color: #f8fafc;
  padding: 40px;
  font-family: 'Inter', sans-serif;
`;

const Header = styled.div`
  margin-bottom: 40px;

  h1 {
    font-size: 28px;
    font-weight: 700;
    margin: 0 0 8px 0;
    background: linear-gradient(90deg, #38bdf8, #818cf8);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  p {
    color: #94a3b8;
    margin: 0;
  }
`;

const Card = styled.div`
  background: rgba(30, 41, 59, 0.7);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 24px;
  max-width: 600px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(10px);
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  padding-bottom: 16px;

  h2 {
    font-size: 18px;
    font-weight: 600;
    margin: 0;
    color: #f1f5f9;
  }
`;

const RefreshButton = styled.button`
  background: #334155;
  color: #f8fafc;
  border: none;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: #475569;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ServiceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ServiceItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: rgba(15, 23, 42, 0.5);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.03);
`;

const ServiceName = styled.div`
  font-weight: 500;
  color: #e2e8f0;
  font-size: 15px;
`;

const StatusBadge = styled.div<{ $color: string }>`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: ${props => props.$color};
  background: ${props => `${props.$color}15`};
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid ${props => `${props.$color}30`};
`;

const StatusDot = styled.div<{ $color: string }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => props.$color};
  box-shadow: 0 0 8px ${props => props.$color};
`;

const LoadingState = styled.div`
  padding: 40px 0;
  text-align: center;
  color: #94a3b8;
  font-size: 15px;
`;

const ErrorState = styled.div`
  padding: 20px;
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  border-radius: 8px;
  text-align: center;
  font-size: 14px;
`;

const LastUpdated = styled.div`
  margin-top: 16px;
  font-size: 12px;
  color: #64748b;
  max-width: 600px;
  text-align: right;
`;
