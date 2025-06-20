# Automatic Version Management

This project automatically increments the version number in the footer every time you push to the main branch.

## How It Works

### GitHub Actions Workflow

- Located at `.github/workflows/version.yml`
- Triggers on every push to the `main` branch
- Automatically increments the patch version in `package.json`
- Commits the version change back to the repository
- Prevents infinite loops by ignoring changes to `package.json`

### Local Git Hook (Alternative)

- Located at `.git/hooks/pre-push`
- Runs before every `git push`
- Increments version and creates a commit automatically
- Useful for immediate testing

## Version Format

The version follows semantic versioning: `MAJOR.MINOR.PATCH`

- **Current version**: `1.0.36`
- **Patch increments**: Every push increases the patch number (e.g., 1.0.36 → 1.0.37)
- **Minor increments**: Every 10 patch increments moves to the next minor version (e.g., 1.0.9 → 1.1.0)
- **Major increments**: Manual process for breaking changes

## Scripts

### `npm run version`

Increments the version and updates `package.json`

### `npm run test-version`

Shows what the next version would be without making changes

## Manual Version Control

If you need to manually set a specific version:

1. Edit `package.json` and change the `version` field
2. Commit the change
3. The next push will increment from your manual version

## Troubleshooting

### GitHub Actions not working

1. Check that the workflow has write permissions
2. Ensure the `GITHUB_TOKEN` secret is available
3. Verify the workflow file is in the correct location

### Git hook not working

1. Ensure the hook is executable: `chmod +x .git/hooks/pre-push`
2. Check that you're pushing to the main branch
3. Verify the script paths are correct

### Version not updating in footer

1. Check that the API route `/api/version` is working
2. Verify the footer component is fetching the version correctly
3. Ensure the build process includes the latest version

## API Endpoint

The version is served via `/api/version` which returns:

```json
{
  "version": "1.0.36",
  "timestamp": "2025-01-20T10:30:00.000Z"
}
```

This endpoint reads the version from `package.json` and provides a timestamp of when it was last updated.
