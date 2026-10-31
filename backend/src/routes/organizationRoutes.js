const express = require('express');
const router = express.Router();
const { listMembers, inviteMember, getAuditLogs } = require('../controllers/organizationController');

router.get('/members', listMembers);
router.post('/invite', inviteMember);
router.get('/audit-logs', getAuditLogs);

module.exports = router;

