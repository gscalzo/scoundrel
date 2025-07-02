# Branch Protection Rules Setup

This document provides instructions for configuring GitHub branch protection rules to ensure tests must pass before merging pull requests.

## 🛡️ Required Protection Rules

To enforce testing requirements, configure the following branch protection rules for your `main` (or `master`) branch:

### 1. Enable Branch Protection

Go to your repository settings:
1. Navigate to **Settings** → **Branches**
2. Click **Add rule** or edit existing rule for `main`/`master`

### 2. Configure Required Status Checks

Enable the following settings:

✅ **Require status checks to pass before merging**
- Check: `Run Tests`
- Check: `Deployment Readiness` 
- Check: `Security & Code Quality`
- Check: `Test Coverage Analysis`

✅ **Require branches to be up to date before merging**

✅ **Require pull request reviews before merging**
- Required number of reviewers: 1 (recommended)

✅ **Dismiss stale reviews when new commits are pushed**

✅ **Require review from code owners** (optional)

✅ **Restrict pushes that create files to matching paths** (optional)

### 3. Additional Protection Settings

✅ **Require signed commits** (recommended for security)

✅ **Require linear history** (optional, keeps git history clean)

✅ **Include administrators** (applies rules to admin users too)

✅ **Allow deletions** (unchecked - prevents branch deletion)

✅ **Allow force pushes** (unchecked - prevents force pushes)

## 🧪 Status Checks Configuration

The GitHub Actions workflows will automatically provide these status checks:

| Status Check | Purpose | Must Pass |
|--------------|---------|-----------|
| `Run Tests` | Executes all unit and integration tests | ✅ Required |
| `Deployment Readiness` | Validates game loads and works correctly | ✅ Required |
| `Security & Code Quality` | Checks for security issues and code quality | ✅ Required |
| `Test Coverage Analysis` | Ensures adequate test coverage | ✅ Required |

## 🚀 Workflow Integration

With these rules in place:

1. **Pull Requests** automatically trigger the test suite
2. **Tests must pass** before the PR can be merged
3. **Deployment happens automatically** after successful merge to main
4. **Failed tests block merging** until issues are resolved

## 📋 Quick Setup Checklist

- [ ] Navigate to Repository Settings → Branches
- [ ] Add/Edit protection rule for `main`/`master` branch
- [ ] Enable "Require status checks to pass before merging"
- [ ] Select all 4 required status checks:
  - [ ] `Run Tests`
  - [ ] `Deployment Readiness`
  - [ ] `Security & Code Quality`
  - [ ] `Test Coverage Analysis`
- [ ] Enable "Require branches to be up to date before merging"
- [ ] Enable "Require pull request reviews before merging"
- [ ] Set minimum reviewers to 1
- [ ] Enable "Include administrators"
- [ ] Save protection rule

## 🎯 Benefits

This setup ensures:

- **Quality Assurance**: No broken code reaches production
- **Automated Testing**: Tests run automatically on every PR
- **Security**: Code quality and security checks prevent vulnerabilities
- **Reliability**: Game functionality is verified before deployment
- **Team Collaboration**: Required reviews encourage code discussion

## 🔧 Troubleshooting

### Status Checks Not Appearing

If status checks don't appear in the branch protection settings:

1. Create a test PR to trigger the workflows first
2. Wait for workflows to complete at least once
3. Refresh the branch protection settings page
4. The status checks should now be available for selection

### Tests Failing on PR

When tests fail:

1. Check the Actions tab for detailed error logs
2. Run tests locally: `cd tests && node run-tests.js`
3. Fix the failing tests
4. Push changes to update the PR
5. Tests will automatically re-run

### Emergency Bypassing (Admin Only)

In case of critical issues, administrators can:

1. Temporarily disable branch protection
2. Merge the emergency fix
3. Re-enable branch protection immediately
4. Create a follow-up PR to fix tests

**Note**: This should only be used in genuine emergencies.

---

**Remember**: These protection rules are your safety net. They prevent broken code from reaching users and maintain the quality of your game!