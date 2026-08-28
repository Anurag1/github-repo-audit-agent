require('dotenv').config();
const GitHubAuditAgent = require('./agent/AuditAgent');
const ReportGenerator = require('./reports/ReportGenerator');

/**
 * Main entry point for the GitHub Audit Agent
 */
async function main() {
  try {
    const githubToken = process.env.GITHUB_TOKEN;
    const targetUsername = process.env.GITHUB_USERNAME;

    if (!githubToken || !targetUsername) {
      throw new Error('GITHUB_TOKEN and GITHUB_USERNAME environment variables are required');
    }

    console.log(`🔍 Starting audit for GitHub profile: ${targetUsername}`);

    // Initialize the audit agent
    const agent = new GitHubAuditAgent(githubToken);

    // Run comprehensive audit
    console.log('📊 Analyzing repositories...');
    const auditResults = await agent.auditProfile(targetUsername);

    // Generate report
    console.log('📝 Generating report...');
    const report = new ReportGenerator();
    const formattedReport = report.generate(auditResults);

    console.log('\n✅ Audit complete!');
    console.log('\n' + formattedReport);

    // Save report to file
    await report.saveToFile(formattedReport, targetUsername);

  } catch (error) {
    console.error('❌ Error during audit:', error.message);
    process.exit(1);
  }
}

module.exports = { main };

if (require.main === module) {
  main();
}