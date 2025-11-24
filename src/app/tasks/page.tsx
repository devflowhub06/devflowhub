import { Filter, Plus } from 'lucide-react';

const tasks = [
  {
    id: 1,
    title: 'Implement user authentication',
    description: 'Set up JWT authentication and user sessions',
    status: 'In Progress',
    priority: 'High',
    assignee: 'John Doe',
    dueDate: '2024-03-15',
    workflow: 'Feature Development',
  },
  {
    id: 2,
    title: 'Fix login page responsiveness',
    description: 'Address mobile view issues on the login page',
    status: 'To Do',
    priority: 'Medium',
    assignee: 'Jane Smith',
    dueDate: '2024-03-20',
    workflow: 'Bug Fix',
  },
  {
    id: 3,
    title: 'Review pull request #123',
    description: 'Code review for new feature implementation',
    status: 'In Review',
    priority: 'High',
    assignee: 'Mike Johnson',
    dueDate: '2024-03-10',
    workflow: 'Code Review',
  },
];

const statusColors: { [key: string]: string } = {
  'To Do': 'bg-gray-100 text-gray-800',
  'In Progress': 'bg-blue-100 text-blue-800',
  'In Review': 'bg-yellow-100 text-yellow-800',
  'Completed': 'bg-green-100 text-green-800',
};

const priorityColors: { [key: string]: string } = {
  'High': 'bg-red-100 text-red-800',
  'Medium': 'bg-yellow-100 text-yellow-800',
  'Low': 'bg-green-100 text-green-800',
};

export default function TasksPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Tasks</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage and track your development tasks
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            <Filter className="-ml-0.5 mr-1.5 h-5 w-5 text-gray-400" aria-hidden="true" />
            Filter
          </button>
          <button
            type="button"
            className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <Plus className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            New Task
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow">
        <ul role="list" className="divide-y divide-gray-200">
          {tasks.map((task) => (
            <li key={task.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-medium text-indigo-600">{task.title}</p>
                    <div className="ml-2 flex flex-shrink-0 space-x-2">
                      <p className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${statusColors[task.status]}`}>
                        {task.status}
                      </p>
                      <p className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${priorityColors[task.priority]}`}>
                        {task.priority}
                      </p>
                    </div>
                  </div>
                  <div className="mt-2 flex">
                    <div className="flex items-center text-sm text-gray-500">
                      <p>{task.description}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <p>Assigned to {task.assignee} • Due {task.dueDate} • {task.workflow}</p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
} 