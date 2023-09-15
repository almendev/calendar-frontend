import {
  calendarSlice,
  onAddNewEvent,
  onDeleteEvent,
  onLoadEvents,
  onLogoutCalendar,
  onSetActiveEvent,
} from '../../../src/store/calendar/calendarSlice';
import {
  calendarWithActiveEventState,
  calendarWithEventsState,
  events,
  initialState,
} from '../../fixtures/calendarStates';

describe('Pruebas en calendarSlice', () => {
  test('debe retornar el estado por defecto', () => {
    const state = calendarSlice.getInitialState();

    expect(state).toEqual(initialState);
  });

  test('onSetActiveEvent debe activar el evento', () => {
    const state = calendarSlice.reducer(
      calendarWithEventsState,
      onSetActiveEvent(events[0])
    );

    expect(state.activeEvent).toEqual(events[0]);
  });

  test('onAddNewEvent debe agregar un nuevo evento', () => {
    const newEvent = {
      id: '3',
      title: 'New event',
      start: new Date('2022-08-21 13:00:00'),
      end: new Date('2022-08-21 15:00:00'),
      notes: 'New note',
    };
    const state = calendarSlice.reducer(
      calendarWithEventsState,
      onAddNewEvent(newEvent)
    );

    expect(state.events).toEqual([...events, newEvent]);
  });

  test('onUpdateEvent debe actualizar un evento', () => {
    const updatedEvent = {
      id: '1',
      title: 'Event updated',
      start: new Date('2022-08-21 13:00:00'),
      end: new Date('2022-08-21 15:00:00'),
      notes: 'New note updated',
    };
    const state = calendarSlice.reducer(
      calendarWithEventsState,
      onAddNewEvent(updatedEvent)
    );

    expect(state.events).toContain(updatedEvent);
  });

  test('onDeletedEvent debe de borrar el evento activo', () => {
    const state = calendarSlice.reducer(
      calendarWithActiveEventState,
      onDeleteEvent()
    );

    expect(state.activeEvent).toBeNull();
    expect(state.events).not.toContain(
      calendarWithActiveEventState.activeEvent
    );
  });

  test('onLoadEvents debe de establecer los eventos', () => {
    const state = calendarSlice.reducer(initialState, onLoadEvents(events));
    expect(state.isLoadingEvents).toBeFalsy();
    expect(state.events).toEqual(events);

    const newState = calendarSlice.reducer(state, onLoadEvents(events));
    expect(newState.events).toHaveLength(2);
  });

  test('onLogoutCalendar debe de limpiar el estado', () => {
    const state = calendarSlice.reducer(
      calendarWithActiveEventState,
      onLogoutCalendar()
    );

    expect(state).toEqual(initialState);
  });
});
