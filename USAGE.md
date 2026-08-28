# GitHub Repo Audit Agent - Usage Guide

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Anurag1/github-repo-audit-agent.git
cd github-repo-audit-agent
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Edit `.env` with your GitHub token and username:
```
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
GITHUB_USERNAME=your_username
```

## Getting a GitHub Token

1. Go to GitHub Settings → Developer Settings → Personal Access Tokens
2. Click "Generate new token"
3. Select scopes: `public_repo`, `read:user`
4. Copy the token and paste in `.env`

## Running the Agent

### Basic Usage
```bash
npm start
```

### Development Mode (with auto-reload)
```bash
npm run dev
```

## Output

The agent generates reports in the `reports/` directory:
- Text format: `audit-username-YYYY-MM-DD.txt`
- Contains all metrics, advancement indicators, and success scores

## What Gets Audited

### Per Repository
- Commit statistics
- Issue tracking (open/closed)
- Pull request metrics
- Release history
- Language distribution
- Contributor count
- Repository health score

### Profile Level
- Total statistics across all repos
- Growth metrics
- Activity indicators
- Success scores
- Achievements earned
- Quality assessments

## Troubleshooting

### Authentication Failed
- Verify your GitHub token is correct
- Check token hasn't expired
- Ensure token has necessary scopes

### Rate Limiting
- GitHub API has rate limits (60 requests/hour for unauthenticated)
- Wait an hour for rate limit reset
- Use a token for higher limits (5000 requests/hour)

## License

MIT