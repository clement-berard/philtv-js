module.exports = {
  hooks: { "before:init": "pnpm build" },
  git: {
    requireBranch: "main",
    commitMessage: "chore(release): ${version}",
    tagName: "v${version}",
    requireCleanWorkingDir: true,
    push: true,
  },
  github: { release: true, tokenRef: "GITHUB_TOKEN" },
  npm: { publish: true, tag: "latest", tokenRef: "NPM_TOKEN" },
  plugins: {
    "@release-it/conventional-changelog": {
      preset: {
        name: "conventionalcommits",
        ignoreCommits: /^chore\(release\):/,
        types: [
          { type: "feat", section: "✨ Features" },
          { type: "fix", section: "🐛 Fixes" },
          { type: "chore", section: "📦 Chores" },
          { type: "docs", section: "📝 Documentation" },
          { type: "style", section: "💅 Styling" },
          { type: "refactor", section: "🔨 Refactors" },
          { type: "perf", section: "⚡ Performance Improvements" },
          { type: "test", section: "✅ Tests" },
          { type: "ci", section: "🔧 Continuous Integration" },
        ],
      },
    },
  },
};
