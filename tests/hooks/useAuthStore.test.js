import { act, renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { useAuthStore } from '../../src/hooks/useAuthStore';
import { authSlice } from '../../src/store';
import { initialState, notAuthenticatedState } from '../fixtures/authStates';
import { testUserCredentials } from '../fixtures/testUser';
import { calendarApi } from '../../src/api';

const getMockStore = (initialState) => {
  return configureStore({
    reducer: {
      auth: authSlice.reducer,
    },
    preloadedState: {
      auth: { ...initialState },
    },
  });
};

describe('Pruebas en useAuthStore', () => {
  beforeEach(() => localStorage.clear());

  test('debe regresar los valores por defecto', () => {
    const mockStore = getMockStore({ ...initialState });

    const { result } = renderHook(() => useAuthStore(), {
      wrapper: ({ children }) => (
        <Provider store={mockStore}>{children}</Provider>
      ),
    });

    expect(result.current).toEqual({
      status: 'checking',
      user: {},
      errorMessage: undefined,
      checkAuthToken: expect.any(Function),
      startLogin: expect.any(Function),
      startLogout: expect.any(Function),
      startRegister: expect.any(Function),
    });
  });

  test('startLogin debe realizar el login correctamente', async () => {
    const mockStore = getMockStore({ ...notAuthenticatedState });
    const { result } = renderHook(() => useAuthStore(), {
      wrapper: ({ children }) => (
        <Provider store={mockStore}>{children}</Provider>
      ),
    });

    await act(async () => {
      await result.current.startLogin(testUserCredentials);
    });

    const { status, user, errorMessage } = result.current;
    expect({ status, user, errorMessage }).toEqual({
      status: 'authenticated',
      user: {
        name: 'Test User',
        uid: '64f1e592d75e6da86cc9df8f',
      },
      errorMessage: undefined,
    });
    expect(localStorage.getItem('token')).toEqual(expect.any(String));
    expect(localStorage.getItem('token-init-date')).toEqual(expect.any(String));
  });

  test('startLogin debe de fallar la autenticacion', async () => {
    const mockStore = getMockStore({ ...notAuthenticatedState });
    const { result } = renderHook(() => useAuthStore(), {
      wrapper: ({ children }) => (
        <Provider store={mockStore}>{children}</Provider>
      ),
    });

    await act(async () => {
      await result.current.startLogin({
        email: 'wrong@google.com',
        password: '123456789',
      });
    });

    const { status, user, errorMessage } = result.current;
    expect({ status, user, errorMessage }).toEqual({
      status: 'not-authenticated',
      user: {},
      errorMessage: 'Credenciales incorrectas',
    });
    expect(localStorage.getItem('token')).toBeNull();

    await waitFor(() => expect(result.current.errorMessage).toBe(undefined));
  });

  test('startRegister debe crear un usuario', async () => {
    const newUser = {
      email: 'some@google.com',
      password: '123456789',
      name: 'Test User2',
    };
    const mockStore = getMockStore({ ...notAuthenticatedState });
    const { result } = renderHook(() => useAuthStore(), {
      wrapper: ({ children }) => (
        <Provider store={mockStore}>{children}</Provider>
      ),
    });

    const spy = jest.spyOn(calendarApi, 'post').mockReturnValue({
      data: {
        ok: true,
        uid: '123456789',
        name: 'Test User2',
        token: 'ANY-TOKEN',
      },
    });

    await act(async () => {
      await result.current.startRegister(newUser);
    });

    const { status, user, errorMessage } = result.current;
    expect({ status, user, errorMessage }).toEqual({
      status: 'authenticated',
      user: { name: 'Test User2', uid: '123456789' },
      errorMessage: undefined,
    });

    spy.mockRestore();
  });

  test('startRegister debe de fallar la creacion', async () => {
    const mockStore = getMockStore({ ...notAuthenticatedState });
    const { result } = renderHook(() => useAuthStore(), {
      wrapper: ({ children }) => (
        <Provider store={mockStore}>{children}</Provider>
      ),
    });

    await act(async () => {
      await result.current.startRegister(testUserCredentials);
    });

    const { status, user, errorMessage } = result.current;
    expect({ status, user, errorMessage }).toEqual({
      status: 'not-authenticated',
      user: {},
      errorMessage: 'Un usuario ya existe con ese correo',
    });
  });

  test('chechAuthToken debe de fallar si no hay token', async () => {
    const mockStore = getMockStore({ ...initialState });
    const { result } = renderHook(() => useAuthStore(), {
      wrapper: ({ children }) => (
        <Provider store={mockStore}>{children}</Provider>
      ),
    });

    await act(async () => {
      await result.current.checkAuthToken();
    });

    const { status, user, errorMessage } = result.current;
    expect({ status, user, errorMessage }).toEqual({
      status: 'not-authenticated',
      user: {},
      errorMessage: undefined,
    });
  });

  test('chechAuthToken debe de autenticar el usuario si hay token', async () => {
    const { data } = await calendarApi.post('/auth', testUserCredentials);
    localStorage.setItem('token', data.token);

    const mockStore = getMockStore({ ...initialState });
    const { result } = renderHook(() => useAuthStore(), {
      wrapper: ({ children }) => (
        <Provider store={mockStore}>{children}</Provider>
      ),
    });

    await act(async () => {
      await result.current.checkAuthToken();
    });

    const { status, user, errorMessage } = result.current;
    expect({ status, user, errorMessage }).toEqual({
      status: 'authenticated',
      user: { name: 'Test User', uid: '64f1e592d75e6da86cc9df8f' },
      errorMessage: undefined,
    });
  });
});
