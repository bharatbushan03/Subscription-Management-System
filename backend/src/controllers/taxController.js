/**
 * Tax & General Ledgers / Economic Nexus Controller
 */

const nexusJurisdictions = [
  { jurisdiction: 'California (CDTFA)', flag: 'US', rule: 'Economic Sales', threshold: '$500,000 / Yr', current: '$440,290', pct: 88, status: 'Warning: Near Limit', statusType: 'danger', rate: '7.25% - 10.25% (Dest.)' },
  { jurisdiction: 'New York (NYS DTF)', flag: 'US', rule: '$500k & 100 Tx', threshold: '$500,000 + 100 tx', current: '$612,400', pct: 100, status: 'Registered & Remitting', statusType: 'success', rate: '8.875% (NYC Metro)' },
  { jurisdiction: 'European Union (OSS)', flag: 'EU', rule: 'Pan-EU Hub', threshold: '€10,000 Pan-EU', current: '€184,300', pct: 100, status: 'Active OSS Registered', statusType: 'success', rate: '19% - 27% Dynamic VAT' },
  { jurisdiction: 'United Kingdom (HMRC)', flag: 'UK', rule: 'Making Tax Digital API v2', threshold: '£85,000 / Yr', current: '£79,900', pct: 94, status: 'Auto-Remitted Qtly', statusType: 'danger', rate: '20.00% Standard VAT' },
  { jurisdiction: 'Canada (GST / HST & CA PST)', flag: 'CA', rule: 'Federal CRA Digital Economy', threshold: 'CAD $30,000 / 12 mo', current: 'CAD $18,400', pct: 61, status: 'Threshold Pending', statusType: 'info', rate: '5% - 15% Harmonized' }
];

const glMappings = [
  { event: 'Subscription Renewal Charge', trigger: 'Trigger: Invoice Paid Event', dr: '1100 - Cash / Stripe Clearing', cr: '2200 - Deferred SaaS Revenue', netsuiteId: 'MAP-NS-1048', status: 'Verified Sync' },
  { event: 'Metered Usage Recognition', trigger: 'Trigger: ASC 606 Daily Batch', dr: '2200 - Deferred SaaS Revenue', cr: '4010 - Software SaaS Revenue', netsuiteId: 'MAP-NS-1087', status: 'Verified Sync' },
  { event: 'Sales Tax Withheld / Charged', trigger: 'Trigger: AvaTax Committed Tax', dr: '1100 - Cash / Stripe Clearing', cr: '2150 - Sales Tax Payable (Avalara)', netsuiteId: 'MAP-NS-2150', status: 'Verified Sync' },
  { event: 'Payment Processing Fees', trigger: 'Trigger: Settlement Payout Batch', dr: '6100 - Merchant Processing Fees', cr: '1100 - Cash / Stripe Clearing', netsuiteId: 'MAP-NS-6100', status: 'Verified Sync' },
  { event: 'Bad Debt Write-off / Dunning', trigger: 'Trigger: Final Dunning Exhaustion', dr: '6500 - Bad Debt Expense', cr: '1200 - Accounts Receivable (AR)', netsuiteId: 'MAP-NS-6500', status: 'Verified Sync' }
];

const getNexusJurisdictions = (req, res) => {
  res.json({
    success: true,
    totalMonitored: 44,
    taxAccruedRemitted: '$128,450.00',
    asc606Recognized: '$1.42M',
    data: nexusJurisdictions
  });
};

const getGLMappings = (req, res) => {
  res.json({
    success: true,
    reconciledPercent: 100,
    unmappedExceptions: 0,
    data: glMappings
  });
};

const testPostGL = (req, res) => {
  const { ruleId } = req.body;
  res.json({
    success: true,
    message: `GL Test Post simulated successfully for NetSuite mapping: ${ruleId || 'MAP-NS-1048'}`,
    timestamp: new Date().toISOString(),
    journalEntryId: `JE-${Date.now()}`
  });
};

module.exports = {
  getNexusJurisdictions,
  getGLMappings,
  testPostGL
};

