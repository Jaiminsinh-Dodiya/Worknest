export const suggestedPrompts = [
  'Summarize my projects',
  'Show my pending tasks',
  'Generate a project description',
  'Suggest task priorities',
  'Write a status update',
];

export const mockResponses = {
  'summarize my projects': `Here's a summary of your current projects:

**Website Redesign** — 78% complete, on track for the Aug 30 deadline. Three tasks are still in progress including the login page design and API setup.

**Mobile Application** — 45% complete with the UI component library currently being built. On schedule for the Oct 15 deadline.

**Inventory Management System** — 92% complete, nearly finished. Only the reports module and barcode integration remain.

**Employee Onboarding Portal** — Successfully completed! All milestones were delivered on time.

**API Integration Platform** — Currently on hold at 15% progress, awaiting resource allocation.`,

  'show my pending tasks': `You have the following pending tasks:

1. **Design Login Page** (Website Redesign) — High Priority, due Aug 27
   Status: In Progress

As Company Owner, you're also overseeing 17 pending tasks across all projects. Would you like me to break those down by project or priority?`,

  'generate a project description': `Here's a project description template:

**Project Name**: [Your Project Name]

**Objective**: This project aims to [primary goal] by implementing [key features/solutions]. The expected outcome is [measurable result] which will benefit [target users/stakeholders].

**Scope**: The project encompasses [key deliverables], with a focus on [priority areas]. It will be delivered in [number] phases over [timeline].

**Tech Stack**: [Technologies to be used]

Would you like me to customize this for a specific project?`,

  'suggest task priorities': `Based on your current project deadlines, here are my priority recommendations:

🔴 **High Priority** (due this week):
- Database Schema Design (Website Redesign) — blocking other tasks
- Design Login Page — critical path item

🟡 **Medium Priority** (due next week):
- Dashboard Layout — depends on schema design
- Write Unit Tests — should start alongside development

🟢 **Low Priority** (flexible deadline):
- Reports Module (Inventory System) — can be deferred
- Push Notifications (Mobile App) — not on critical path`,

  'write a status update': `Here's a status update draft for this week:

---
**Weekly Status Update — WorkNest Technologies**

**Highlights:**
✅ Employee Onboarding Portal completed and deployed
✅ Inventory System at 92% — on track for completion
📊 Website Redesign progressing well at 78%

**In Progress:**
- Website Redesign: Login page design, API setup, and dashboard layout
- Mobile App: UI component library development
- Inventory System: Barcode scanner integration

**Blockers:**
- API Integration Platform remains on hold pending team availability

**Next Week:**
- Complete database schema for Website Redesign
- Begin unit testing phase
- Finalize inventory barcode integration
---

Would you like me to adjust the tone or add more details?`,

  default: `I understand your question. Let me help you with that.

Based on your current workspace data, WorkNest Technologies has 8 team members working across 5 projects. Your most active project is the Website Redesign at 78% completion.

Could you be more specific about what you'd like to know? I can help with:
- Project summaries and status updates
- Task prioritization and assignment suggestions
- Team workload analysis
- Documentation and report generation`,
};
