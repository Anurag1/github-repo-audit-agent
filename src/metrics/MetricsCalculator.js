/**
 * Metrics Calculator
 * Calculates aggregate metrics across all repositories
 */
class MetricsCalculator {
  /**
   * Calculate profile-level metrics
   * @param {Array} repositories - Audited repositories
   * @returns {Object} Profile metrics
   */
  calculateProfileMetrics(repositories) {
    const validRepos = repositories.filter(r => r !== null);

    return {
      totalRepositories: validRepos.length,
      totalStars: validRepos.reduce((sum, r) => sum + r.stats.stars, 0),
      totalForks: validRepos.reduce((sum, r) => sum + r.stats.forks, 0),
      totalWatchers: validRepos.reduce((sum, r) => sum + r.stats.watchers, 0),
      averageStars: this.calculateAverage(validRepos.map(r => r.stats.stars)),
      averageForks: this.calculateAverage(validRepos.map(r => r.stats.forks)),
      topRepositories: this.getTopRepositories(validRepos, 5),
      languageDistribution: this.calculateLanguageDistribution(validRepos),
      codeSize: validRepos.reduce((sum, r) => sum + r.stats.size, 0),
      openIssuesCount: validRepos.reduce((sum, r) => sum + r.stats.openIssues, 0)
    };
  }

  /**
   * Get top repositories by stars
   */
  getTopRepositories(repos, limit = 5) {
    return repos
      .sort((a, b) => b.stats.stars - a.stats.stars)
      .slice(0, limit)
      .map(r => ({
        name: r.name,
        stars: r.stats.stars,
        url: r.url,
        language: r.stats.language
      }));
  }

  /**
   * Calculate language distribution
   */
  calculateLanguageDistribution(repos) {
    const languages = {};

    repos.forEach(repo => {
      if (repo.stats.language) {
        languages[repo.stats.language] = (languages[repo.stats.language] || 0) + 1;
      }
    });

    return languages;
  }

  /**
   * Calculate average
   */
  calculateAverage(numbers) {
    if (numbers.length === 0) return 0;
    return (numbers.reduce((sum, n) => sum + n, 0) / numbers.length).toFixed(2);
  }
}

module.exports = MetricsCalculator;