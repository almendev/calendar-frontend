export const events = [
  {
    id: '1',
    title: 'Cumpleaños de Fernando',
    start: new Date('2022-10-21 13:00:00'),
    end: new Date('2022-10-21 15:00:00'),
    notes: 'Comprar el pastel',
  },
  {
    id: '2',
    title: 'Cumpleaños de Melissa',
    start: new Date('2022-03-07 13:00:00'),
    end: new Date('2022-03-07 15:00:00'),
    notes: 'Comprar el pastel',
  },
];

export const initialState = {
  isLoadingEvents: true,
  events: [],
  activeEvent: null,
};

export const calendarWithEventsState = {
  isLoadingEvents: false,
  events: [...events],
  activeEvent: null,
};

export const calendarWithActiveEventState = {
  isLoadingEvents: false,
  events: [...events],
  activeEvent: { ...events[0] },
};
