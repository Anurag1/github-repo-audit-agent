require('dotenv').config();
const GitHubAuditAgent = require('./src/agent/AuditAgent');
const ReportGenerator = require('./src/reports/ReportGenerator');

/**
 * Test the audit agent with a real GitHub profile
 */
async function testAudit() {
  try {
    // Use a well-known GitHub user for testing
    const testUsername = 'torvalds'; // Linus Torvalds - founder of Linux
    
    console.log('\n🔍 Starting LIVE TEST of GitHub Audit Agent');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log(`📋 Target Profile: ${testUsername}`);
    console.log(`⏰ Test Started: ${new Date().toLocaleString()}\n`);

    // Create agent with public access (no token needed for public repos)
    const agent = new GitHubAuditAgent(process.env.GITHUB_TOKEN || null);

    // Run the audit
    console.log('🔄 Fetching profile data...');
    const auditResults = await agent.auditProfile(testUsername);

    console.log('\n✅ Audit completed successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    // Generate and display report
    const report = new ReportGenerator();
    const formattedReport = report.generate(auditResults);
    
    console.log(formattedReport);
    
    // Save report
    await report.saveToFile(formattedReport, testUsername);
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('✨ TEST COMPLETE - Report generated successfully!\n');

    return auditResults;

  } catch (error) {
    console.error('\n❌ Test Failed:', error.message);
    console.error('\nTroubleshooting Tips:');
    console.log('  • Check internet connection');
    console.log('  • Verify GitHub API is accessible');
    console.log('  • If rate limited, set GITHUB_TOKEN in .env');
    process.exit(1);
  }
}

// Run test
if (require.main === module) {
  testAudit().then(results => {
    console.log('\n📊 Audit Results Summary:');
    console.log(`  • Repositories Audited: ${results.repositories.length}`);
    console.log(`  • Total Stars: ${results.profileMetrics.totalStars}`);
    console.log(`  • Success Score: ${results.successMetrics.overallSuccessScore}/100`);
  });
}

module.exports = { testAudit };
