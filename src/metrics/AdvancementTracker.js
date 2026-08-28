/**
 * Advancement Tracker
 * Tracks growth and advancement metrics
 */
class AdvancementTracker {
  /**
   * Track advancement indicators
   * @param {Array} repositories - Audited repositories
   * @returns {Object} Advancement metrics
   */
  trackAdvancement(repositories) {
    const validRepos = repositories.filter(r => r !== null);

    return {
      growthIndicators: this.calculateGrowthIndicators(validRepos),
      activityMetrics: this.calculateActivityMetrics(validRepos),
      developmentVelocity: this.calculateDevelopmentVelocity(validRepos),
      communityGrowth: this.calculateCommunityGrowth(validRepos),
      projectMaturity: this.assessProjectMaturity(validRepos)
    };
  }

  /**
   * Calculate growth indicators
   */
  calculateGrowthIndicators(repos) {
    const reposByAge = this.groupByAge(repos);

    return {
      newRepositories: reposByAge.young || 0,
      activeRepositories: reposByAge.active || 0,
      matureRepositories: reposByAge.mature || 0,
      totalGrowth: repos.length,
      avgStarGrowth: this.calculateAverageGrowth(repos)
    };
  }

  /**
   * Calculate activity metrics
   */
  calculateActivityMetrics(repos) {
    const now = new Date();
    const recent = repos.filter(r => {
      const pushed = new Date(r.dates.pushed);
      const daysSincePush = (now - pushed) / (1000 * 60 * 60 * 24);
      return daysSincePush < 30;
    });

    return {
      recentlyActive: recent.length,
      activePercentage: ((recent.length / repos.length) * 100).toFixed(2),
      commitActivity: this.summarizeCommitActivity(repos)
    };
  }

  /**
   * Calculate development velocity
   */
  calculateDevelopmentVelocity(repos) {
    const totalCommits = repos.reduce((sum, r) => {
      return sum + (r.detailed?.commits?.totalCommits || 0);
    }, 0);

    const avgCommitsPerRepo = (totalCommits / repos.length).toFixed(2);

    return {
      totalCommits,
      avgCommitsPerRepo,
      velocity: this.assessVelocity(totalCommits, repos.length)
    };
  }

  /**
   * Calculate community growth
   */
  calculateCommunityGrowth(repos) {
    const totalContributors = repos.reduce((sum, r) => {
      return sum + (r.detailed?.contributors?.totalContributors || 0);
    }, 0);

    const avgContributorsPerRepo = (totalContributors / repos.length).toFixed(2);

    return {
      totalContributors,
      avgContributorsPerRepo,
      totalStargazers: repos.reduce((sum, r) => sum + r.stats.stars, 0),
      totalWatchers: repos.reduce((sum, r) => sum + r.stats.watchers, 0)
    };
  }

  /**
   * Assess project maturity
   */
  assessProjectMaturity(repos) {
    const mature = repos.filter(r => {
      const created = new Date(r.dates.created);
      const ageInMonths = (new Date() - created) / (1000 * 60 * 60 * 24 * 30);
      return ageInMonths > 12 && r.detailed?.releases?.totalReleases > 0;
    });

    return {
      matureProjectsCount: mature.length,
      maturePercentage: ((mature.length / repos.length) * 100).toFixed(2),
      averageProjectAge: this.calculateAverageAge(repos)
    };
  }

  /**
   * Group repositories by age
   */
  groupByAge(repos) {
    const now = new Date();
    let young = 0, active = 0, mature = 0;

    repos.forEach(r => {
      const created = new Date(r.dates.created);
      const ageInMonths = (now - created) / (1000 * 60 * 60 * 24 * 30);

      if (ageInMonths < 6) young++;
      else if (ageInMonths < 24) active++;
      else mature++;
    });

    return { young, active, mature };
  }

  /**
   * Calculate average growth
   */
  calculateAverageGrowth(repos) {
    const stars = repos.map(r => r.stats.stars);
    if (stars.length === 0) return 0;
    return (stars.reduce((a, b) => a + b, 0) / stars.length).toFixed(2);
  }

  /**
   * Summarize commit activity
   */
  summarizeCommitActivity(repos) {
    const activity = repos.map(r => r.detailed?.commits?.lastWeekCommits || 0);
    return {
      thisWeek: activity.reduce((a, b) => a + b, 0),
      average: (activity.reduce((a, b) => a + b, 0) / repos.length).toFixed(2)
    };
  }

  /**
   * Assess velocity
   */
  assessVelocity(totalCommits, repoCount) {
    const average = totalCommits / repoCount;
    if (average > 100) return 'High';
    if (average > 50) return 'Moderate';
    return 'Low';
  }

  /**
   * Calculate average project age
   */
  calculateAverageAge(repos) {
    const ages = repos.map(r => {
      const created = new Date(r.dates.created);
      return (new Date() - created) / (1000 * 60 * 60 * 24 * 30);
    });
    const avg = ages.reduce((a, b) => a + b, 0) / ages.length;
    return avg.toFixed(1) + ' months';
  }
}

module.exports = AdvancementTracker;