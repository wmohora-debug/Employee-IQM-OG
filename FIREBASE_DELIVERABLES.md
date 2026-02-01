# Firebase Backend Implementation Plan

## 1. Firestore Schema

### Collection: `users`
Stores user profiles (Employees and Team Leads).
- `uid` (string): Auth UID
- `email` (string)
- `name` (string)
- `role` (string): 'admin' | 'lead' | 'employee'
- `avatarUrl` (string, optional)
- `points` (number): Total leaderboard points
- `streak` (number): Daily login/task streak

### Collection: `tasks`
Main collection for tasks assigned to employees.
- `id` (string): Auto-generated
- `title` (string)
- `description` (string)
- `assignedTo` (string): UID of employee
- `assignedBy` (string): UID of lead
- `status` (string): 'pending' | 'in-progress' | 'completed' | 'verified'
- `priority` (string): 'low' | 'medium' | 'high'
- `dueDate` (timestamp)
- `createdAt` (timestamp)
- `attachments` (array of objects): `[{ name, url, path }]`
- `submissionUrl` (string, optional)
- `rating` (number, optional): 1-5 (SVM Rating)
- `feedback` (string, optional)

### Collection: `modules`
Tracks training or project modules.
- `id` (string)
- `name` (string)
- `description` (string)
- `modules` (array): List of sub-modules/topics
- `assignedUsers` (array): List of UIDs

### Collection: `activity_logs` (for Leaderboard/Tracking)
- `id` (string)
- `userId` (string)
- `action` (string): 'task_completed', 'login', 'upload'
- `pointsChange` (number)
- `timestamp` (timestamp)

## 2. Hardcoded Users Strategy
Since we want hardcoded users for simplicity/demo:
We can create a utility function that "logs in" a user by simply returning their predefined object/UID.
For real auth, we will map these emails to Firebase Auth.

**Leads:**
- `lead@iqm.com` (Role: Lead)

**Employees:**
- `emp1@iqm.com` (Role: Employee)
- `emp2@iqm.com` (Role: Employee)

## 3. Security Rules (firestore.rules)
```proto
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Helper functions
    function isAuthenticated() {
      return request.auth != null;
    }
    function isOwner(userId) {
      return request.auth.uid == userId;
    }
    function isLead() {
       return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'lead';
    }

    // Users: Read everyone, Write own profile or if Lead
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if isOwner(userId) || isLead();
    }

    // Tasks: 
    // - Read: Assigned user or Lead
    // - Create: Lead only
    // - Update: Assigned user (status/submission) or Lead (all)
    match /tasks/{taskId} {
      allow read: if isAuthenticated() && (resource.data.assignedTo == request.auth.uid || isLead());
      allow create: if isLead();
      allow update: if isAuthenticated() && (resource.data.assignedTo == request.auth.uid || isLead());
    }
  }
}
```

## 4. Cloud Storage Logic
Storage structure:
- `tasks/{taskId}/attachments/{filename}` (Lead uploads)
- `tasks/{taskId}/submissions/{filename}` (Employee uploads)
- `avatars/{userId}/{filename}`

## 5. Real-time Update Strategy
We will use Firestore `onSnapshot` listeners for:
1. **Dashboard Task List**: Listen to `tasks` where `assignedTo == currentUser.uid` (Employee) or all tasks (Lead).
2. **Notifications/Activity**: Listen to `activity_logs` ordered by time.
3. **Leaderboard**: Listen to `users` ordered by `points`.

## 6. Leaderboard Calculations
- **Trigger**: When a task status changes to 'verified' (completed & rated).
- **Calculation**: 
  - Base points for completion (e.g., 100).
  - Bonus for early submission.
  - SVM Rating multiplier (1-5 stars).
- **Update**: Update `users/{uid}.points` atomically using `increment`.
