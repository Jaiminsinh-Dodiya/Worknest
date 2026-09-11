import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  Calendar,
  User,
  Clock,
  Edit3,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import { ROLES } from '../config/roles';
import { hasPermission } from '../config/permissions';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';
import EmptyState from '../components/ui/EmptyState';

const statusColumns = ['Todo', 'In Progress', 'Completed'];

export default function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    getProjectById,
    getTasksByProject,
    getUserById,
    allUsers,
    addTask,
    updateTask,
    updateProject,
    currentUser,
  } = useApp();
  const { addToast } = useToast();
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assigneeId: '',
    priority: 'Medium',
    dueDate: '',
    status: 'Todo',
  });

  const project = getProjectById(id);
  const projectTasks = getTasksByProject(id);
  const canManageTasks = hasPermission(currentUser?.role, 'tasks.manage');
  const canManageProjects = hasPermission(currentUser?.role, 'projects.manage');

  const [deptFilter, setDeptFilter] = useState('All');
  const [showEditProject, setShowEditProject] = useState(false);
  const [editProjectForm, setEditProjectForm] = useState({
    name: '',
    description: '',
    status: 'Active',
    managerId: '',
    dueDate: '',
    progress: 0,
    teamMemberIds: [],
  });

  const availableDepts = useMemo(() => {
    const depts = new Set(
      (projectTasks || [])
        .map((t) => getUserById(t.assigneeId)?.department)
        .filter(Boolean)
    );
    return ['All', ...Array.from(depts)];
  }, [projectTasks, getUserById]);

  const tasksByStatus = useMemo(() => {
    const grouped = {};
    const filtered = (projectTasks || []).filter((t) => {
      if (deptFilter === 'All') return true;
      const assignee = getUserById(t.assigneeId);
      return assignee?.department === deptFilter;
    });
    statusColumns.forEach((status) => {
      grouped[status] = filtered.filter((t) => t.status === status);
    });
    return grouped;
  }, [projectTasks, deptFilter, getUserById]);

  if (!project) {
    return (
      <EmptyState
        title="Project not found"
        description="The project you're looking for doesn't exist."
        actionLabel="Back to Projects"
        onAction={() => navigate('/projects')}
      />
    );
  }

  const manager = getUserById(project.managerId);
  const teamMembers = project.teamMemberIds.map((uid) => getUserById(uid)).filter(Boolean);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.title) return;
    addTask({
      title: newTask.title,
      description: newTask.description,
      projectId: id,
      assigneeId: newTask.assigneeId || currentUser.id,
      priority: newTask.priority,
      status: newTask.status,
      dueDate: newTask.dueDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    });
    addToast('Task created successfully.', 'success');
    setShowAddTask(false);
    setNewTask({ title: '', description: '', assigneeId: '', priority: 'Medium', dueDate: '', status: 'Todo' });
  };

  const handleStatusChange = (taskId, newStatus) => {
    updateTask(taskId, { status: newStatus });
    addToast(`Task moved to ${newStatus}.`, 'success');
  };

  const handleProjectStatusChange = (newStatus) => {
    updateProject(id, { status: newStatus });
    addToast(`Project status updated to ${newStatus}.`, 'success');
  };

  const handleOpenEditProject = () => {
    if (!project) return;
    setEditProjectForm({
      name: project.name || '',
      description: project.description || '',
      status: project.status || 'Active',
      managerId: project.managerId || '',
      dueDate: project.dueDate ? new Date(project.dueDate).toISOString().split('T')[0] : '',
      progress: project.progress || 0,
      teamMemberIds: project.teamMemberIds || [],
    });
    setShowEditProject(true);
  };

  const handleEditProjectSubmit = (e) => {
    e.preventDefault();
    if (!editProjectForm.name) return;
    updateProject(id, {
      ...editProjectForm,
      progress: Number(editProjectForm.progress),
    });
    addToast('Project updated successfully.', 'success');
    setShowEditProject(false);
  };

  const toggleTeamMember = (memberId) => {
    setEditProjectForm((prev) => {
      const exists = prev.teamMemberIds.includes(memberId);
      return {
        ...prev,
        teamMemberIds: exists
          ? prev.teamMemberIds.filter((mId) => mId !== memberId)
          : [...prev.teamMemberIds, memberId],
      };
    });
  };

  const canEditTaskStatus = (task) => {
    if (canManageTasks) return true;
    if (currentUser?.role === ROLES.EMPLOYEE) {
      return task.assigneeId === currentUser?.id;
    }
    return false;
  };

  return (
    <div className="space-y-6">
      {/* Back + Header */}
      <div>
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 mb-3 transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} /> Back to Projects
        </button>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{project.name}</h1>
              {canManageProjects ? (
                <select
                  value={project.status}
                  onChange={(e) => handleProjectStatusChange(e.target.value)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-full border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-800 dark:text-gray-200 cursor-pointer focus:ring-2 focus:ring-primary-500 shadow-sm transition-colors"
                >
                  <option value="Active">🟢 Active</option>
                  <option value="On Hold">🟠 On Hold</option>
                  <option value="Completed">🔵 Completed</option>
                </select>
              ) : (
                <Badge>{project.status}</Badge>
              )}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">{project.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {canManageProjects && (
              <Button
                variant="secondary"
                icon={Edit3}
                onClick={handleOpenEditProject}
                size="sm"
              >
                Edit Project
              </Button>
            )}
            {canManageTasks && (
              <Button icon={Plus} onClick={() => setShowAddTask(true)} size="sm">
                New Task
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Project Info Bar */}
      <Card>
        <div className="flex flex-wrap gap-6">
          {manager && (
            <div className="flex items-center gap-2">
              <User size={14} className="text-gray-400" />
              <span className="text-sm text-gray-500 dark:text-gray-400">Manager:</span>
              <div className="flex items-center gap-1.5">
                <Avatar name={manager.name} size="sm" />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{manager.name}</span>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar size={14} className="text-gray-400" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Due:</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {new Date(project.dueDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
          <div className="flex items-center gap-2 min-w-[200px]">
            <Clock size={14} className="text-gray-400" />
            <span className="text-sm text-gray-500 dark:text-gray-400">Progress:</span>
            <div className="flex-1">
              <ProgressBar value={project.progress} size="sm" />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{project.progress}%</span>
          </div>
          {/* Team */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">Team:</span>
            <div className="flex -space-x-1.5">
              {teamMembers.slice(0, 5).map((m) => (
                <Avatar key={m.id} name={m.name} size="sm" className="ring-2 ring-white dark:ring-slate-800" />
              ))}
            </div>
            {teamMembers.length > 5 && (
              <span className="text-xs text-gray-500">+{teamMembers.length - 5}</span>
            )}
          </div>
        </div>
      </Card>

      {/* Kanban Board Header & Department Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">Tasks Board</h2>
        {availableDepts.length > 2 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">Department:</span>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="px-2.5 py-1 text-xs bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-primary-500 cursor-pointer"
            >
              {availableDepts.map((d) => (
                <option key={d} value={d}>
                  {d === 'All' ? 'All Departments' : d}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {statusColumns.map((status) => (
          <div key={status} className="bg-gray-50 dark:bg-slate-800/50 rounded-xl p-3">
            {/* Column Header */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{status}</h3>
                <span className="text-xs bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-400 px-2 py-0.5 rounded-full">
                  {tasksByStatus[status]?.length || 0}
                </span>
              </div>
            </div>

            {/* Task Cards */}
            <div className="space-y-2 min-h-[100px]">
              {tasksByStatus[status]?.length === 0 ? (
                <div className="text-center py-8 text-xs text-gray-400 dark:text-gray-500">
                  No tasks
                </div>
              ) : (
                tasksByStatus[status]?.map((task) => {
                  const assignee = getUserById(task.assigneeId);
                  const isEditable = canEditTaskStatus(task);

                  return (
                    <div
                      key={task.id}
                      className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-3 hover:border-primary-300 dark:hover:border-primary-600 transition-all duration-200 animate-fadeIn"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 flex-1">
                          {task.title}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="priority">{task.priority}</Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          {assignee && <Avatar name={assignee.name} size="sm" />}
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {assignee?.name?.split(' ')[0] || 'Unassigned'}
                            {assignee?.id === currentUser?.id && ' (You)'}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400 dark:text-gray-500">
                          {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>

                      {/* Status Change Dropdown or Readonly Indicator */}
                      <div className="mt-2 pt-2 border-t border-gray-100 dark:border-slate-700">
                        {isEditable ? (
                          <select
                            value={task.status}
                            onChange={(e) => handleStatusChange(task.id, e.target.value)}
                            className="w-full px-2 py-1 text-xs bg-gray-50 dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-all duration-200 cursor-pointer"
                          >
                            <option value="Todo">Todo</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Completed">Completed</option>
                          </select>
                        ) : (
                          <div className="flex items-center justify-between text-xs text-gray-400">
                            <span>Status</span>
                            <Badge size="sm">{task.status}</Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Add Task Modal */}
      {canManageTasks && (
        <Modal isOpen={showAddTask} onClose={() => setShowAddTask(false)} title="Create New Task">
          <form onSubmit={handleAddTask} className="space-y-4">
            <Input
              label="Task Name"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="Enter task name"
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
              <textarea
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Describe the task"
                rows={3}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 resize-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Assignee</label>
              <select
                value={newTask.assigneeId}
                onChange={(e) => setNewTask({ ...newTask, assigneeId: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
              >
                <option value="">Select assignee</option>
                {allUsers.map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Status</label>
                <select
                  value={newTask.status}
                  onChange={(e) => setNewTask({ ...newTask, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                >
                  <option value="Todo">Todo</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
            <Input
              label="Due Date"
              type="date"
              value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
            />
            <div className="flex justify-end gap-3 pt-2">
              <Button variant="secondary" type="button" onClick={() => setShowAddTask(false)}>Cancel</Button>
              <Button type="submit">Create Task</Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Project Modal */}
      {canManageProjects && (
        <Modal
          isOpen={showEditProject}
          onClose={() => setShowEditProject(false)}
          title="Edit Project"
        >
          <form onSubmit={handleEditProjectSubmit} className="space-y-4">
            <Input
              label="Project Name"
              value={editProjectForm.name}
              onChange={(e) =>
                setEditProjectForm({ ...editProjectForm, name: e.target.value })
              }
              placeholder="Enter project name"
              required
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Description
              </label>
              <textarea
                value={editProjectForm.description}
                onChange={(e) =>
                  setEditProjectForm({ ...editProjectForm, description: e.target.value })
                }
                placeholder="Describe the project"
                rows={3}
                className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 resize-none"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Status
                </label>
                <select
                  value={editProjectForm.status}
                  onChange={(e) =>
                    setEditProjectForm({ ...editProjectForm, status: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                >
                  <option value="Active">Active</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Project Manager
                </label>
                <select
                  value={editProjectForm.managerId}
                  onChange={(e) =>
                    setEditProjectForm({ ...editProjectForm, managerId: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
                >
                  <option value="">Select manager</option>
                  {allUsers
                    .filter((u) => u.role === ROLES.MANAGER || u.role === ROLES.COMPANY_OWNER)
                    .map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Due Date"
                type="date"
                value={editProjectForm.dueDate}
                onChange={(e) =>
                  setEditProjectForm({ ...editProjectForm, dueDate: e.target.value })
                }
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Progress ({editProjectForm.progress}%)
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={editProjectForm.progress}
                  onChange={(e) =>
                    setEditProjectForm({
                      ...editProjectForm,
                      progress: Number(e.target.value),
                    })
                  }
                  className="w-full mt-2 accent-primary-600"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Team Members
              </label>
              <div className="max-h-40 overflow-y-auto space-y-1.5 p-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800/50">
                {allUsers.map((u) => {
                  const isChecked = editProjectForm.teamMemberIds.includes(u.id);
                  return (
                    <label
                      key={u.id}
                      className="flex items-center gap-2 p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer text-xs text-gray-800 dark:text-gray-200"
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleTeamMember(u.id)}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <span className="font-medium">{u.name}</span>
                      <span className="text-gray-400">({u.role} - {u.department})</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="secondary"
                type="button"
                onClick={() => setShowEditProject(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
