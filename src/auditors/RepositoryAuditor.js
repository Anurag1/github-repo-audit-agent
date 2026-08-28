/**
 * Repository Auditor
 * Performs detailed audit on individual repositories
 */
class RepositoryAuditor {
  constructor(octokit) {
    this.octokit = octokit;
  }

  /**
   * Audit a repository
   * @param {string} owner - Repository owner
   * @param {string} repo - Repository name
   * @returns {Promise<Object>} Audit results
   */
  async audit(owner, repo) {
    try {
      const [commits, issues, pulls, releases, languages, contributors] = await Promise.all([
        this.getCommitStats(owner, repo),
        this.getIssueStats(owner, repo),
        this.getPullRequestStats(owner, repo),
        this.getReleaseStats(owner, repo),
        this.getLanguageStats(owner, repo),
        this.getContributorStats(owner, repo)
      ]);

      return {
        commits,
        issues,
        pulls,
        releases,
        languages,
        contributors,
        health: this.calculateRepositoryHealth({
          commits,
          issues,
          pulls,
          releases,
          contributors
        })
      };
    } catch (error) {
      console.error(`Error auditing ${owner}/${repo}:`, error.message);
      return null;
    }
  }

  /**
   * Get commit statistics
   */
  async getCommitStats(owner, repo) {
    try {
      const commits = await this.octokit.repos.getCommitActivityStats({
        owner,
        repo
      });

      return {
        totalCommits: commits.data ? commits.data.reduce((sum, week) => sum + week.total, 0) : 0,
        lastWeekCommits: commits.data ? (commits.data[commits.data.length - 1]?.total || 0) : 0,
        weeksActive: commits.data ? commits.data.length : 0
      };
    } catch (error) {
      return { totalCommits: 0, lastWeekCommits: 0, weeksActive: 0, error: error.message };
    }
  }

  /**
   * Get issue statistics
   */
  async getIssueStats(owner, repo) {
    try {
      const openIssues = await this.octokit.issues.listForRepo({
        owner,
        repo,
        state: 'open',
        per_page: 1
      });

      const closedIssues = await this.octokit.issues.listForRepo({
        owner,
        repo,
        state: 'closed',
        per_page: 1
      });

      return {
        open: openIssues.headers['x-total-count'] || 0,
        closed: closedIssues.headers['x-total-count'] || 0,
        ratio: closedIssues.headers['x-total-count'] / (openIssues.headers['x-total-count'] || 1)
      };
    } catch (error) {
      return { open: 0, closed: 0, ratio: 0, error: error.message };
    }
  }

  /**
   * Get pull request statistics
   */
  async getPullRequestStats(owner, repo) {
    try {
      const openPRs = await this.octokit.pulls.list({
        owner,
        repo,
        state: 'open',
        per_page: 1
      });

      const closedPRs = await this.octokit.pulls.list({
        owner,
        repo,
        state: 'closed',
        per_page: 1
      });

      return {
        open: openPRs.headers['x-total-count'] || 0,
        closed: closedPRs.headers['x-total-count'] || 0,
        mergeRatio: closedPRs.headers['x-total-count'] / (openPRs.headers['x-total-count'] || 1)
      };
    } catch (error) {
      return { open: 0, closed: 0, mergeRatio: 0, error: error.message };
    }
  }

  /**
   * Get release statistics
   */
  async getReleaseStats(owner, repo) {
    try {
      const releases = await this.octokit.repos.listReleases({
        owner,
        repo,
        per_page: 100
      });

      const releaseCount = releases.data.length;
      const latestRelease = releases.data[0];

      return {
        totalReleases: releaseCount,
        latestRelease: latestRelease ? {
          name: latestRelease.name,
          tag: latestRelease.tag_name,
          date: latestRelease.published_at
        } : null,
        releaseFrequency: this.calculateReleaseFrequency(releases.data)
      };
    } catch (error) {
      return { totalReleases: 0, latestRelease: null, releaseFrequency: 0, error: error.message };
    }
  }

  /**
   * Get language statistics
   */
  async getLanguageStats(owner, repo) {
    try {
      const languages = await this.octokit.repos.listLanguages({
        owner,
        repo
      });

      return languages.data;
    } catch (error) {
      return { error: error.message };
    }
  }

  /**
   * Get contributor statistics
   */
  async getContributorStats(owner, repo) {
    try {
      const contributors = await this.octokit.repos.listContributors({
        owner,
        repo,
        per_page: 100
      });

      return {
        totalContributors: contributors.headers['x-total-count'] || contributors.data.length,
        topContributors: contributors.data.slice(0, 5).map(c => ({
          login: c.login,
          contributions: c.contributions
        }))
      };
    } catch (error) {
      return { totalContributors: 0, topContributors: [], error: error.message };
    }
  }

  /**
   * Calculate repository health score
   */
  calculateRepositoryHealth(stats) {
    let score = 0;

    if (stats.commits.totalCommits > 100) score += 20;
    if (stats.issues.closed > 10) score += 20;
    if (stats.pulls.closed > 5) score += 20;
    if (stats.releases.totalReleases > 0) score += 20;
    if (stats.contributors.totalContributors > 2) score += 20;

    return Math.min(score, 100);
  }

  /**
   * Calculate release frequency (releases per month)
   */
  calculateReleaseFrequency(releases) {
    if (releases.length < 2) return 0;

    const oldest = new Date(releases[releases.length - 1].published_at);
    const newest = new Date(releases[0].published_at);
    const months = (newest - oldest) / (1000 * 60 * 60 * 24 * 30);

    return months > 0 ? (releases.length / months).toFixed(2) : 0;
  }
}

module.exports = RepositoryAuditor;