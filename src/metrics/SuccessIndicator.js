/**
 * Success Indicator
 * Identifies and calculates success metrics
 */
class SuccessIndicator {
  /**
   * Calculate success score for profile
   * @param {Array} repositories - Audited repositories
   * @returns {Object} Success metrics
   */
  calculateSuccessScore(repositories) {
    const validRepos = repositories.filter(r => r !== null);

    return {
      overallSuccessScore: this.calculateOverallScore(validRepos),
      successIndicators: this.getSuccessIndicators(validRepos),
      projectQuality: this.assessProjectQuality(validRepos),
      communityEngagement: this.assessCommunityEngagement(validRepos),
      maintenanceHealth: this.assessMaintenanceHealth(validRepos),
      achievements: this.getAchievements(validRepos)
    };
  }

  /**
   * Calculate overall success score
   */
  calculateOverallScore(repos) {
    let score = 0;
    const weights = {
      stars: 0.25,
      commits: 0.20,
      contributors: 0.20,
      releases: 0.15,
      issues: 0.10,
      forks: 0.10
    };

    // Star score (normalized 0-100)
    const starScore = Math.min((repos.reduce((sum, r) => sum + r.stats.stars, 0) / repos.length) / 10, 100);
    score += starScore * weights.stars;

    // Commit activity score
    const commitScore = repos.reduce((sum, r) => sum + (r.detailed?.commits?.totalCommits || 0), 0) > 50 ? 100 : 50;
    score += commitScore * weights.commits;

    // Contributor score
    const contributorScore = repos.reduce((sum, r) => sum + (r.detailed?.contributors?.totalContributors || 0), 0) > 5 ? 100 : 50;
    score += contributorScore * weights.contributors;

    // Release score
    const releaseScore = repos.filter(r => (r.detailed?.releases?.totalReleases || 0) > 0).length > repos.length / 2 ? 100 : 50;
    score += releaseScore * weights.releases;

    // Issue resolution score
    const issueScore = repos.reduce((sum, r) => sum + (r.detailed?.issues?.closed || 0), 0) > 10 ? 100 : 50;
    score += issueScore * weights.issues;

    // Fork score
    const forkScore = repos.reduce((sum, r) => sum + r.stats.forks, 0) > 5 ? 100 : 50;
    score += forkScore * weights.forks;

    return Math.round(score);
  }

  /**
   * Get success indicators
   */
  getSuccessIndicators(repos) {
    return {
      highStarRepositories: repos.filter(r => r.stats.stars >= 50).length,
      activeProjects: repos.filter(r => {
        const pushed = new Date(r.dates.pushed);
        const daysSincePush = (new Date() - pushed) / (1000 * 60 * 60 * 24);
        return daysSincePush < 30;
      }).length,
      releasedProjects: repos.filter(r => (r.detailed?.releases?.totalReleases || 0) > 0).length,
      wellMaintainedProjects: repos.filter(r => r.detailed?.health > 60).length,
      communityProjects: repos.filter(r => (r.detailed?.contributors?.totalContributors || 0) > 2).length
    };
  }

  /**
   * Assess project quality
   */
  assessProjectQuality(repos) {
    const qualityScores = repos.map(r => ({
      name: r.name,
      quality: r.detailed?.health || 0
    })).sort((a, b) => b.quality - a.quality);

    const avgQuality = repos.reduce((sum, r) => sum + (r.detailed?.health || 0), 0) / repos.length;

    return {
      averageQuality: Math.round(avgQuality),
      topQualityProjects: qualityScores.slice(0, 3),
      qualityDistribution: this.distributeQuality(qualityScores)
    };
  }

  /**
   * Assess community engagement
   */
  assessCommunityEngagement(repos) {
    const totalStars = repos.reduce((sum, r) => sum + r.stats.stars, 0);
    const totalForks = repos.reduce((sum, r) => sum + r.stats.forks, 0);
    const totalWatchers = repos.reduce((sum, r) => sum + r.stats.watchers, 0);

    return {
      totalStargazers: totalStars,
      totalForks: totalForks,
      totalWatchers: totalWatchers,
      engagementScore: Math.round(((totalStars * 0.5) + (totalForks * 0.3) + (totalWatchers * 0.2)) / repos.length),
      topEngagedRepositories: this.getTopEngaged(repos, 3)
    };
  }

  /**
   * Assess maintenance health
   */
  assessMaintenanceHealth(repos) {
    const now = new Date();
    const wellMaintained = repos.filter(r => {
      const pushed = new Date(r.dates.pushed);
      const daysSincePush = (now - pushed) / (1000 * 60 * 60 * 24);
      return daysSincePush < 90;
    });

    return {
      wellMaintainedCount: wellMaintained.length,
      maintenancePercentage: ((wellMaintained.length / repos.length) * 100).toFixed(2),
      abandonedProjects: repos.filter(r => {
        const pushed = new Date(r.dates.pushed);
        const daysSincePush = (now - pushed) / (1000 * 60 * 60 * 24);
        return daysSincePush > 365;
      }).length
    };
  }

  /**
   * Get achievements
   */
  getAchievements(repos) {
    const achievements = [];

    if (repos.length > 10) achievements.push('🏆 Portfolio Builder - 10+ Repositories');
    if (repos.reduce((sum, r) => sum + r.stats.stars, 0) > 100) achievements.push('⭐ Star Collector - 100+ Stars');
    if (repos.reduce((sum, r) => sum + r.stats.forks, 0) > 20) achievements.push('🍴 Fork Master - 20+ Forks');
    if (repos.filter(r => (r.detailed?.releases?.totalReleases || 0) > 0).length > 5) achievements.push('🚀 Release Manager - 5+ Released Projects');
    if (repos.filter(r => (r.detailed?.contributors?.totalContributors || 0) > 2).length > 5) achievements.push('👥 Team Builder - 5+ Collaborative Projects');

    return achievements;
  }

  /**
   * Distribute quality
   */
  distributeQuality(scores) {
    return {
      excellent: scores.filter(s => s.quality >= 80).length,
      good: scores.filter(s => s.quality >= 60 && s.quality < 80).length,
      fair: scores.filter(s => s.quality >= 40 && s.quality < 60).length,
      needsWork: scores.filter(s => s.quality < 40).length
    };
  }

  /**
   * Get top engaged repositories
   */
  getTopEngaged(repos, limit) {
    return repos
      .map(r => ({
        name: r.name,
        engagement: (r.stats.stars + r.stats.forks + r.stats.watchers)
      }))
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, limit);
  }
}

module.exports = SuccessIndicator;