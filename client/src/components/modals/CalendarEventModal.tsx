import { useState } from 'react';
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Bell,
  Users,
  Repeat,
} from 'lucide-react';
import type { ICalendarEvent } from '../../types';
import { Dialog } from '@headlessui/react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<ICalendarEvent>) => Promise<void>;
  event?: ICalendarEvent;
}

export default function CalendarEventModal({
  isOpen,
  onClose,
  onSubmit,
  event,
}: Props) {
  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [startDate, setStartDate] = useState(
    event?.startDate
      ? new Date(event.startDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [startTime, setStartTime] = useState(
    event?.startDate
      ? new Date(event.startDate).toTimeString().slice(0, 5)
      : '09:00'
  );
  const [endDate, setEndDate] = useState(
    event?.endDate
      ? new Date(event.endDate).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0]
  );
  const [endTime, setEndTime] = useState(
    event?.endDate
      ? new Date(event.endDate).toTimeString().slice(0, 5)
      : '10:00'
  );
  const [allDay, setAllDay] = useState(event?.allDay || false);
  const [location, setLocation] = useState(event?.location || '');
  const [color, setColor] = useState(event?.color || '#7289DA');
  const [isRecurring, setIsRecurring] = useState(!!event?.recurring);
  const [recurringFrequency, setRecurringFrequency] = useState<
    'daily' | 'weekly' | 'monthly' | 'yearly'
  >(event?.recurring?.frequency || 'weekly');
  const [recurringInterval, setRecurringInterval] = useState(
    event?.recurring?.interval || 1
  );
  const [recurringUntil, setRecurringUntil] = useState(
    event?.recurring?.until
      ? new Date(event.recurring.until).toISOString().split('T')[0]
      : ''
  );
  const [reminders, setReminders] = useState<
    { time: number; type: 'notification' | 'email' }[]
  >(event?.reminders || []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const colors = [
    '#7289DA',
    '#43B581',
    '#FAA61A',
    '#F04747',
    '#B9BBBE',
    '#FF73FA',
    '#FFB3B3',
    '#02A9FF',
    '#C27C0E',
    '#018786',
  ];

  const reminderOptions = [
    { value: 0, label: 'At time of event' },
    { value: 5, label: '5 minutes before' },
    { value: 15, label: '15 minutes before' },
    { value: 30, label: '30 minutes before' },
    { value: 60, label: '1 hour before' },
  ];

  const handleSubmit = async () => {
    if (!title || !startDate || !endDate) {
      setError('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await onSubmit({
        title,
        description,
        startDate: new Date(`${startDate}T${startTime}`).toISOString(),
        endDate: new Date(`${endDate}T${endTime}`).toISOString(),
        allDay,
        location,
        color,
        recurring: isRecurring
          ? {
              frequency: recurringFrequency,
              interval: recurringInterval,
              until: recurringUntil,
            }
          : undefined,
        reminders,
      });
      onClose();
    } catch (error) {
      setError('Failed to save event');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-white">
            {event ? 'Edit Event' : 'Create Event'}
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X className="w-6 h-6" />
          </button>
        </div>

        {error && <p className="text-red-500 mb-4">{error}</p>}

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
              placeholder="Event title"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
              placeholder="Event description"
            />
          </div>

          <div className="flex space-x-4">
            <div>
              <label className="block text-sm text-gray-400">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400">Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
              />
            </div>
          </div>

          <div className="flex space-x-4">
            <div>
              <label className="block text-sm text-gray-400">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400">End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="flex items-center text-sm text-gray-400">
              <input
                type="checkbox"
                checked={allDay}
                onChange={(e) => setAllDay(e.target.checked)}
                className="mr-2"
              />
              All Day Event
            </label>
          </div>

          <div>
            <label className="block text-sm text-gray-400">Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
              placeholder="Event location"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-400">Event Color</label>
            <div className="flex space-x-2">
              {colors.map((colorOption) => (
                <button
                  key={colorOption}
                  onClick={() => setColor(colorOption)}
                  style={{ backgroundColor: colorOption }}
                  className={`w-6 h-6 rounded-full ${
                    colorOption === color ? 'ring-2 ring-white' : ''
                  }`}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-400">Reminders</label>
            <select
              multiple
              value={reminders.map((r) => r.time.toString())}
              onChange={(e) =>
                setReminders(
                  Array.from(e.target.selectedOptions).map((opt) => ({
                    time: parseInt(opt.value, 10),
                    type: 'notification',
                  }))
                )
              }
              className="w-full px-3 py-2 bg-gray-700 text-white rounded-lg"
            >
              {reminderOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end mt-6 space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600"
            disabled={isLoading}
          >
            {isLoading ? 'Saving...' : event ? 'Update Event' : 'Create Event'}
          </button>
        </div>
      </div>
    </Dialog>
  );
}
