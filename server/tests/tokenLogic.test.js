const {
  validateStatusTransition,
  VALID_TRANSITIONS
} = require('../services/tokenService');

describe('Token State Machine & Transition Rules', () => {
  test('should allow legal transition from BOOKED to WAITING', () => {
    expect(() => validateStatusTransition('BOOKED', 'WAITING')).not.toThrow();
  });

  test('should allow legal transition from WAITING to CALLED', () => {
    expect(() => validateStatusTransition('WAITING', 'CALLED')).not.toThrow();
  });

  test('should allow legal transition from CALLED to IN_CONSULTATION', () => {
    expect(() => validateStatusTransition('CALLED', 'IN_CONSULTATION')).not.toThrow();
  });

  test('should allow legal transition from IN_CONSULTATION to COMPLETED', () => {
    expect(() => validateStatusTransition('IN_CONSULTATION', 'COMPLETED')).not.toThrow();
  });

  test('should allow skipping a waiting or called patient', () => {
    expect(() => validateStatusTransition('WAITING', 'SKIPPED')).not.toThrow();
    expect(() => validateStatusTransition('CALLED', 'SKIPPED')).not.toThrow();
  });

  test('should allow recalling a skipped patient to CALLED or WAITING', () => {
    expect(() => validateStatusTransition('SKIPPED', 'CALLED')).not.toThrow();
    expect(() => validateStatusTransition('SKIPPED', 'WAITING')).not.toThrow();
  });

  test('should block calling a completed token again (terminal state)', () => {
    expect(() => validateStatusTransition('COMPLETED', 'CALLED')).toThrow(
      /Invalid token status transition/
    );
  });

  test('should block calling a cancelled token again (terminal state)', () => {
    expect(() => validateStatusTransition('CANCELLED', 'WAITING')).toThrow(
      /Invalid token status transition/
    );
  });

  test('should block illegal jump from WAITING directly to COMPLETED without consultation', () => {
    expect(() => validateStatusTransition('WAITING', 'COMPLETED')).toThrow(
      /Invalid token status transition/
    );
  });

  test('should verify all statuses have defined valid transition arrays', () => {
    const requiredStatuses = [
      'BOOKED',
      'WAITING',
      'CALLED',
      'IN_CONSULTATION',
      'COMPLETED',
      'SKIPPED',
      'CANCELLED',
      'NO_SHOW'
    ];

    requiredStatuses.forEach((status) => {
      expect(Array.isArray(VALID_TRANSITIONS[status])).toBe(true);
    });
  });
});
