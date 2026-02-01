# UI/UX Design System & Mobile Responsiveness Strategy

## 1. Wireframe Descriptions
| Screen | Layout Structure | Key Elements |
| :--- | :--- | :--- |
| **Lead Dashboard** | **Sidebar** (Left, Fixed) + **Header** (Top) + **Main Content** (Grid) | - **Stat Cards**: Top row, quick KPIs.<br>- **Task Table**: Central focus, managing modules.<br>- **SVM Matrix**: Skill evaluation grid.<br>- **Leaderboard**: Gamification element. |
| **Employee Dashboard** | **Sidebar** (Left, Fixed) + **Header** (Top) + **Main Content** (Grid) | - **Stats**: Personal assignments.<br>- **My Tasks**: List of actionable items.<br>- **Documents**: File repository.<br>- **Leaderboard**: Rank visibility. |

## 2. Component List
- **Sidebar**: Role-based navigation (Lead vs Employee links).
- **Header**: Role-specific greeting, notifications, profile.
- **StatCard**: Reusable KPI card with icon and trend.
- **TaskTable**: Variant for Lead (Assign/Edit) and Employee (View/Update).
- **SkillMatrix**: Star-rating system for employee skills.
- **Leaderboard**: Ranked list with visual highlighting for top performers.
- **DocumentsSection**: List view with Upload/Download actions.

## 3. UX Flows
### Lead Flow
1. **Login** -> Redirect to Lead Dashboard.
2. **Review Stats** (Employees, Leads).
3. **Manage Tasks**:
   - Check Task Table.
   - Click "Create Task" (Modal - Future Impl).
   - Review Module status.
4. **Evaluate Skills**: Check SVM matrix.

### Employee Flow
1. **Login** -> Redirect to Employee Dashboard.
2. **Check Pending**: View top stats.
3. **Execute Task**:
   - Locate task in "My Tasks".
   - Download requirements from "Documents".
   - (Future) Click task to update status.
4. **Motivation**: Check Leaderboard rank.

## 4. Mobile Responsiveness Strategy
The current implementation uses standard Tailwind breakpoints.
- **Sidebar**: 
  - *Desktop*: Fixed, always visible (`w-64`).
  - *Mobile*: Hidden by default. Accessed via Hamburger menu in Header (to be implemented).
- **Grid Layouts**:
  - `grid-cols-1` on mobile (stacking vertically).
  - `md:grid-cols-2` on tablet.
  - `lg:grid-cols-4` on wide screens.
- **Tables**:
  - `overflow-x-auto` to allow horizontal scrolling on small screens without breaking layout.
- **Font Sizes**:
  - Scalable units (rem) ensure readability.
- **Touch Targets**:
  - Buttons have appropriate padding (`p-3`, `p-4`) for touch interaction.

## 5. Visual Design
- **Theme**: IQM Deep Purple (`#5b4d9a`) & Clean White.
- **Typography**: Sans-serif (Geist/Inter) for legibility.
- **Feel**: Modern, "Glassmorphism" hints (transparencies, soft shadows), rounded corners (`rounded-2xl`, `rounded-3xl`).
