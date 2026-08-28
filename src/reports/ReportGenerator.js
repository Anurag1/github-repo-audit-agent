const fs = require('fs');
const path = require('path');

/**
 * Report Generator
 * Generates formatted audit reports
 */
class ReportGenerator {
  constructor() {
    this.reportsDir = path.join(process.cwd(), 'reports');
    this.ensureReportsDir();
  }

  /**
   * Generate formatted report
   * @param {Object} auditResults - Audit results from agent
   * @returns {string} Formatted report
   */
  generate(auditResults) {
    const sections = [
      this.generateHeader(auditResults),
      this.generateProfileSummary(auditResults),
      this.generateMetricsSummary(auditResults),
      this.generateAdvancementSummary(auditResults),
      this.generateSuccessSummary(auditResults),
      this.generateRepositoriesDetail(auditResults)
    ];

    return sections.join('\n');
  }

  /**
   * Generate report header
   */
  generateHeader(results) {
    const timestamp = new Date(results.auditTimestamp);
    return `
╔═══════════════════════════════════════════════════════════════════╗
║           GITHUB REPOSITORY AUDIT REPORT                         ║
║                                                                   ║
║  Profile: ${results.username}
║  Generated: ${timestamp.toLocaleString()}
║  Total Repositories: ${results.repositories.length}
╚═══════════════════════════════════════════════════════════════════╝
    `;
  }

  /**
   * Generate profile summary
   */
  generateProfileSummary(results) {
    const profile = results.profile;
    return `
📊 PROFILE SUMMARY
─────────────────────────────────────────────────────────────────────
  Name: ${profile.name || 'N/A'}
  Company: ${profile.company || 'N/A'}
  Location: ${profile.location || 'N/A'}
  Bio: ${profile.bio || 'N/A'}
  Public Repos: ${profile.public_repos}
  Followers: ${profile.followers}
  Following: ${profile.following}
  Profile URL: ${profile.html_url}
    `;
  }

  /**
   * Generate metrics summary
   */
  generateMetricsSummary(results) {
    const metrics = results.profileMetrics;
    return `
📈 METRICS SUMMARY
─────────────────────────────────────────────────────────────────────
  Total Repositories: ${metrics.totalRepositories}
  Total Stars: ${metrics.totalStars}
  Total Forks: ${metrics.totalForks}
  Total Watchers: ${metrics.totalWatchers}
  Average Stars per Repo: ${metrics.averageStars}
  Average Forks per Repo: ${metrics.averageForks}
  Total Code Size: ${this.formatBytes(metrics.codeSize)}
  Open Issues: ${metrics.openIssuesCount}

  Top Languages:
${this.formatLanguages(metrics.languageDistribution)}

  Top Repositories:
${this.formatTopRepositories(metrics.topRepositories)}
    `;
  }

  /**
   * Generate advancement summary
   */
  generateAdvancementSummary(results) {
    const advancement = results.advancementMetrics;
    return `
📶 ADVANCEMENT METRICS
─────────────────────────────────────────────────────────────────────
  Growth Indicators:
    • New Repositories: ${advancement.growthIndicators.newRepositories}
    • Active Repositories: ${advancement.growthIndicators.activeRepositories}
    • Mature Repositories: ${advancement.growthIndicators.matureRepositories}

  Activity Status:
    • Recently Active: ${advancement.activityMetrics.recentlyActive}
    • Active Percentage: ${advancement.activityMetrics.activePercentage}%

  Development Velocity: ${advancement.developmentVelocity.velocity}
    • Total Commits: ${advancement.developmentVelocity.totalCommits}
    • Avg Commits per Repo: ${advancement.developmentVelocity.avgCommitsPerRepo}

  Community Growth:
    • Total Contributors: ${advancement.communityGrowth.totalContributors}
    • Total Stargazers: ${advancement.communityGrowth.totalStargazers}

  Project Maturity:
    • Mature Projects: ${advancement.projectMaturity.matureProjectsCount}
    • Mature Percentage: ${advancement.projectMaturity.maturePercentage}%
    `;
  }

  /**
   * Generate success summary
   */
  generateSuccessSummary(results) {
    const success = results.successMetrics;
    return `
🎯 SUCCESS INDICATORS
──────���──────────────────────────────────────────────────────────────
  Overall Success Score: ${success.overallSuccessScore}/100

  Key Achievements:
${success.achievements.map(a => `    ${a}`).join('\n')}

  Success Statistics:
    • High-Star Repositories: ${success.successIndicators.highStarRepositories}
    • Active Projects: ${success.successIndicators.activeProjects}
    • Released Projects: ${success.successIndicators.releasedProjects}
    • Well-Maintained Projects: ${success.successIndicators.wellMaintainedProjects}
    • Community Projects: ${success.successIndicators.communityProjects}

  Project Quality:
    • Average Quality Score: ${success.projectQuality.averageQuality}/100
    • Excellent Projects: ${success.projectQuality.qualityDistribution.excellent}
    • Good Projects: ${success.projectQuality.qualityDistribution.good}

  Community Engagement:
    • Engagement Score: ${success.communityEngagement.engagementScore}

  Maintenance Health:
    • Well-Maintained: ${success.maintenanceHealth.wellMaintainedCount}
    • Abandoned Projects: ${success.maintenanceHealth.abandonedProjects}
    `;
  }

  /**
   * Generate repositories detail
   */
  generateRepositoriesDetail(results) {
    const repos = results.repositories.filter(r => r !== null);
    let detail = `
📚 DETAILED REPOSITORY ANALYSIS
─────────────────────────────────────────────────────────────────────
`;

    repos.forEach((repo, index) => {
      detail += `
${index + 1}. ${repo.name}
   URL: ${repo.url}
   Description: ${repo.description || 'N/A'}
   Language: ${repo.stats.language || 'N/A'}
   
   Stats:
     • Stars: ${repo.stats.stars}
     • Forks: ${repo.stats.forks}
     • Watchers: ${repo.stats.watchers}
     • Open Issues: ${repo.stats.openIssues}
   
   Activity:
     • Created: ${new Date(repo.dates.created).toDateString()}
     • Last Updated: ${new Date(repo.dates.updated).toDateString()}
     • Last Pushed: ${new Date(repo.dates.pushed).toDateString()}
   
   Health: ${repo.detailed?.health || 'N/A'}/100
─────────────────────────────────────────────────────────────────────`;
    });

    return detail;
  }

  /**
   * Format bytes
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  /**
   * Format languages
   */
  formatLanguages(languages) {
    return Object.entries(languages)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([lang, count]) => `    • ${lang}: ${count}`)
      .join('\n');
  }

  /**
   * Format top repositories
   */
  formatTopRepositories(repos) {
    return repos
      .map((r, i) => `    ${i + 1}. ${r.name} (${r.stars} ⭐) - ${r.language || 'N/A'}`)
      .join('\n');
  }

  /**
   * Save report to file
   */
  async saveToFile(report, username) {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `audit-${username}-${timestamp}.txt`;
      const filepath = path.join(this.reportsDir, filename);

      fs.writeFileSync(filepath, report);
      console.log(`✓ Report saved to: ${filepath}`);

      return filepath;
    } catch (error) {
      console.error('Error saving report:', error.message);
    }
  }

  /**
   * Ensure reports directory exists
   */
  ensureReportsDir() {
    if (!fs.existsSync(this.reportsDir)) {
      fs.mkdirSync(this.reportsDir, { recursive: true });
    }
  }
}

module.exports = ReportGenerator;