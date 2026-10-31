/**
 * SaaS Revenue & MRR Analytics Controller
 * Calculates telemetry matching the Brightloop dashboard specs
 */
const getOverviewMetrics = (req, res) => {
  // Mock aggregation based on the design mockup telemetry
  const telemetry = {
    mrr: {
      total: 15000,
      growthRatePercent: 50,
      comparisonPeriod: "April 1 – April 30, 2025 ($10,000 MRR)",
      history: [
        { month: "Jun '24", amount: 2500 },
        { month: "Jul '24", amount: 3000 },
        { month: "Aug '24", amount: 3500 },
        { month: "Sep '24", amount: 5000 },
        { month: "Oct '24", amount: 6200 },
        { month: "Nov '24", amount: 7800 },
        { month: "Dec '24", amount: 8900 },
        { month: "Jan '25", amount: 9500 },
        { month: "Feb '25", amount: 10200 },
        { month: "Mar '25", amount: 11500 },
        { month: "Apr '25", amount: 10000 },
        { month: "May '25", amount: 15000 }
      ]
    },
    kpis: {
      newMrr: { amount: 5000, deltaPercent: 67, trend: "up" },
      expansionMrr: { amount: 2000, deltaPercent: 33, trend: "up" },
      churnedMrr: { amount: 2500, deltaPercent: 17, trend: "down" },
      netNewMrr: { amount: 4500, deltaPercent: 38, trend: "up" }
    },
    activeSubscriptions: {
      count: 428,
      deltaPercent: 14.2,
      byTier: [
        { plan: "Enterprise Cloud", subscribers: 120, mrrShare: 65 },
        { plan: "Pro Growth", subscribers: 215, mrrShare: 28 },
        { plan: "Starter Core", subscribers: 93, mrrShare: 7 }
      ]
    }
  };

  res.json({
    success: true,
    data: telemetry
  });
};

module.exports = {
  getOverviewMetrics
};

