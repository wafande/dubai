import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format } from 'date-fns';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import { enUS } from 'date-fns/locale';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface Event {
  id: string;
  title: string;
  start: Date;
  end: Date;
  tourId: string;
  maxCapacity: number;
  bookedSpots: number;
}

interface Props {
  tourId: string;
  tourName: string;
}

export function AvailabilityCalendar({ tourId, tourName }: Props) {
  const [events, setEvents] = useState<Event[]>([]);
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [newEvent, setNewEvent] = useState({
    title: '',
    start: new Date(),
    end: new Date(),
    maxCapacity: 10,
  });

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setNewEvent({
      ...newEvent,
      start,
      end,
      title: tourName
    });
    setShowEventModal(true);
  };

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleSaveEvent = () => {
    if (selectedEvent) {
      setEvents(events.map(event => 
        event.id === selectedEvent.id 
          ? { ...selectedEvent, ...newEvent }
          : event
      ));
    } else {
      const event: Event = {
        id: Math.random().toString(36).substr(2, 9),
        tourId,
        bookedSpots: 0,
        ...newEvent,
      };
      setEvents([...events, event]);
    }
    handleCloseModal();
  };

  const handleDeleteEvent = (eventId: string) => {
    setEvents(events.filter(event => event.id !== eventId));
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setShowEventModal(false);
    setSelectedEvent(null);
    setNewEvent({
      title: '',
      start: new Date(),
      end: new Date(),
      maxCapacity: 10,
    });
  };

  return (
    <div className="h-full">
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          {tourName} Availability
        </h2>
        <button
          onClick={() => setShowEventModal(true)}
          className="flex items-center px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Time Slot
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 'calc(100vh - 250px)' }}
          selectable
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          views={['month', 'week', 'day']}
          defaultView="week"
        />
      </div>

      {showEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">
                {selectedEvent ? 'Edit Time Slot' : 'Add Time Slot'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-500"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="start-time">
                  Start Time
                </label>
                <input
                  id="start-time"
                  type="datetime-local"
                  title="Select start time"
                  value={format(newEvent.start, "yyyy-MM-dd'T'HH:mm")}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      start: new Date(e.target.value)
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="end-time">
                  End Time
                </label>
                <input
                  id="end-time"
                  type="datetime-local"
                  title="Select end time"
                  value={format(newEvent.end, "yyyy-MM-dd'T'HH:mm")}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      end: new Date(e.target.value)
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700" htmlFor="max-capacity">
                  Maximum Capacity
                </label>
                <input
                  id="max-capacity"
                  type="number"
                  title="Enter maximum capacity"
                  value={newEvent.maxCapacity}
                  onChange={(e) =>
                    setNewEvent({
                      ...newEvent,
                      maxCapacity: parseInt(e.target.value)
                    })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-amber-500 focus:ring-amber-500"
                />
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                {selectedEvent && (
                  <button
                    onClick={() => handleDeleteEvent(selectedEvent.id)}
                    className="px-4 py-2 text-red-600 hover:text-red-700"
                  >
                    Delete
                  </button>
                )}
                <button
                  onClick={handleSaveEvent}
                  className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700"
                >
                  {selectedEvent ? 'Update' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 