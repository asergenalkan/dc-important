import { useState } from 'react';
import { X, Calendar as CalendarIcon, Clock, MapPin, Bell, Users, Repeat } from 'lucide-react';
import type { ICalendarEvent } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<ICalendarEvent>) => Promise<void>;
  event?: ICalendarEvent;
}

export default function CalendarEventModal({ isOpen, onClose, onSubmit, event }: Props) {
  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [startDate, setStartDate] = useState(event?.startDate ? new Date(event.startDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState(event?.startDate ? new Date(event.startDate).toTimeString().slice(0,5) : '09:00');
  const [endDate, setEndDate] = useState(event?.endDate ? new Date(event.endDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
  const [endTime, setEndTime] = useState(event?.endDate ? new Date(event.endDate).toTimeString().slice(0,5) : '10:00');
  const [allDay, setAllDay] = useState(event?.allDay || false);
  const [location, setLocation] = useState(event?.location || '');
  const [color, setColor] = useState(event?.color || '#7289DA');
  const [isRecurring, setIsRecurring] = useState(!!event?.recurring);
  const [recurringFrequency, setRecurringFrequency] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>(event?.recurring?.frequency || 'weekly');
  const [recurringInterval, setRecurringInterval] = useState(event?.recurring?.interval || 1);
  const [recurringUntil, setRecurringUntil] = useState(event?.recurring?.until ? new Date(event.recurring.until).toISOString().split('T')[0] : '');
  const [reminders, setReminders] = useState<ICalendarEvent['reminders']>(event?.reminders || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const colors = [
    '#7289DA', '#43B581', '#FAA61A', '#F04747', '#B9BBBE',
    '#FF73FA', '#FFB3B3', '#02A9FF', '#C27C0E', '#018786'
  ];

  const reminderOptions = [
    { value: 0, label: 'At time of event' },
    { value: 5, label: '5 minutes before' },
    { value: 15, label: '15 minutes before' },
    { value: 30, label: '30 minutes before' },
    { value: 60, label: '1 hour before' },
    { value: 1440, label: '1 day before' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const startDateTime = new Date(`${startDate}T${startTime}`);
      const endDateTime = new Date(`${endDate}T${endTime}`);

      if (endDateTime <= startDateTime) {
        setError('End time must be after start time');
        return;
      }

      const data: Partial<ICalendarEvent> = {
        title: title.trim(),
        description: description.trim(),
        startDate: startDateTime.toISOString(),
        endDate: endDateTime.toISOString(),
        allDay,
        location: location.trim(),
        color,
        reminders,
        ...(isRecurring && {
          recurring: {
            frequency: recurringFrequency,
            interval: recurringInterval,
            until: recurringUntil ? new Date(recurringUntil).toISOString() : undefined
          }
        })
      };

      await onSubmit(data);
      onClose();
    } catch (error) {
      setError('Failed to save event');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg w-full max-w-lg mx-4">
        <form onSubmit={handleSubmit} className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-white">
              {event ? 'Edit Event' : 'Create Event'}
            </h2>
            <button 
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-500 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Event title"
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-start space-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Start
                </label>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {!allDay && (
                    <input
                      type="time"
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-24 px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  )}
                </div>
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  End
                </label>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {!allDay && (
                    <input
                      type="time"
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-24 px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  )}
                </div>
              </div>
            </div>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
                className="rounded border-gray-600 text-indigo-500 focus:ring-indigo-500"
              />
              <span className="text-gray-300">All day</span>
            </label>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Add location"
                  className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Color
              </label>
              <div className="flex flex-wrap gap-2">
                {colors.map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`w-8 h-8 rounded-full transition-transform ${
                      color === c ? 'ring-2 ring-white scale-110' : ''
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                <Repeat className="w-5 h-5" />
                <span>Recurring Event</span>
              </label>
              <div className="flex items-center space-x-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={isRecurring}
                    onChange={(e) => setIsRecurring(e.target.checked)}
                    className="rounded border-gray-600 text-indigo-500 focus:ring-indigo-500"
                  />
                  <span className="text-gray-300">Repeat</span>
                </label>
                {isRecurring && (
                  <div className="flex items-center space-x-2">
                    <select
                      value={recurringFrequency}
                      onChange={(e) => setRecurringFrequency(e.target.value as typeof recurringFrequency)}
                      className="bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="yearly">Yearly</option>
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={recurringInterval}
                      onChange={(e) => setRecurringInterval(Number(e.target.value))}
                      className="w-20 px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <input
                      type="date"
                      value={recurringUntil}
                      onChange={(e) => setRecurringUntil(e.target.value)}
                      className="px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Until"
                    />
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-300 mb-2">
                <Bell className="w-5 h-5" />
                <span>Reminders</span>
              </label>
              <select
                multiple
                value={reminders.map(r => r.time.toString())}
                onChange={(e) => {
                  const times = Array.from(e.target.selectedOptions, option => Number(option.value));
                  setReminders(times.map(time => ({
                    time,
                    type: 'notification'
                  })));
                }}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                size={4}
              >
                {reminderOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors disabled:opacity-50"
              >
                {isLoading ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}