# Automatic Versioning System

This project uses an automatic versioning system that increments the version number on every push to the main branch.

## How It Works

### Version Format

- **Format**: `MAJOR.MINOR.PATCH` (e.g., `1.0.0`)
- **Current Version**: Check `package.json` or run `npm run version`

### Automatic Increments

- **Every push** to the main branch increments the **PATCH** version
- **Every 10 increments** moves to the next **MINOR** version
- **Example progression**:
  ```
  1.0.0 → 1.0.1 → 1.0.2 → ... → 1.0.9 → 1.1.0 → 1.1.1 → ... → 1.1.9 → 1.2.0
  ```

### Version Rules

- **PATCH** (0-9): Increments on every push
- **MINOR** (0-9): Increments every 10 pushes
- **MAJOR**: Manual increment for breaking changes

## Commands

### Check Current Version

```bash
npm run version
```

This will show:

- Current version information
- Next version predictions
- Version progression examples

### Manual Version Management

If you need to manually set a version:

```bash
# Set specific version
npm version 2.0.0 --no-git-tag-version

# Increment major version
npm version major --no-git-tag-version

# Increment minor version
npm version minor --no-git-tag-version

# Increment patch version
npm version patch --no-git-tag-version
```

## GitHub Actions

The versioning is handled by the GitHub Action workflow in `.github/workflows/version-increment.yml`:

1. **Triggers**: On every push to main branch
2. **Excludes**: Markdown files and the workflow file itself
3. **Process**:
   - Reads current version from `package.json`
   - Calculates next version based on rules
   - Updates `package.json`
   - Commits and pushes the change

## Version History Example

```
1.0.0 - Initial version
1.0.1 - First push
1.0.2 - Second push
...
1.0.9 - Ninth push
1.1.0 - Tenth push (minor increment)
1.1.1 - Eleventh push
...
1.1.9 - Nineteenth push
1.2.0 - Twentieth push (minor increment)
```

## Benefits

- **Automatic tracking** of deployment frequency
- **Consistent versioning** across the team
- **Easy rollback** to specific versions
- **Clear progression** of project development
- **No manual version management** required

## Notes

- The workflow only runs on pushes to the `main` branch
- Version increments are automatic and cannot be skipped
- For major version changes (breaking changes), manual intervention is required
- The system prevents version conflicts by using atomic commits
