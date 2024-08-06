import nock from 'nock';
import { URLSearchParams } from 'url';

import { CommandError } from '../../../utils/errors';
import { fetch } from '../../../utils/fetch';
import { getExpoApiBaseUrl } from '../../endpoint';
import UserSettings from '../../user/UserSettings';
import { ApiV2Error, fetchAsync } from '../client';

jest.mock('../../user/UserSettings');
jest.mock('../../../utils/fetch', () => ({
  fetch: jest.fn(jest.requireActual('../../../utils/fetch').fetch),
}));

it('converts Expo APIv2 error to ApiV2Error', async () => {
  nock(getExpoApiBaseUrl())
    .post('/v2/test')
    .reply(400, {
      errors: [
        {
          message: 'hellomessage',
          code: 'TEST_CODE',
          stack: 'line 1: hello',
          details: { who: 'world' },
          metadata: { an: 'object' },
        },
      ],
    });

  expect.assertions(6);

  try {
    await fetchAsync('test', { method: 'POST' });
  } catch (error: any) {
    expect(error).toBeInstanceOf(ApiV2Error);
    expect(error.message).toEqual('hellomessage');
    expect(error.expoApiV2ErrorCode).toEqual('TEST_CODE');
    expect(error.expoApiV2ErrorDetails).toEqual({ who: 'world' });
    expect(error.expoApiV2ErrorMetadata).toEqual({ an: 'object' });
    expect(error.expoApiV2ErrorServerStack).toEqual('line 1: hello');
  }
});

it('converts Expo APIv2 error to ApiV2Error (invalid password)', async () => {
  nock(getExpoApiBaseUrl())
    .post('/v2/test')
    .reply(401, {
      errors: [
        {
          code: 'AUTHENTICATION_ERROR',
          message: 'Your username, email, or password was incorrect.',
          isTransient: false,
        },
      ],
    });

  expect.assertions(3);

  try {
    await fetchAsync('test', { method: 'POST' });
  } catch (error: any) {
    expect(error).toBeInstanceOf(ApiV2Error);
    expect(error.message).toEqual('Your username, email, or password was incorrect.');
    expect(error.expoApiV2ErrorCode).toEqual('AUTHENTICATION_ERROR');
  }
});

it('converts system ENOTFOUND non-APIv2 error to CommandError', async () => {
  const networkError = new Error('fetch failed - network unavailable');
  // @ts-expect-error
  networkError.code = 'ENOTFOUND';

  jest.mocked(fetch).mockRejectedValueOnce(networkError);
  expect.assertions(1);

  try {
    console.log(await fetchAsync('test', { method: 'POST' }));
  } catch (error: any) {
    expect(error).toBeInstanceOf(CommandError);
  }
});

it('does not convert non-APIv2 error to ApiV2Error', async () => {
  const scope = nock(getExpoApiBaseUrl()).post('/v2/test').reply(500, 'Something went wrong');

  // Only expect the `scope.isDone` assertion
  expect.assertions(1);

  try {
    await fetchAsync('test', { method: 'POST' });
  } catch (error: any) {
    // These should never trigger
    expect(error).toBeInstanceOf(Response);
    expect(error).not.toBeInstanceOf(ApiV2Error);
  }
  expect(scope.isDone()).toBe(true);
});

it('makes a get request', async () => {
  nock(getExpoApiBaseUrl()).get('/v2/get-me?foo=bar').reply(200, 'Hello World');

  const res = await fetchAsync('get-me', {
    method: 'GET',
    // Ensure our custom support for URLSearchParams works...
    searchParams: new URLSearchParams({
      foo: 'bar',
    }),
  });

  expect(res).toMatchObject({ status: 200 });
  expect(await res.text()).toEqual('Hello World');
});

// This test ensures that absolute URLs are allowed with the abstraction.
it('makes a request using an absolute URL', async () => {
  nock('http://example').get('/get-me?foo=bar').reply(200, 'Hello World');

  const res = await fetchAsync('http://example/get-me', {
    searchParams: new URLSearchParams({
      foo: 'bar',
    }),
  });

  expect(res).toMatchObject({ status: 200 });
  expect(await res.text()).toEqual('Hello World');
});

it('makes an authenticated request with access token', async () => {
  jest.mocked(UserSettings.getAccessToken).mockClear().mockReturnValue('my-access-token');

  nock(getExpoApiBaseUrl())
    .matchHeader('authorization', 'Bearer my-access-token')
    .get('/v2/get-me')
    .reply(200, 'Hello World');

  expect(await fetchAsync('get-me', { method: 'GET' })).toMatchObject({ status: 200 });
});

it('makes an authenticated request with session secret', async () => {
  jest.mocked(UserSettings.getSession).mockClear().mockReturnValue({
    sessionSecret: 'my-secret-token',
    userId: '',
    username: '',
    currentConnection: 'Username-Password-Authentication',
  });
  jest.mocked(UserSettings.getAccessToken).mockReturnValue(null);

  nock(getExpoApiBaseUrl())
    .matchHeader('expo-session', 'my-secret-token')
    .get('/v2/get-me')
    .reply(200, 'Hello World');

  expect(await fetchAsync('get-me', { method: 'GET' })).toMatchObject({ status: 200 });
});

it('only uses access token when both authentication methods are available', async () => {
  jest.mocked(UserSettings.getAccessToken).mockClear().mockReturnValue('my-access-token');
  jest.mocked(UserSettings.getSession).mockClear().mockReturnValue({
    sessionSecret: 'my-secret-token',
    userId: '',
    username: '',
    currentConnection: 'Username-Password-Authentication',
  });

  nock(getExpoApiBaseUrl())
    .matchHeader('authorization', 'Bearer my-access-token')
    .matchHeader('expo-session', (val) => !val)
    .get('/v2/get-me')
    .reply(200, 'Hello World');

  expect(await fetchAsync('get-me', { method: 'GET' })).toMatchObject({ status: 200 });
});
