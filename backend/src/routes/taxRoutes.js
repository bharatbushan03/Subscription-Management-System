const express = require('express');
const router = express.Router();
const { getNexusJurisdictions, getGLMappings, testPostGL } = require('../controllers/taxController');

router.get('/nexus', getNexusJurisdictions);
router.get('/gl-mappings', getGLMappings);
router.post('/test-post', testPostGL);

module.exports = router;

