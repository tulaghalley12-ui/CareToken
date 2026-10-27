const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Department = require('../models/Department');
const Appointment = require('../models/Appointment');
const Token = require('../models/Token');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const { calculateQueuePosition } = require('../services/tokenService');

/**
 * Admin Dashboard Statistics
 */
const getAdminDashboard = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const [
      totalPatients,
      totalDoctors,
      totalAppointmentsToday,
      totalTokensToday,
      waitingTokensCount,
      consultingTokensCount,
      completedTokensToday,
      departments,
      recentActivity
    ] = await Promise.all([
      Patient.countDocuments(),
      Doctor.countDocuments(),
      Appointment.countDocuments({ appointmentDate: today }),
      Token.countDocuments({ serviceDate: today }),
      Token.countDocuments({ serviceDate: today, queueStatus: 'WAITING' }),
      Token.countDocuments({ serviceDate: today, queueStatus: 'IN_CONSULTATION' }),
      Token.countDocuments({ serviceDate: today, queueStatus: 'COMPLETED' }),
      Department.find({ isActive: true }).select('name departmentCode dailyTokenLimit'),
      ActivityLog.find().sort({ timestamp: -1 }).limit(10)
    ]);

    // Compute department-wise queue statistics
    const departmentStats = await Promise.all(
      departments.map(async (dept) => {
        const [waiting, consulting, completed, total] = await Promise.all([
          Token.countDocuments({
            departmentId: dept._id,
            serviceDate: today,
            queueStatus: 'WAITING'
          }),
          Token.countDocuments({
            departmentId: dept._id,
            serviceDate: today,
            queueStatus: 'IN_CONSULTATION'
          }),
          Token.countDocuments({
            departmentId: dept._id,
            serviceDate: today,
            queueStatus: 'COMPLETED'
          }),
          Token.countDocuments({
            departmentId: dept._id,
            serviceDate: today
          })
        ]);

        return {
          _id: dept._id,
          name: dept.name,
          code: dept.departmentCode,
          limit: dept.dailyTokenLimit,
          total,
          waiting,
          consulting,
          completed
        };
      })
    );

    res.json({
      success: true,
      data: {
        date: today,
        summary: {
          totalPatients,
          totalDoctors,
          totalAppointmentsToday,
          totalTokensToday,
          waitingTokensCount,
          consultingTokensCount,
          completedTokensToday
        },
        departmentStats,
        recentActivity
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Doctor Dashboard Statistics & Current Queue
 */
const getDoctorDashboard = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // Find doctor record for current user
    const doctor = await Doctor.findOne({ userId: req.user._id })
      .populate('departmentId', 'name departmentCode')
      .populate('userId', 'fullName email phone');

    if (!doctor) {
      return res.status(404).json({
        success: false,
        message: 'Doctor profile not found for this account'
      });
    }

    const [
      todayAppointmentsCount,
      waitingTokens,
      currentlyCalled,
      currentConsultation,
      completedTodayCount
    ] = await Promise.all([
      Appointment.countDocuments({ doctorId: doctor._id, appointmentDate: today }),
      Token.find({
        doctorId: doctor._id,
        serviceDate: today,
        queueStatus: 'WAITING'
      })
        .sort({ tokenSequence: 1 })
        .populate({
          path: 'patientId',
          populate: { path: 'userId', select: 'fullName phone' }
        }),
      Token.findOne({
        doctorId: doctor._id,
        serviceDate: today,
        queueStatus: 'CALLED'
      }).populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'fullName phone' }
      }),
      Token.findOne({
        doctorId: doctor._id,
        serviceDate: today,
        queueStatus: 'IN_CONSULTATION'
      }).populate({
        path: 'patientId',
        populate: { path: 'userId', select: 'fullName phone' }
      }),
      Token.countDocuments({
        doctorId: doctor._id,
        serviceDate: today,
        queueStatus: 'COMPLETED'
      })
    ]);

    // Next eligible token
    const nextEligible = waitingTokens.length > 0 ? waitingTokens[0] : null;

    res.json({
      success: true,
      data: {
        doctor: {
          _id: doctor._id,
          name: doctor.userId.fullName,
          specialization: doctor.specialization,
          department: doctor.departmentId?.name,
          roomNumber: doctor.roomNumber,
          isAvailable: doctor.isAvailable
        },
        metrics: {
          todayAppointmentsCount,
          waitingCount: waitingTokens.length,
          completedCount: completedTodayCount,
          activeCount: waitingTokens.length + (currentConsultation ? 1 : 0) + (currentlyCalled ? 1 : 0)
        },
        currentConsultation,
        currentlyCalled,
        nextEligible,
        waitingQueue: waitingTokens
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Receptionist Dashboard Statistics
 */
const getReceptionistDashboard = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const todayStart = new Date(`${today}T00:00:00.000Z`);

    const [
      registrationsToday,
      activeTokensToday,
      patientsWaiting,
      patientsConsulting,
      completedToday,
      recentTokens,
      departments
    ] = await Promise.all([
      Patient.countDocuments({ createdAt: { $gte: todayStart } }),
      Token.countDocuments({
        serviceDate: today,
        queueStatus: { $in: ['WAITING', 'CALLED', 'IN_CONSULTATION', 'SKIPPED'] }
      }),
      Token.countDocuments({ serviceDate: today, queueStatus: 'WAITING' }),
      Token.countDocuments({ serviceDate: today, queueStatus: 'IN_CONSULTATION' }),
      Token.countDocuments({ serviceDate: today, queueStatus: 'COMPLETED' }),
      Token.find({ serviceDate: today })
        .sort({ createdAt: -1 })
        .limit(10)
        .populate({
          path: 'patientId',
          populate: { path: 'userId', select: 'fullName phone' }
        })
        .populate({
          path: 'doctorId',
          populate: { path: 'userId', select: 'fullName' }
        })
        .populate('departmentId', 'name departmentCode'),
      Department.find({ isActive: true })
    ]);

    res.json({
      success: true,
      data: {
        date: today,
        metrics: {
          registrationsToday,
          activeTokensToday,
          patientsWaiting,
          patientsConsulting,
          completedToday
        },
        recentTokens,
        departments
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Patient Dashboard Summary
 */
const getPatientDashboard = async (req, res, next) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const patient = await Patient.findOne({ userId: req.user._id });
    if (!patient) {
      return res.status(404).json({
        success: false,
        message: 'Patient profile not found'
      });
    }

    // Find active token for today or most recent active token
    const activeToken = await Token.findOne({
      patientId: patient._id,
      queueStatus: { $in: ['WAITING', 'CALLED', 'IN_CONSULTATION', 'SKIPPED'] }
    })
      .sort({ createdAt: -1 })
      .populate('departmentId', 'name departmentCode')
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'fullName' }
      })
      .populate('appointmentId');

    let positionInfo = null;
    if (activeToken) {
      positionInfo = await calculateQueuePosition(activeToken._id);
    }

    // Next upcoming appointment
    const upcomingAppointment = await Appointment.findOne({
      patientId: patient._id,
      appointmentDate: { $gte: today },
      status: { $in: ['BOOKED', 'CONFIRMED'] }
    })
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .populate({
        path: 'doctorId',
        populate: { path: 'userId', select: 'fullName' }
      })
      .populate('departmentId', 'name departmentCode')
      .populate('tokenId');

    // Recent notifications
    const recentNotifications = await Notification.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .limit(5);

    // Total appointments count
    const totalAppointments = await Appointment.countDocuments({ patientId: patient._id });

    res.json({
      success: true,
      data: {
        patient: {
          _id: patient._id,
          patientNumber: patient.patientNumber,
          fullName: req.user.fullName,
          email: req.user.email,
          phone: req.user.phone
        },
        activeToken: activeToken
          ? {
              ...activeToken.toObject(),
              positionInfo
            }
          : null,
        upcomingAppointment,
        recentNotifications,
        totalAppointments
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAdminDashboard,
  getDoctorDashboard,
  getReceptionistDashboard,
  getPatientDashboard
};
