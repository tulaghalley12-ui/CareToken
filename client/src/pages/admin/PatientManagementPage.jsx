import React, { useState, useEffect } from 'react';
import { Users, Search, RefreshCw, Eye } from 'lucide-react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Modal from '../../components/common/Modal';
import { patientService } from '../../services/patientService';

const PatientManagementPage = () => {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientHistory, setPatientHistory] = useState({ appointments: [], tokens: [] });
  const [historyLoading, setHistoryLoading] = useState(false);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const res = await patientService.getPatients(search);
      if (res.success) setPatients(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPatients();
  };

  const handleViewPatient = async (p) => {
    setSelectedPatient(p);
    setHistoryLoading(true);
    try {
      const [apptRes, tokRes] = await Promise.all([
        patientService.getPatientAppointments(p._id),
        patientService.getPatientTokens(p._id)
      ]);
      setPatientHistory({
        appointments: apptRes.success ? apptRes.data : [],
        tokens: tokRes.success ? tokRes.data : []
      });
    } catch (err) {
      console.error(err);
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Patient Records & Directory</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Comprehensive directory of registered and walk-in hospital patients
          </p>
        </div>

        <Button size="sm" variant="secondary" icon={RefreshCw} onClick={fetchPatients}>
          Refresh
        </Button>
      </div>

      <Card style={{ marginBottom: '20px', padding: '16px 20px' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '10px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search by patient name, phone, email, or PAT number..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <Button type="submit" variant="primary" icon={Search}>
            Search
          </Button>
        </form>
      </Card>

      {loading ? (
        <LoadingSpinner text="Loading patient database..." />
      ) : (
        <Card title={`Patients on Record (${patients.length})`}>
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Patient #</th>
                  <th>Full Name</th>
                  <th>Phone Number</th>
                  <th>Email</th>
                  <th>Blood Group</th>
                  <th>Gender</th>
                  <th>Registered Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => (
                  <tr key={p._id}>
                    <td style={{ fontWeight: 800, color: 'var(--primary)' }}>{p.patientNumber}</td>
                    <td><strong>{p.userId?.fullName || 'Walk-in'}</strong></td>
                    <td>{p.userId?.phone || '--'}</td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {p.userId?.email || '--'}
                    </td>
                    <td>{p.bloodGroup || 'Unknown'}</td>
                    <td style={{ textTransform: 'capitalize' }}>{p.gender || 'Unknown'}</td>
                    <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <Button
                        size="sm"
                        variant="secondary"
                        icon={Eye}
                        onClick={() => handleViewPatient(p)}
                      >
                        History
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Patient Detail Modal */}
      <Modal
        isOpen={!!selectedPatient}
        onClose={() => setSelectedPatient(null)}
        title={`Patient Record: ${selectedPatient?.patientNumber}`}
        maxWidth={700}
      >
        {selectedPatient && (
          <div>
            <div style={{ marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid var(--border)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>
                {selectedPatient.userId?.fullName}
              </h3>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                Phone: {selectedPatient.userId?.phone} &bull; Email: {selectedPatient.userId?.email}
              </p>
            </div>

            {historyLoading ? (
              <LoadingSpinner text="Loading clinical history..." />
            ) : (
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px' }}>
                  Appointments ({patientHistory.appointments.length})
                </h4>
                <div className="table-container" style={{ marginBottom: '20px' }}>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Date & Time</th>
                        <th>Department</th>
                        <th>Doctor</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patientHistory.appointments.map((a) => (
                        <tr key={a._id}>
                          <td>{a.appointmentDate} at {a.appointmentTime}</td>
                          <td>{a.departmentId?.name}</td>
                          <td>{a.doctorId?.userId?.fullName}</td>
                          <td>{a.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '8px' }}>
                  Tokens Generated ({patientHistory.tokens.length})
                </h4>
                <div className="table-container">
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Token #</th>
                        <th>Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patientHistory.tokens.map((t) => (
                        <tr key={t._id}>
                          <td style={{ fontWeight: 800 }}>{t.tokenNumber}</td>
                          <td>{t.serviceDate}</td>
                          <td>{t.queueStatus}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PatientManagementPage;
