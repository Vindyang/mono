# Graph Report - .  (2026-06-20)

## Corpus Check
- Corpus is ~46,630 words - fits in a single context window. You may not need a graph.

## Summary
- 625 nodes · 1504 edges · 44 communities (22 shown, 22 thin omitted)
- Extraction: 95% EXTRACTED · 5% INFERRED · 0% AMBIGUOUS · INFERRED: 71 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Server Actions & API Routes|Server Actions & API Routes]]
- [[_COMMUNITY_Navigation & Layout Shell|Navigation & Layout Shell]]
- [[_COMMUNITY_Authentication UI & Forms|Authentication UI & Forms]]
- [[_COMMUNITY_Feature Pages & Team UI|Feature Pages & Team UI]]
- [[_COMMUNITY_Production Dependencies|Production Dependencies]]
- [[_COMMUNITY_Analytics Charts|Analytics Charts]]
- [[_COMMUNITY_Database Schema Concepts|Database Schema Concepts]]
- [[_COMMUNITY_Dev Dependencies & Build Config|Dev Dependencies & Build Config]]
- [[_COMMUNITY_Task Card Components|Task Card Components]]
- [[_COMMUNITY_TypeScript Configuration|TypeScript Configuration]]
- [[_COMMUNITY_Home Page & Login Flow|Home Page & Login Flow]]
- [[_COMMUNITY_shadcnui Component Config|shadcn/ui Component Config]]
- [[_COMMUNITY_Login Actions & Auth Utils|Login Actions & Auth Utils]]
- [[_COMMUNITY_Kanban Board|Kanban Board]]
- [[_COMMUNITY_Root App Layout|Root App Layout]]
- [[_COMMUNITY_Initial DB Migration|Initial DB Migration]]
- [[_COMMUNITY_Email Invitation System|Email Invitation System]]
- [[_COMMUNITY_Schema Evolution Migrations|Schema Evolution Migrations]]
- [[_COMMUNITY_Tooltip Component|Tooltip Component]]
- [[_COMMUNITY_ESLint Configuration|ESLint Configuration]]
- [[_COMMUNITY_Supabase Client Factories|Supabase Client Factories]]
- [[_COMMUNITY_Next.js Configuration|Next.js Configuration]]
- [[_COMMUNITY_PostCSS Configuration|PostCSS Configuration]]
- [[_COMMUNITY_Auth Client Exports|Auth Client Exports]]
- [[_COMMUNITY_shadcn JSON Config|shadcn JSON Config]]
- [[_COMMUNITY_Tooltip Trigger|Tooltip Trigger]]
- [[_COMMUNITY_Auth Client Instance|Auth Client Instance]]
- [[_COMMUNITY_Auth signIn|Auth signIn]]
- [[_COMMUNITY_Auth signOut|Auth signOut]]
- [[_COMMUNITY_useSession Hook|useSession Hook]]
- [[_COMMUNITY_Build URL Utility|Build URL Utility]]
- [[_COMMUNITY_Email Verification Util|Email Verification Util]]
- [[_COMMUNITY_Task Filters Type|Task Filters Type]]
- [[_COMMUNITY_Task Form Data Type|Task Form Data Type]]
- [[_COMMUNITY_Verification Token Table|Verification Token Table]]
- [[_COMMUNITY_Add User ID Migration|Add User ID Migration]]
- [[_COMMUNITY_Auto-Generate User ID Migration|Auto-Generate User ID Migration]]
- [[_COMMUNITY_User ID Int Migration|User ID Int Migration]]
- [[_COMMUNITY_Package JSON Root|Package JSON Root]]
- [[_COMMUNITY_VS Code MCP Config|VS Code MCP Config]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 118 edges
2. `Button()` - 36 edges
3. `Task` - 25 edges
4. `Spinner()` - 20 edges
5. `Project` - 18 edges
6. `compilerOptions` - 17 edges
7. `auth` - 16 edges
8. `Prisma Client Singleton` - 16 edges
9. `Card` - 14 edges
10. `Input()` - 13 edges

## Surprising Connections (you probably didn't know these)
- `Todo App Detailed Technical Specification` --references--> `task DB Table`  [INFERRED]
  todo-app-detailed-specification.md → prisma/migrations/20251211024724_add_app_models/migration.sql
- `TypeScript Compiler Configuration` --conceptually_related_to--> `Project README - Mono Platform Overview`  [INFERRED]
  tsconfig.json → README.md
- `KanbanBoardProps` --references--> `Task`  [EXTRACTED]
  app/(authenticated)/tasks/components/kanban-board.tsx → lib/types/task.ts
- `Column` --references--> `Task`  [EXTRACTED]
  app/(authenticated)/tasks/components/kanban-board.tsx → lib/types/task.ts
- `TaskCardProps` --references--> `Task`  [EXTRACTED]
  app/(authenticated)/tasks/components/task-card.tsx → lib/types/task.ts

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **Server Actions Data Fetch Pattern - All pages fetch data via server actions on mount** — componentsaction_actions_getanalyticsdata, componentsaction_actions_getcalendardata, componentsaction_actions_getdashboarddata, componentsaction_actions_getprojectsdata, componentsaction_actions_getsettingsdata, componentsaction_actions_getprojectdetails [INFERRED 0.95]
- **Project CRUD Server Actions** — componentsaction_actions_createproject, componentsaction_actions_updateproject, componentsaction_actions_deleteproject, componentsaction_actions_getprojectsdata [EXTRACTED 1.00]
- **Kanban Drag-and-Drop Component Tree** — components_kanban_board_kanbanboard, components_kanban_board_kanbancolumn, components_sortable_task_card_sortabletaskcard [EXTRACTED 1.00]
- **Invitation Lifecycle: Create, Resend, Revoke, Accept** — componentsaction_team_actions, components_invitations_list, id_invite_page, components_invite_modal [INFERRED 0.90]
- **Magic Link Auth Flow with Auto-Login** — componentsaction_login_actions, login_with_check_route, verify_and_update_route, all_route [INFERRED 0.90]
- **Task CRUD: Page, Modal, Server Actions** — tasks_page, components_task_modal, componentsaction_tasks_actions [EXTRACTED 0.95]
- **Analytics Charts: Recharts + Card + CSS Variable Theming** — analytics_charts_activity_trend_chart_activitytrendchart, analytics_charts_burndown_chart_burndownchart, analytics_charts_priority_distribution_chart_prioritydistributionchart, analytics_charts_status_distribution_chart_statusdistributionchart, ui_card_card, concept_recharts_theming [INFERRED 0.95]
- **Auth Forms + Session + Magic Link Pattern** — auth_login_form_loginform, auth_signup_form_signupform, auth_user_menu_usermenu, concept_magic_link_auth [INFERRED 0.85]
- **Task Card, Filters, and Avatar Display Pattern** — components_task_card_taskcard, components_task_filters_taskfilters, ui_avatar_avatar, concept_url_based_filtering [INFERRED 0.75]
- **Radix UI Wrapper Components** — ui_dialog_dialog, ui_dropdown_menu_dropdownmenu, ui_popover_popover, ui_select_select, ui_separator_separator, ui_sheet_sheet, ui_switch_switch, ui_tabs_tabs, ui_label_label [EXTRACTED 1.00]
- **Sidebar Composite Component System** — ui_sidebar_sidebarprovider, ui_sidebar_sidebar, ui_sidebar_usesidebar, ui_sidebar_sidebarcontext, ui_sidebar_sidebartrigger, ui_sidebar_sidebarmenubutton, ui_sidebar_sidebarmenuskeleton [EXTRACTED 1.00]
- **Form Field Components** — ui_field_field, ui_field_fieldlabel, ui_field_fielderror, ui_field_fieldseparator, ui_label_label, ui_input_input, ui_textarea_textarea [INFERRED 0.85]
- **Authentication Stack: better-auth + Prisma + Brevo** — lib_auth_auth, lib_prisma_prisma, concept_brevo_email_provider, lib_auth_auth_utils_shouldautologin, concept_magic_link_auth [INFERRED 0.90]
- **Auth DB Schema: user, session, account, verification** — migration_naming_user_table, migration_naming_session_table, migration_naming_account_table, migration_naming_verification_table [EXTRACTED 1.00]
- **Email Template System: Invitation + Magic Link** — lib_email_send_sendinvitationemail, lib_email_templates_getinvitationemailhtml, lib_email_templates_getinvitationemailtext, lib_email_templates_getmagiclinkemail_html, lib_email_templates_getmagiclinkemail_text [EXTRACTED 1.00]
- **Core Application Domain Schema Tables** — concept_workspace_table, concept_project_table, concept_task_table, concept_workspace_member_table, concept_project_member_table, concept_invitation_table [EXTRACTED 1.00]
- **Better Auth Session and Identity Tables** — concept_session_table, concept_account_table, concept_verification_table, concept_better_auth_framework [EXTRACTED 1.00]
- **Task Detail Tables (comments, attachments, assignees, activity)** — concept_task_table, concept_task_assignee_table, concept_comment_table, concept_attachment_table, concept_activity_log_table [EXTRACTED 1.00]

## Communities (44 total, 22 thin omitted)

### Community 0 - "Server Actions & API Routes"
Cohesion: 0.06
Nodes (67): { GET, POST }, authClient, UserMenu(), CalendarPage(), CalendarContext, CalendarContextType, CalendarView(), CalendarViewProps (+59 more)

### Community 1 - "Navigation & Layout Shell"
Cohesion: 0.06
Nodes (65): AuthenticatedLayout(), AppSidebar(), data, TooltipContent Component, Mobile-Responsive Sidebar Pattern, useIsMobile(), cn(), BreadcrumbEllipsis() (+57 more)

### Community 2 - "Authentication UI & Forms"
Cohesion: 0.07
Nodes (49): ActionState, LoginFormProps, SignupFormProps, EditProjectModalProps, Project, NewProjectModalProps, ProjectMember, signup() (+41 more)

### Community 3 - "Feature Pages & Team UI"
Cohesion: 0.05
Nodes (55): AnalyticsPage(), BurndownChart(), DeleteProjectDialog(), EditProjectModal(), InvitationsList(), InvitationsListProps, MemberList(), MemberListProps (+47 more)

### Community 4 - "Production Dependencies"
Cohesion: 0.05
Nodes (40): dependencies, better-auth, class-variance-authority, clsx, date-fns, dayjs, @dnd-kit/core, @dnd-kit/sortable (+32 more)

### Community 5 - "Analytics Charts"
Cohesion: 0.12
Nodes (25): ActivityTrendChart Component, BurndownChart Component, PriorityDistributionChart Component, StatusDistributionChart Component, KPICard(), KPICardProps, ActivityTrendChartProps, BurndownChartProps (+17 more)

### Community 6 - "Database Schema Concepts"
Cohesion: 0.10
Nodes (32): account DB Table (Better Auth OAuth), activity_log DB Table, attachment DB Table, Better Auth Add/Remove/Re-add Cycle, Better Auth Authentication Framework, comment DB Table, invitation DB Table, project_member DB Table (+24 more)

### Community 7 - "Dev Dependencies & Build Config"
Cohesion: 0.08
Nodes (25): devDependencies, baseline-browser-mapping, eslint, eslint-config-next, tailwindcss, @tailwindcss/postcss, tw-animate-css, @types/bun (+17 more)

### Community 8 - "Task Card Components"
Cohesion: 0.14
Nodes (14): TaskCardProps, TaskAssignee, TaskCardProps, getTaskById(), Task Priority Levels (high/medium/low), TaskDetailsPage(), TaskDetailsClient(), TaskDetailsClient (+6 more)

### Community 9 - "TypeScript Configuration"
Cohesion: 0.10
Nodes (20): compilerOptions, allowJs, baseUrl, esModuleInterop, incremental, isolatedModules, jsx, lib (+12 more)

### Community 10 - "Home Page & Login Flow"
Cohesion: 0.12
Nodes (14): Home(), LoginForm(), SignupForm(), Login Server Action, Signup Server Action, Tasks Server Actions, Team Server Actions, Magic Link Authentication Pattern (+6 more)

### Community 11 - "shadcn/ui Component Config"
Cohesion: 0.11
Nodes (18): aliases, components, hooks, lib, ui, utils, iconLibrary, registries (+10 more)

### Community 12 - "Login Actions & Auth Utils"
Cohesion: 0.21
Nodes (12): ActionState, buildUrl(), extractEmailFromVerification(), findVerificationTokenByEmail(), shouldAutoLogin(), login(), adapter, globalForPrisma (+4 more)

### Community 13 - "Kanban Board"
Cohesion: 0.18
Nodes (12): Column, KanbanBoard(), KanbanBoardProps, KanbanColumn(), SortableTaskCard(), InviteModal, ScrollArea, ScrollAreaProps (+4 more)

### Community 14 - "Root App Layout"
Cohesion: 0.33
Nodes (4): geistMono, geistSans, metadata, Toaster()

### Community 15 - "Initial DB Migration"
Cohesion: 0.33
Nodes (6): DB Table: Account (initial), DB Table: Session (initial), DB Table: User (initial), DB Table: account (renamed lowercase), DB Table: session (renamed lowercase), DB Table: user (renamed lowercase)

### Community 16 - "Email Invitation System"
Cohesion: 0.67
Nodes (4): Brevo Email Provider Integration, sendInvitationEmail Function, getInvitationEmailHtml Function, getInvitationEmailText Function

### Community 17 - "Schema Evolution Migrations"
Cohesion: 0.67
Nodes (3): Schema ID Type Evolution (TEXT -> UUID -> INT SERIAL), Refactor User ID to UUID Migration, Refactor Entity IDs to Integer (SERIAL) Migration

## Knowledge Gaps
- **193 isolated node(s):** `CalendarContext`, `DeleteProjectDialogProps`, `EditProjectModalProps`, `NewProjectModalProps`, `ProjectMember` (+188 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **22 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Navigation & Layout Shell` to `Server Actions & API Routes`, `Authentication UI & Forms`, `Feature Pages & Team UI`, `Analytics Charts`, `Task Card Components`, `Home Page & Login Flow`, `Kanban Board`?**
  _High betweenness centrality (0.164) - this node is a cross-community bridge._
- **Why does `Button()` connect `Authentication UI & Forms` to `Server Actions & API Routes`, `Navigation & Layout Shell`, `Feature Pages & Team UI`, `Analytics Charts`, `Task Card Components`, `Home Page & Login Flow`, `Kanban Board`?**
  _High betweenness centrality (0.040) - this node is a cross-community bridge._
- **Why does `Task` connect `Server Actions & API Routes` to `Task Card Components`, `Authentication UI & Forms`, `Feature Pages & Team UI`, `Kanban Board`?**
  _High betweenness centrality (0.025) - this node is a cross-community bridge._
- **Are the 2 inferred relationships involving `Button()` (e.g. with `Badge()` and `ButtonGroup()`) actually correct?**
  _`Button()` has 2 INFERRED edges - model-reasoned connections that need verification._
- **What connects `CalendarContext`, `DeleteProjectDialogProps`, `EditProjectModalProps` to the rest of the system?**
  _194 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Server Actions & API Routes` be split into smaller, more focused modules?**
  _Cohesion score 0.060246360582306833 - nodes in this community are weakly interconnected._
- **Should `Navigation & Layout Shell` be split into smaller, more focused modules?**
  _Cohesion score 0.05555555555555555 - nodes in this community are weakly interconnected._