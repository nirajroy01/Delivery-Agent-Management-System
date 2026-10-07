export type AnalyticsOverview = {
  totalAgents: number;
  activeAgents: number;
  inactiveAgents: number;
  serviceAreas: number;
  statusDistribution: {
    ACTIVE: number;
    INACTIVE: number;
  };
  serviceAreaDistribution: Array<{
    area: string;
    count: number;
  }>;
};