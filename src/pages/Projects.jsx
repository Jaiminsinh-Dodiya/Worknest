import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, Users as UsersIcon } from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { useToast } from '../contexts/ToastContext';
import PageHeader from '../components/ui/PageHeader';
import SearchBar from '../components/ui/SearchBar';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Avatar from '../components/ui/Avatar';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import EmptyState from '../components/ui/EmptyState';

export default function Projects() {
  const { projects, allUsers, addProject, getUserById } = useApp();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    managerId: '',
    dueDate: '',
  });

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const matchesSearch = project.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'All' || project.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [projects, search, statusFilter]);

  const handleAddProject = (e) => {
    e.preventDefault();
    if (!newProject.name) return;
    addProject({
      name: newProject.name,
      description: newProject.description,
      managerId: newProject.managerId || 'user-1',
      teamMemberIds: ['user-1'],
      startDate: new Date().toISOString().split('T')[0],
      dueDate: newProject.dueDate || '2025-01-31',
    });
    addToast('Project created successfully.', 'success');
    setShowAddModal(false);
    setNewProject({ name: '', description: '', managerId: '', dueDate: '' });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        subtitle="Manage and track your company's projects."
        actions={
          <Button icon={Plus} onClick={() => setShowAddModal(true)}>
            New Project
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search projects..."
          className="sm:w-72"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 text-sm bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
        >
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Completed">Completed</option>
          <option value="On Hold">On Hold</option>
        </select>
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          title="No projects found"
          description="Create your first project to get started."
          actionLabel="+ Create Project"
          onAction={() => setShowAddModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredProjects.map((project) => {
            const manager = getUserById(project.managerId);
            const teamMembers = project.teamMemberIds
              .map((id) => getUserById(id))
              .filter(Boolean);

            return (
              <Card
                key={project.id}
                hover
                onClick={() => navigate(`/projects/${project.id}`)}
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {project.name}
                  </h3>
                  <Badge>{project.status}</Badge>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                  {project.description}
                </p>

                {/* Manager */}
                {manager && (
                  <div className="flex items-center gap-2 mb-3">
                    <Avatar name={manager.name} size="sm" />
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Manager</p>
                      <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {manager.name}
                      </p>
                    </div>
                  </div>
                )}

                {/* Team */}
                <div className="flex items-center gap-1 mb-4">
                  <div className="flex -space-x-1.5">
                    {teamMembers.slice(0, 4).map((member) => (
                      <Avatar
                        key={member.id}
                        name={member.name}
                        size="sm"
                        className="ring-2 ring-white dark:ring-slate-800"
                      />
                    ))}
                  </div>
                  {teamMembers.length > 4 && (
                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                      +{teamMembers.length - 4}
                    </span>
                  )}
                  <UsersIcon size={12} className="text-gray-400 ml-auto" />
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {teamMembers.length}
                  </span>
                </div>

                {/* Progress */}
                <ProgressBar value={project.progress} size="sm" showLabel />

                {/* Due Date */}
                <div className="flex items-center gap-1.5 mt-3 text-xs text-gray-500 dark:text-gray-400">
                  <Calendar size={12} />
                  Due {new Date(project.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Add Project Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Create New Project">
        <form onSubmit={handleAddProject} className="space-y-4">
          <Input
            label="Project Name"
            value={newProject.name}
            onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
            placeholder="Enter project name"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Description</label>
            <textarea
              value={newProject.description}
              onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
              placeholder="Describe the project"
              rows={3}
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Project Manager</label>
            <select
              value={newProject.managerId}
              onChange={(e) => setNewProject({ ...newProject, managerId: e.target.value })}
              className="w-full px-3.5 py-2.5 text-sm bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all duration-200"
            >
              <option value="">Select manager</option>
              {allUsers
                .filter((u) => u.role === 'Manager' || u.role === 'CompanyOwner')
                .map((u) => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
            </select>
          </div>
          <Input
            label="Due Date"
            type="date"
            value={newProject.dueDate}
            onChange={(e) => setNewProject({ ...newProject, dueDate: e.target.value })}
          />
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" type="button" onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button type="submit">Create Project</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
