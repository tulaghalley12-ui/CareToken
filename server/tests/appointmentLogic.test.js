describe('Appointment & Slot Generation Logic', () => {
  // Pure helper replication of slot calculation for direct deterministic testing
  const generateSlots = (startTime, endTime, durationMinutes, breakPeriods = []) => {
    const slots = [];
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);

    let currentMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;

    while (currentMinutes + durationMinutes <= endMinutes) {
      const slotH = Math.floor(currentMinutes / 60);
      const slotM = currentMinutes % 60;
      const timeString = `${String(slotH).padStart(2, '0')}:${String(slotM).padStart(2, '0')}`;

      const inBreak = breakPeriods.some((b) => {
        const [bStartH, bStartM] = b.start.split(':').map(Number);
        const [bEndH, bEndM] = b.end.split(':').map(Number);
        const bStartMin = bStartH * 60 + bStartM;
        const bEndMin = bEndH * 60 + bEndM;
        return currentMinutes >= bStartMin && currentMinutes < bEndMin;
      });

      if (!inBreak) {
        slots.push(timeString);
      }

      currentMinutes += durationMinutes;
    }

    return slots;
  };

  test('should correctly generate 15-minute appointment slots from 09:00 to 12:00', () => {
    const slots = generateSlots('09:00', '12:00', 15);
    expect(slots.length).toBe(12); // 3 hours * 4 slots/hour = 12
    expect(slots[0]).toBe('09:00');
    expect(slots[1]).toBe('09:15');
    expect(slots[slots.length - 1]).toBe('11:45');
  });

  test('should exclude lunch break intervals from available slots', () => {
    const breaks = [{ start: '13:00', end: '14:00' }];
    const slots = generateSlots('12:00', '15:00', 30, breaks);

    // 12:00, 12:30, [13:00 - 14:00 excluded], 14:00, 14:30
    expect(slots).toEqual(['12:00', '12:30', '14:00', '14:30']);
    expect(slots.includes('13:00')).toBe(false);
    expect(slots.includes('13:30')).toBe(false);
  });

  test('should format token numbers with department code and 3-digit padded sequence', () => {
    const formatToken = (deptCode, seq) => `${deptCode.toUpperCase()}-${String(seq).padStart(3, '0')}`;
    expect(formatToken('CARD', 1)).toBe('CARD-001');
    expect(formatToken('CARD', 25)).toBe('CARD-025');
    expect(formatToken('PEDI', 104)).toBe('PEDI-104');
  });

  test('should calculate dynamic wait time estimate correctly', () => {
    const calculateEstimatedWait = (waitingAhead, avgDuration, hasActiveConsultation) => {
      const buffer = hasActiveConsultation ? Math.round(avgDuration / 2) : 0;
      return waitingAhead * avgDuration + buffer;
    };

    // 3 patients ahead, 15 min duration, 1 currently consulting
    const wait = calculateEstimatedWait(3, 15, true);
    // 3 * 15 + 8 = 53 minutes
    expect(wait).toBe(53);

    // 0 patients ahead, doctor free
    const waitZero = calculateEstimatedWait(0, 15, false);
    expect(waitZero).toBe(0);
  });
});
