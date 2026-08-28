const { Octokit } = require('@octokit/rest');
const RepositoryAuditor = require('../auditors/RepositoryAuditor');
const MetricsCalculator = require('../metrics/MetricsCalculator');
const AdvancementTracker = require('../metrics/AdvancementTracker');
const SuccessIndicator = require('../metrics/SuccessIndicator');

/**
 * Main Audit Agent class
 * Orchestrates the audit process for a GitHub profile
 */
class GitHubAuditAgent {
  constructor(githubToken) {
    this.octokit = new Octokit({ auth: githubToken });
    this.repositoryAuditor = new RepositoryAuditor(this.octokit);
    this.metricsCalculator = new MetricsCalculator();
    this.advancementTracker = new AdvancementTracker();
    this.successIndicator = new SuccessIndicator();
  }

  /**
   * Audit a GitHub profile comprehensively
   * @param {string} username - GitHub username to audit
   * @returns {Promise<Object>} Audit results
   */
  async auditProfile(username) {
    try {
      // Get user profile information
      const userProfile = await this.octokit.users.getByUsername({ username });
      console.log(`✓ Retrieved profile for ${username}`);

      // Get all repositories
      const repositories = await this.getAllRepositories(username);
      console.log(`✓ Found ${repositories.length} repositories`);

      // Audit each repository
      const auditedRepos = await Promise.all(
        repositories.map(repo => this.auditRepository(username, repo))
      );
      console.log(`✓ Audited all repositories`);

      // Calculate aggregate metrics
      const profileMetrics = this.metricsCalculator.calculateProfileMetrics(auditedRepos);
      const advancementMetrics = this.advancementTracker.trackAdvancement(auditedRepos);
      const successMetrics = this.successIndicator.calculateSuccessScore(auditedRepos);

      return {
        username,
        profile: userProfile.data,
        repositories: auditedRepos,
        profileMetrics,
        advancementMetrics,
        successMetrics,
        auditTimestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error auditing profile ${username}:`, error.message);
      throw error;
    }
  }

  /**
   * Get all repositories for a user
   * @param {string} username - GitHub username
   * @returns {Promise<Array>} List of repositories
   */
  async getAllRepositories(username) {
    const repositories = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await this.octokit.repos.listForUser({
        username,
        sort: 'updated',
        direction: 'desc',
        per_page: 100,
        page
      });

      repositories.push(...response.data);
      hasMore = response.data.length === 100;
      page++;
    }

    return repositories;
  }

  /**
   * Audit a single repository
   * @param {string} owner - Repository owner
   * @param {Object} repo - Repository object
   * @returns {Promise<Object>} Audit results for repository
   */
  async auditRepository(owner, repo) {
    try {
      const repoAudit = {
        name: repo.name,
        url: repo.html_url,
        description: repo.description,
        stats: {
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          watchers: repo.watchers_count,
          openIssues: repo.open_issues_count,
          language: repo.language,
          size: repo.size,
          isPrivate: repo.private,
          isFork: repo.fork
        },
        dates: {
          created: repo.created_at,
          updated: repo.updated_at,
          pushed: repo.pushed_at
        }
      };

      // Get detailed audit
      const detailed = await this.repositoryAuditor.audit(owner, repo.name);
      repoAudit.detailed = detailed;

      return repoAudit;
    } catch (error) {
      console.error(`Error auditing repository ${repo.name}:`, error.message);
      return null;
    }
  }
}

module.exports = GitHubAuditAgent;