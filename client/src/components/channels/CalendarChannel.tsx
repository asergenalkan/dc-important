import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Plus, Grid, List } from 'lucide-react';
import type { ICalendarEvent } from '../../types';
import api from '../../config/api';
import CalendarEventModal from '../modals/CalendarEventModal';

interface Props {
  channelId: string;
}

type ViewType = 'month' | 'week' | 'agenda';

export default function CalendarChannel({ channelId }: Props) {
  const [events, setEvents] = useState<ICalendarEvent[]>([]);
  const [view, setView] = useState<ViewType>('month');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<
    ICalendarEvent | undefined
  >();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (channelId) {
      fetchEvents();
    }
  }, [channelId]);

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const { data } = await api.get(`/api/calendar/channel/${channelId}`);
      setEvents(data);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateEvent = async (data: Partial<ICalendarEvent>) => {
    try {
      const response = await api.post('/api/calendar', {
        ...data,
        channelId,
      });
      setEvents((prev) => [...prev, response.data]);
    } catch (error) {
      console.error('Failed to create event:', error);
      throw error;
    }
  };

  const handleUpdateEvent = async (
    eventId: string,
    data: Partial<ICalendarEvent>
  ) => {
    try {
      const response = await api.patch(`/api/calendar/${eventId}`, data);
      setEvents((prev) =>
        prev.map((event) => (event._id === eventId ? response.data : event))
      );
    } catch (error) {
      console.error('Failed to update event:', error);
      throw error;
    }
  };

  const getViewStartDate = () => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    if (view === 'week') {
      const day = date.getDay();
      date.setDate(date.getDate() - day);
    }
    return date;
  };

  const renderMonthView = () => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    const startingDay = firstDay.getDay();
    const totalDays = lastDay.getDate();
    const weeks = Math.ceil((startingDay + totalDays) / 7);

    const days = [];
    let day = 1;

    for (let i = 0; i < weeks * 7; i++) {
      if (i < startingDay || day > totalDays) {
        days.push(null);
      } else {
        days.push(new Date(today.getFullYear(), today.getMonth(), day++));
      }
    }

    return (
      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div key={day} className="p-2 text-center text-gray-400 font-medium">
            {day}
          </div>
        ))}
        {days.map((date, index) => (
          <div
            key={index}
            className={`min-h-[100px] p-2 border border-gray-700 ${
              date ? 'bg-gray-800' : 'bg-gray-900'
            }`}
          >
            {date && (
              <>
                <div
                  className={`text-sm ${
                    date.toDateString() === new Date().toDateString()
                      ? 'text-indigo-400 font-bold'
                      : 'text-gray-400'
                  }`}
                >
                  {date.getDate()}
                </div>
                <div className="space-y-1 mt-1">
                  {events
                    .filter((event) => {
                      const eventDate = new Date(event.startDate);
                      return eventDate.toDateString() === date.toDateString();
                    })
                    .map((event) => (
                      <button
                        key={event._id}
                        onClick={() => setSelectedEvent(event)}
                        className="w-full text-left p-1 text-xs rounded bg-opacity-20 truncate"
                        style={{ backgroundColor: event.color }}
                      >
                        {event.title}
                      </button>
                    ))}
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderWeekView = () => {
    const startDate = getViewStartDate();
    const days: Date[] = [];
    const hours = Array.from({ length: 24 }, (_, i) => i);

    // Generate week days
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      days.push(date);
    }

    return (
      <div className="relative">
        {/* Time labels */}
        <div className="absolute left-0 top-0 w-16 h-full flex flex-col border-r border-gray-700">
          {hours.map((hour) => (
            <div
              key={hour}
              className="h-20 -mt-3 text-xs text-gray-400 text-right pr-2"
            >
              {`${hour.toString().padStart(2, '0')}:00`}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="ml-16">
          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-gray-700">
            {days.map((day, index) => (
              <div
                key={index}
                className="p-2 text-center border-l border-gray-700 first:border-l-0"
              >
                <div className="text-sm text-gray-400">
                  {day.toLocaleDateString('en-US', { weekday: 'short' })}
                </div>
                <div className="text-white font-medium">{day.getDate()}</div>
              </div>
            ))}
          </div>

          {/* Time grid */}
          <div className="relative">
            {/* Hour lines */}
            {hours.map((hour) => (
              <div
                key={hour}
                className="grid grid-cols-7 h-20 border-b border-gray-700/50"
              >
                {days.map((_, index) => (
                  <div
                    key={index}
                    className="border-l border-gray-700/50 first:border-l-0"
                  />
                ))}
              </div>
            ))}

            {/* Events */}
            <div className="absolute inset-0">
              {events.map((event) => {
                const start = new Date(event.startDate);
                const end = new Date(event.endDate);
                const dayIndex = start.getDay();
                const startHour = start.getHours() + start.getMinutes() / 60;
                const duration =
                  (end.getTime() - start.getTime()) / (1000 * 60 * 60);

                // Only show events for the current week
                if (start < startDate || start > days[6]) return null;

                return (
                  <div
                    key={event._id}
                    className="absolute rounded-lg p-2 text-white text-sm overflow-hidden"
                    style={{
                      left: `${(dayIndex / 7) * 100}%`,
                      width: `${100 / 7}%`,
                      top: `${startHour * 5}rem`,
                      height: `${duration * 5}rem`,
                      backgroundColor: event.color,
                    }}
                  >
                    <div className="font-medium">{event.title}</div>
                    {duration > 0.5 && (
                      <div className="text-xs opacity-75">
                        {start.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 p-6 bg-gray-900">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className="text-2xl font-bold text-white">Calendar</h2>
          <div className="flex rounded-lg overflow-hidden">
            <button
              onClick={() => setView('month')}
              className={`px-4 py-2 flex items-center space-x-2 transition-colors ${
                view === 'month'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Month</span>
            </button>
            <button
              onClick={() => setView('week')}
              className={`px-4 py-2 flex items-center space-x-2 transition-colors ${
                view === 'week'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <Grid className="w-4 h-4" />
              <span>Week</span>
            </button>
            <button
              onClick={() => setView('agenda')}
              className={`px-4 py-2 flex items-center space-x-2 transition-colors ${
                view === 'agenda'
                  ? 'bg-indigo-500 text-white'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              <List className="w-4 h-4" />
              <span>Agenda</span>
            </button>
          </div>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white rounded-lg transition-colors flex items-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>Create Event</span>
        </button>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-[calc(100vh-200px)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-lg p-4 overflow-auto">
          {view === 'month' && renderMonthView()}
          {view === 'week' && renderWeekView()}
          {view === 'agenda' && (
            <div className="text-gray-400 text-center py-8">
              Agenda view coming soon...
            </div>
          )}
        </div>
      )}

      <CalendarEventModal
        isOpen={isCreateModalOpen || !!selectedEvent}
        onClose={() => {
          setIsCreateModalOpen(false);
          setSelectedEvent(undefined);
        }}
        onSubmit={
          selectedEvent
            ? (data) => handleUpdateEvent(selectedEvent._id, data)
            : handleCreateEvent
        }
        event={selectedEvent}
      />
    </div>
  );
}
