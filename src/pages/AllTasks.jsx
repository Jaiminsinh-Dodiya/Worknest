import { useState, useMemo } from 'react';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { ROLES } from '../config/roles';
import { hasPermission } from '../config/permissions';
import {
  ClipboardList,
  Clock,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import SearchBar from '../components/ui/SearchBar';

/**
 * AllTasks — Company-wide or Team-wide Task Overview
 *
 * This page is rendered at `/tasks` and shows:
 * - Company Owner: ALL tasks across ALL company projects
 * - Manager: ALL tasks across their managed/assigned projects
 * - Super Admin: ALL tasks across the entire platform
 *
 * Unlike MyTasks (which filters by assigneeId === currentUser.id),
 * this uses getVisibleTasks() for proper role-scoped visibility.
 */
export default function AllTasks() {
  const {
    currentUser,
    getVisibleTasks,
    getVisibleProjects,
    getUserById,
    updateTask,
    allUsers,
  } = useApp();
  const { addToast } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [projectFilter, setProjectFilter] = useState('All');
  const [assigneeFilter, setAssigneeFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  const visibleTasks = getVisibleTasks();
  const visibleProjects = getVisibleProjects();
  const canManageTasks = hasPermission(currentUser?.role, 'tasks.manage');

  // Derive unique assignees from visible tasks for the filter dropdown
  const taskAssignees = useMemo(() => {
    const ids = [...new Set(visibleTasks.map((t) => t.assigneeId))];
    return ids.map((id) => getUserById(id)).filter(Boolean);
  }, [visibleTasks, getUserById]);

  // Available departments list
  const availableDepartments = useMemo(() => {
    const depts = new Set(allUsers.map((u) => u.department).filter(Boolean));
    return ['All', ...Array.from(depts)];
  }, [allUsers]);

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return visibleTasks.filter((task) => {
      const matchesSearch =
        task.title.toLowerCase().includes(search.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(search.toLowerCase()));
      const matchesStatus = statusFilter === 'All' || task.status === statusFilter;
      const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;
      const matchesProject = projectFilter === 'All' || task.projectId === projectFilter;
      const matchesAssignee = assigneeFilter === 'All' || task.assigneeId === assigneeFilter;
      const assignee = getUserById(task.assigneeId);
      const matchesDepartment =
        departmentFilter === 'All' || (assignee && assignee.department === departmentFilter);
      return (
        matchesSearch &&
        matchesStatus &&
        matchesPriority &&
        matchesProject &&
        matchesAssignee &&
        matchesDepartment
      );
    });
  }, [
    visibleTasks,
    search,
    statusFilter,
    priorityFilter,
    projectFilter,
    assigneeFilter,
    departmentFilter,
    getUserById,
  ]);

  // Stats
  const totalTasks = visibleTasks.length;
  const todoCount = visibleTasks.filter((t) => t.status === 'Todo').length;
  const inProgressCount = visibleTasks.filter((t) => t.status === 'In Progress').length;
  const completedCount = visibleTasks.filter((t) => t.status === 'Completed').length;

  const handleStatusChange = (taskId, newStatus) => {
    updateTask(taskId, { status: newStatus });
    addToast(`Task moved to ${newStatus}.`, 'success');
  };

  // Dynamic title based on role
  const getPageTitle = () => {
    if (currentUser?.role === ROLES.SUPER_ADMIN) return 'Platform Tasks';
    if (currentUser?.role === ROLES.COMPANY_OWNER) return 'Company Tasks';
    if (currentUser?.role === ROLES.MANAGER) return 'Team Tasks';
    return 'All Tasks';
  };

  const getPageSubtitle = () => {
    if (currentUser?.role === ROLES.SUPER_ADMIN) return 'Monitor all tasks across all tenant organizations.';
    if (currentUser?.role === ROLES.COMPANY_OWNER) return 'Track and oversee every task across all company projects and team members.';
    if (currentUser?.role === ROLES.MANAGER) return 'View and manage all tasks across your managed projects and team deliverables.';
    return 'Overview of all accessible tasks.';
  };

  return (
    <div className="space-y-6">
      <PageHeader title={getPageTitle()} subtitle={getPageSubtitle()} />

      {/* ── Summary Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Card className="!p-3.5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-lg">
              <ClipboardList size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{totalTasks}</p>
            </div>
          </div>
        </Card>
        <Card className="!p-3.5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 rounded-lg">
              <AlertCircle size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Todo</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{todoCount}</p>
            </div>
          </div>
        </Card>
        <Card className="!p-3.5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">In Progress</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{inProgressCount}</p>
            </div>
          </div>
        </Card>
        <Card className="!p-3.5">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <CheckCircle2 size={18} />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Completed</p>
              <p className="text-lg font-bold text-gray-900 dark:text-gray-100">{completedCount}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search tasks..."
          className="sm:w-64"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
        >
          <option value="All">All Statuses</option>
          <option value="Todo">Todo</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>
        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
        >
          <option value="All">All Priorities</option>
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>
        <select
          value={projectFilter}
          onChange={(e) => setProjectFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
        >
          <option value="All">All Projects</option>
          {visibleProjects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
        <select
          value={assigneeFilter}
          onChange={(e) => setAssigneeFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
        >
          <option value="All">All Assignees</option>
          {taskAssignees.map((u) => (
            <option key={u.id} value={u.id}>
              {u.name}
            </option>
          ))}
        </select>
        {/* Department Filter / Manager Indicator */}
        {currentUser?.role === ROLES.MANAGER ? (
          <div className="flex items-center gap-1.5 px-3 py-2 text-sm bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 rounded-lg border border-primary-200 dark:border-primary-800">
            <span className="text-gray-500 dark:text-gray-400 text-xs">Division:</span>
            <span className="font-semibold text-xs">{currentUser.department}</span>
          </div>
        ) : (
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 text-sm bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
          >
            <option value="All">All Departments</option>
            {availableDepartments
              .filter((d) => d !== 'All')
              .map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
          </select>
        )}
      </div>

      {/* ── Tasks Table ── */}
      <Card padding={false}>
        <div className="overflow-x-auto">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-16 text-sm text-gray-500 dark:text-gray-400">
              <ClipboardList size={40} className="mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p className="font-medium">No tasks found</p>
              <p className="text-xs mt-1">Try adjusting your filters to see more results.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-slate-700">
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Task
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Project
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Assignee
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-left px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Due Date
                  </th>
                  {canManageTasks && (
                    <th className="text-right px-5 py-3 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Update
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-slate-700/50">
                {filteredTasks.map((task) => {
                  const project = visibleProjects.find((p) => p.id === task.projectId);
                  const assignee = getUserById(task.assigneeId);

                  return (
                    <tr
                      key={task.id}
                      className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      {/* Task Title + Description */}
                      <td className="px-5 py-3 max-w-xs">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {task.title}
                        </p>
                        {task.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[250px]">
                            {task.description}
                          </p>
                        )}
                      </td>

                      {/* Project */}
                      <td className="px-5 py-3">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {project?.name || '—'}
                        </span>
                      </td>

                      {/* Assignee */}
                      <td className="px-5 py-3">
                        {assignee ? (
                          <div className="flex items-center gap-2">
                            <Avatar name={assignee.name} size="sm" />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 truncate">
                                {assignee.name}
                              </p>
                              <p className="text-xs text-gray-400 dark:text-gray-500">
                                {assignee.department}
                              </p>
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">Unassigned</span>
                        )}
                      </td>

                      {/* Priority */}
                      <td className="px-5 py-3">
                        <Badge variant="priority">{task.priority}</Badge>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3">
                        <Badge>{task.status}</Badge>
                      </td>

                      {/* Due Date */}
                      <td className="px-5 py-3 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {new Date(task.dueDate).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>

                      {/* Status Update (if has permission) */}
                      {canManageTasks && (
                        <td className="px-5 py-3 text-right">
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task.id, e.target.value)}
                            className="px-2.5 py-1 text-xs bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors cursor-pointer"
                          >
                            <option value="Todo">Todo</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      {/* ── Results Count ── */}
      <p className="text-xs text-gray-400 dark:text-gray-500 text-right">
        Showing {filteredTasks.length} of {totalTasks} tasks
      </p>
    </div>
  );
}
