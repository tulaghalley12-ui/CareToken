import React, { useState, useEffect } from 'react';
import { Clock, Save, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Alert from '../../components/common/Alert';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { doctorService } from '../../services/doctorService';

const DoctorSchedulePage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Default weekly matrix
  const [schedules, setSchedules] = useState(
    days.map((day, idx) => ({
      dayOfWeek: idx,
      startTime: '09:00',
      endTime: '17:00',
      slotDurationMinutes: user?.doctor?.consultationDurationMinutes || 15,
      maximumAppointments: 25,
      isActive: idx >= 1 && idx <= 5 // Mon to Fri active by default
    }))
  );

  useEffect(() => {
    const fetchSchedule = async () => {
      if (!user?.doctor?._id) return;
      try {
        const res = await doctorService.getDoctorSchedule(user.doctor._id);
        if (res.success && res.data.length > 0) {
          const map = {};
          res.data.forEach((s) => {
            map[s.dayOfWeek] = s;
          });
          setSchedules(
            days.map((day, idx) => {
              if (map[idx]) {
                return {
                  dayOfWeek: idx,
                  startTime: map[idx].startTime,
                  endTime: map[idx].endTime,
                  slotDurationMinutes: map[idx].slotDurationMinutes,
                  maximumAppointments: map[idx].maximumAppointments,
                  isActive: map[idx].isActive
                };
              }
              return {
                dayOfWeek: idx,
                startTime: '09:00',
                endTime: '17:00',
                slotDurationMinutes: user?.doctor?.consultationDurationMinutes || 15,
                maximumAppointments: 25,
                isActive: false
              };
            })
          );
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSchedule();
  }, [user?.doctor?._id]);

  const handleFieldChange = (dayIdx, field, value) => {
    setSchedules((prev) =>
      prev.map((item) => (item.dayOfWeek === dayIdx ? { ...item, [field]: value } : item))
    );
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!user?.doctor?._id) return;
    setSaving(true);
    setFeedback(null);
    try {
      const res = await doctorService.updateDoctorSchedule(user.doctor._id, schedules);
      if (res.success) {
        setFeedback({ type: 'success', message: 'Doctor working schedule updated successfully!' });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.response?.data?.message || 'Failed to save schedule.' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading working schedule..." />;

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Weekly Consultation Schedule</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Configure your active practice days, clinic hours, and slot intervals
        </p>
      </div>

      {feedback && <Alert type={feedback.type} message={feedback.message} />}

      <Card>
        <form onSubmit={handleSave}>
          <div className="table-container" style={{ marginBottom: '20px' }}>
            <table className="table">
              <thead>
                <tr>
                  <th>Active</th>
                  <th>Day of Week</th>
                  <th>Start Time</th>
                  <th>End Time</th>
                  <th>Slot Duration</th>
                  <th>Max Patients</th>
                </tr>
              </thead>
              <tbody>
                {schedules.map((s) => (
                  <tr key={s.dayOfWeek} style={{ opacity: s.isActive ? 1 : 0.6 }}>
                    <td>
                      <input
                        type="checkbox"
                        checked={s.isActive}
                        onChange={(e) =>
                          handleFieldChange(s.dayOfWeek, 'isActive', e.target.checked)
                        }
                        style={{ width: '18px', height: '18px', cursor: 'pointer' }}
                      />
                    </td>
                    <td style={{ fontWeight: 700 }}>{days[s.dayOfWeek]}</td>
                    <td>
                      <input
                        type="time"
                        className="form-input"
                        value={s.startTime}
                        disabled={!s.isActive}
                        onChange={(e) =>
                          handleFieldChange(s.dayOfWeek, 'startTime', e.target.value)
                        }
                        style={{ padding: '6px 10px', width: '130px' }}
                      />
                    </td>
                    <td>
                      <input
                        type="time"
                        className="form-input"
                        value={s.endTime}
                        disabled={!s.isActive}
                        onChange={(e) =>
                          handleFieldChange(s.dayOfWeek, 'endTime', e.target.value)
                        }
                        style={{ padding: '6px 10px', width: '130px' }}
                      />
                    </td>
                    <td>
                      <select
                        className="form-select"
                        value={s.slotDurationMinutes}
                        disabled={!s.isActive}
                        onChange={(e) =>
                          handleFieldChange(s.dayOfWeek, 'slotDurationMinutes', Number(e.target.value))
                        }
                        style={{ padding: '6px 10px', width: '110px' }}
                      >
                        <option value={10}>10 mins</option>
                        <option value={15}>15 mins</option>
                        <option value={20}>20 mins</option>
                        <option value={30}>30 mins</option>
                        <option value={45}>45 mins</option>
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-input"
                        value={s.maximumAppointments}
                        disabled={!s.isActive}
                        onChange={(e) =>
                          handleFieldChange(s.dayOfWeek, 'maximumAppointments', Number(e.target.value))
                        }
                        style={{ padding: '6px 10px', width: '90px' }}
                        min={1}
                        max={100}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" variant="primary" icon={Save} loading={saving}>
              Save Weekly Schedule
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default DoctorSchedulePage;
