import { Agent } from '../models/agent.model';

type AnalyticsAggregation = {
  statusCounts: Array<{ _id: string; count: number }>;
  serviceAreas: Array<{ _id: string; count: number }>;
};

export const getAnalyticsOverview = async () => {
  const [aggregation] = await Agent.aggregate<AnalyticsAggregation>([
    {
      $facet: {
        statusCounts: [{ $group: { _id: '$status', count: { $sum: 1 } } }],
        serviceAreas: [
          { $group: { _id: '$serviceArea', count: { $sum: 1 } } },
          { $sort: { count: -1, _id: 1 } },
        ],
      },
    },
  ]);

  const statuses = aggregation?.statusCounts ?? [];
  const activeAgents = statuses.find((status) => status._id === 'ACTIVE')?.count ?? 0;
  const inactiveAgents = statuses.find((status) => status._id === 'INACTIVE')?.count ?? 0;
  const serviceAreaDistribution = (aggregation?.serviceAreas ?? []).map(({ _id, count }) => ({ area: _id, count }));

  return {
    totalAgents: activeAgents + inactiveAgents,
    activeAgents,
    inactiveAgents,
    serviceAreas: serviceAreaDistribution.length,
    statusDistribution: { ACTIVE: activeAgents, INACTIVE: inactiveAgents },
    serviceAreaDistribution,
  };
};