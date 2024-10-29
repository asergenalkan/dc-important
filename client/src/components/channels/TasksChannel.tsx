import { useState, useEffect } from 'react';
import { Plus, LayoutGrid, List, Search, Filter } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import api from '../../config/api';
import type { ITask } from '../../types';

interface Props {
  channelId: string;
}

type ViewType = 'board' | 'list';

export default function TasksChannel({ channelId }: Props) {
  const { user } = useUser();
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [view, setView] = useState<ViewType>('board');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const columns = [
    { id: 'todo', name: 'To Do', color: '#ff5f5f' },
    { id: 'in_progress', name: 'In Progress', color: '#ffb01f' },
    { id: 'review', name: 'Review', color: '#00b8d9' },
    { id: 'done', name: 'Done', color: '#36b37e' },
  ];

  useEffect(() => {
    if (channelId) {
      fetchTasks();
    }
  }, [channelId]);

  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get(`/api/tasks/channel/${channelId}`);
      setTasks(data);
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const { source, destination, draggableId } = result;

    // Calculate new position
    const column = tasks.filter((t) => t.columnId === destination.droppableId);
    const newPosition =
      destination.index === 0
        ? (column[0]?.position ?? 0) - 1000
        : destination.index === column.length
        ? (column[column.length - 1]?.position ?? 0) + 1000
        : (column[destination.index - 1]?.position ?? 0) +
          (column[destination.index]?.position ?? 0) / 2;

    try {
      await api.patch('/api/tasks/reorder', {
        taskId: draggableId,
        newPosition,
        newColumnId: destination.droppableId,
      });

      // Optimistically update UI
      setTasks((prev) => {
        const task = prev.find((t) => t._id === draggableId);
        if (!task) return prev;

        return prev
          .map((t) =>
            t._id === draggableId
              ? {
                  ...t,
                  columnId: destination.droppableId,
                  position: newPosition,
                }
              : t
          )
          .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
      });
    } catch (error) {
      console.error('Failed to reorder task:', error);
      fetchTasks(); // Refresh on error
    }
  };

  const filteredTasks = tasks.filter((task) =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getColumnTasks = (columnId: string) =>
    filteredTasks
      .filter((task) => task.columnId === columnId)
      .sort((a, b) => (a.position ?? 0) - (b.position ?? 0));

  return (
    <div className="flex-1 p-6 bg-gray-900">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-white">Tasks</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search tasks..."
              className="pl-9 pr-4 py-2 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex rounded-lg overflow-hidden">
            <button
              onClick={() => setView('board')}
              className={`px-4 py-2 flex items-center space-x-2 transition-colors ${
                view === 'board'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
              <span>Board</span>
            </button>
            <button
              onClick={() => setView('list')}
              className={`px-4 py-2 flex items-center space-x-2 transition-colors ${
                view === 'list'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <List className="w-4 h-4" />
              <span>List</span>
            </button>
          </div>
          <button className="p-2 bg-indigo-500 hover:bg-indigo-600 rounded-lg transition-colors">
            <Plus className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : view === 'board' ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-4 gap-4">
            {columns.map((column) => (
              <div key={column.id} className="bg-gray-800 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: column.color }}
                    />
                    <h3 className="font-medium text-white">{column.name}</h3>
                  </div>
                  <span className="text-sm text-gray-400">
                    {getColumnTasks(column.id).length}
                  </span>
                </div>

                <Droppable droppableId={column.id}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="space-y-2"
                    >
                      {getColumnTasks(column.id).map((task, index) => (
                        <Draggable
                          key={task._id}
                          draggableId={task._id}
                          index={index}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="bg-gray-700 p-3 rounded-lg hover:bg-gray-600 transition-colors"
                            >
                              <h4 className="text-white font-medium mb-2">
                                {task.title}
                              </h4>
                              {task.description && (
                                <p className="text-sm text-gray-400 line-clamp-2">
                                  {task.description}
                                </p>
                              )}
                              {((task.labels?.length ?? 0) > 0 ||
                                (task.assignees?.length ?? 0) > 0) && (
                                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-600">
                                  {(task.labels?.length ?? 0) > 0 && (
                                    <div className="flex -space-x-1">
                                      {task.labels?.map((label, i) => (
                                        <div
                                          key={i}
                                          className="w-2 h-2 rounded-full ring-2 ring-gray-700"
                                          style={{ backgroundColor: label }}
                                        />
                                      ))}
                                    </div>
                                  )}
                                  {(task.assignees?.length ?? 0) > 0 && (
                                    <div className="flex -space-x-2">
                                      {task.assignees?.map((assignee, i) => (
                                        <div
                                          key={i}
                                          className="w-6 h-6 rounded-full bg-gray-500 ring-2 ring-gray-700 flex items-center justify-center"
                                        >
                                          <span className="text-xs text-white">
                                            {assignee.charAt(0).toUpperCase()}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      ) : (
        <div className="bg-gray-800 rounded-lg">
          {/* List view implementation will come next */}
          <p className="text-gray-400 p-4">List view coming soon...</p>
        </div>
      )}
    </div>
  );
}
