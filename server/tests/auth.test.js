const bcrypt = require('bcryptjs');
const { generateToken, verifyToken } = require('../utils/jwt');
const { authorize } = require('../middleware/roleMiddleware');

describe('Authentication & Security Logic', () => {
  test('should securely hash and verify passwords using bcrypt', async () => {
    const rawPassword = 'SecureDoctorPass@2026';
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(rawPassword, salt);

    expect(hash).not.toBe(rawPassword);
    const match = await bcrypt.compare(rawPassword, hash);
    expect(match).toBe(true);

    const wrongMatch = await bcrypt.compare('WrongPassword', hash);
    expect(wrongMatch).toBe(false);
  });

  test('should issue and verify valid JSON Web Tokens', () => {
    const payload = { id: 'user_12345', role: 'doctor' };
    const token = generateToken(payload);

    expect(typeof token).toBe('string');
    const decoded = verifyToken(token);
    expect(decoded.id).toBe('user_12345');
    expect(decoded.role).toBe('doctor');
  });

  test('roleMiddleware authorize should permit allowed roles and reject unauthorized roles', () => {
    const middleware = authorize('admin', 'receptionist');

    const nextMock = jest.fn();
    const resMock = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    // Case 1: Authorized role
    const reqAuthorized = { user: { role: 'admin' } };
    middleware(reqAuthorized, resMock, nextMock);
    expect(nextMock).toHaveBeenCalled();

    // Case 2: Unauthorized role
    nextMock.mockClear();
    const reqUnauthorized = { user: { role: 'patient' } };
    middleware(reqUnauthorized, resMock, nextMock);
    expect(resMock.status).toHaveBeenCalledWith(403);
    expect(nextMock).not.toHaveBeenCalled();
  });
});
