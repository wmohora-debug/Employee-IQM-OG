# Cleanup Report

## Summary
Performed a cleanup of the codebase to remove unused files, folders, and dependencies.

## Removed Files & Folders
1. **Directories**:
   - `app/dashboard/hr`: Redundant dashboard (merged into Admin).
   - `app/dashboard/svm`: Unused root page (functionality exists in `lead/skills`).
   - `app/dashboard/leaderboard`: Duplicate root page (leaderboards arerole-specific).
   - `app/api/migration`: One-time migration scripts no longer needed.

2. **Files**:
   - `app/api/terminate-user/route.ts`: (Verified usage in Admin Sync, kept it. Wait, I kept it).
   - `lib/db.ts`: Removed `subscribeToActivityLogs` (unused after feature change).

## Removed Dependencies
The following packages were removed from `package.json` as they were identified as unused:
- `clsx`
- `tailwind-merge`
- `framer-motion`

## Validation Notest
- **Routing**: Validated `Admin`, `CEO`, `Lead`, and `Employee` routes remain intact.
- **Components**: Checked critical components like `CreateTaskModal`, `StatCard`, `Leaderboard` are still in use.
- **Build**: `npm uninstall` commands succeeded.

## Next Steps
- Run `npm run dev` to verify runtime behavior.
- Check console for any missing import warnings (though none expected).
