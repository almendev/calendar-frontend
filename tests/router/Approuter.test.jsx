import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAuthStore } from '../../src/hooks/useAuthStore';
import { AppRouter } from '../../src/router';
import { CalendarPage } from '../../src/calendar/pages/CalendarPage';

jest.mock('../../src/hooks/useAuthStore');
jest.mock('../../src/calendar/pages/CalendarPage', () => ({
  CalendarPage: () => <h1>CalendarPage</h1>,
}));

describe('Pruebas en <AppRouter/>', () => {
  const mockCheckAuthToken = jest.fn();

  beforeEach(() => jest.clearAllMocks());
  test('debe de mostrar la pantalla de carga y llamar checkAuthToken', () => {
    useAuthStore.mockReturnValue({
      status: 'checking',
      checkAuthToken: mockCheckAuthToken,
    });

    render(<AppRouter />);
    expect(screen.getByText('Cargando...')).toBeTruthy();
    expect(mockCheckAuthToken).toHaveBeenCalled();
  });

  test('debe mostrar el <loginPage/> en caso de no estar autenticado', () => {
    useAuthStore.mockReturnValue({
      status: 'not-authenticated',
      checkAuthToken: mockCheckAuthToken,
    });

    const { container } = render(
      <MemoryRouter initialEntries={['/cualquierruta']}>
        <AppRouter />)
      </MemoryRouter>
    );

    expect(screen.getByText('Ingreso')).toBeTruthy();
    expect(container).toMatchSnapshot();
  });

  test('debe mostrar el <CalendarPage/> si esta autenticado', () => {
    useAuthStore.mockReturnValue({
      status: 'authenticated',
      checkAuthToken: mockCheckAuthToken,
    });

    render(
      <MemoryRouter>
        <AppRouter />)
      </MemoryRouter>
    );

    expect(screen.getByText('CalendarPage')).toBeTruthy();
  });
});
