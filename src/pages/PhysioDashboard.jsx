import React, { useState, useEffect } from 'react';
import { AlertCircle, PartyPopper, BarChart3, Users, Calendar, Clock, Target, Activity, CalendarDays, UserCheck, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '../components/dashboard/Navbar';
import StatCard from '../components/dashboard/StatCard';
import PatientSearchBar from '../components/dashboard/PatientSearchBar';
import PatientRecordCard from '../components/dashboard/PatientRecordCard';
import RadialProgressChart from '../components/charts/RadialProgressChart';
import StreakTracker from '../components/dashboard/StreakTracker';
import AdherenceRate from '../components/dashboard/AdherenceRate';
import NextMeeting from '../components/dashboard/NextMeeting';
import UpcomingSessions from '../components/dashboard/UpcomingSessions';
import EnhancedRecentMessages from '../components/dashboard/EnhancedRecentMessages';
import AIInsights from '../components/dashboard/AIInsights';
import RecoveryTrendsChart from '../components/charts/RecoveryTrendsChart';
import TreatmentPlanPieChart from '../components/charts/TreatmentPlanPieChart';
import ExerciseManager from '../components/exercises/ExerciseManager';
import { useAuth } from '../context/AuthContext';
import { useAppointments, useUsers } from '../hooks/useDashboardData';

const PhysioDashboard = () => {
  const { user } = useAuth();
  const { appointments, loading: appointmentsLoading } = useAppointments();
  const { users, loading: usersLoading } = useUsers();
  
  const [selectedPatient, setSelectedPatient] = useState({ 
    name: 'All Patients', 
    id: 'all',
    isOverview: true 
  });

  const patients = users.filter(u => u.user_type === 'patient');
  const loading = appointmentsLoading || usersLoading;

  const handlePatientSelect = (patient) => {
    setSelectedPatient(patient);
  };

  // Calculate dashboard data based on API data
  const getPatientData = () => {
    if (selectedPatient.id === 'all' || selectedPatient.isOverview) {
      const today = new Date().toDateString();
      const todayAppointments = appointments.filter(apt => 
        new Date(apt.date).toDateString() === today
      );
      
      const upcomingAppointments = appointments.filter(apt => 
        new Date(apt.date) > new Date() && apt.status === 'scheduled'
      ).sort((a, b) => new Date(a.date) - new Date(b.date));

      return {
        activePatients: patients.length,
        sessionsToday: todayAppointments.length,
        nextAppointment: upcomingAppointments.length > 0 ? 
          `${upcomingAppointments[0].patient_name || 'Patient'} - ${upcomingAppointments[0].time || 'TBD'}` : 
          'No upcoming appointments',
        treatmentGoals: appointments.filter(apt => apt.status === 'completed').length,
        exerciseCompletion: 78, // Would calculate from exercise progress data
        streak: 6, // Would calculate from appointment history
        adherenceRate: 82 // Would calculate from exercise completion data
      };
    } else {
      const patientAppointments = appointments.filter(apt => 
        apt.patient === selectedPatient.id
      );
      
      const completedSessions = patientAppointments.filter(apt => 
        apt.status === 'completed'
      ).length;

      const upcomingAppointments = patientAppointments.filter(apt => 
        new Date(apt.date) > new Date() && apt.status === 'scheduled'
      ).sort((a, b) => new Date(a.date) - new Date(b.date));

      return {
        activePatients: 1,
        sessionsToday: completedSessions,
        nextAppointment: upcomingAppointments.length > 0 ? 
          `${new Date(upcomingAppointments[0].date).toLocaleDateString()} - ${upcomingAppointments[0].time || 'TBD'}` : 
          'No upcoming sessions',
        treatmentGoals: patientAppointments.length,
        exerciseCompletion: 85, // Would calculate from exercise progress
        streak: 7, // Would calculate from exercise completion
        adherenceRate: 88 // Would calculate from exercise data
      };
    }
  };

  const patientData = getPatientData();

  const getPatientSpecificInsights = () => {
    if (selectedPatient.isOverview || selectedPatient.id === 'all') {
      return [
        {
          type: 'alert',
          icon: AlertCircle,
          title: 'Patient Attention Needed',
          message: 'Jane Smith has missed 2 consecutive sessions. Consider reaching out.',
          color: 'yellow'
        },
        {
          type: 'positive',
          icon: PartyPopper,
          title: 'Treatment Success',
          message: 'John Doe has achieved 90% of recovery goals ahead of schedule.',
          color: 'green'
        },
        {
          type: 'suggestion',
          icon: BarChart3,
          title: 'Data Insight',
          message: 'Patients show 15% better adherence when exercises are scheduled in the morning.',
          color: 'blue'
        }
      ];
    } else {
      const insights = [];
      
      // Generate patient-specific insights
      if (selectedPatient.status === 'attention') {
        insights.push({
          type: 'alert',
          icon: AlertCircle,
          title: 'Attention Required',
          message: `${selectedPatient.name} has missed recent sessions and needs follow-up.`,
          color: 'yellow'
        });
      }
      
      if (selectedPatient.progress >= 85) {
        insights.push({
          type: 'positive',
          icon: PartyPopper,
          title: 'Excellent Progress',
          message: `${selectedPatient.name} is showing outstanding recovery progress at ${selectedPatient.progress}%.`,
          color: 'green'
        });
      }
      
      if (selectedPatient.adherence < 80) {
        insights.push({
          type: 'suggestion',
          icon: BarChart3,
          title: 'Adherence Improvement',
          message: `Consider adjusting exercise schedule for ${selectedPatient.name} to improve adherence rate.`,
          color: 'blue'
        });
      } else {
        insights.push({
          type: 'positive',
          icon: BarChart3,
          title: 'Good Adherence',
          message: `${selectedPatient.name} maintains excellent adherence at ${selectedPatient.adherence}%.`,
          color: 'green'
        });
      }
      
      return insights;
    }
  };

  const physioInsights = getPatientSpecificInsights();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Loader className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading dashboard data...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
          <div className="mb-4 lg:mb-0">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Welcome back, Dr. {user?.first_name || 'Physiotherapist'}!
            </h1>
            <p className="text-gray-600">
              {selectedPatient.isOverview 
                ? `Monitor ${patients.length} patients and manage treatments` 
                : `Managing ${selectedPatient.first_name} ${selectedPatient.last_name}`
              }
            </p>
          </div>
          
          <PatientSearchBar 
            onSelectPatient={handlePatientSelect}
            selectedPatient={selectedPatient}
          />
        </div>

        {/* Patient Record Card - Show when specific patient is selected */}
        {!selectedPatient.isOverview && selectedPatient.id !== 'all' && (
          <div className="mb-8">
            <PatientRecordCard patient={selectedPatient} />
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title={selectedPatient.isOverview ? "Active Patients" : "Patient Status"}
            value={selectedPatient.isOverview ? patientData.activePatients.toString() : selectedPatient.status}
            icon={<Users className="h-6 w-6 text-blue-600" />}
            subtitle={selectedPatient.isOverview ? "Currently treating" : "Current condition"}
          />
          <StatCard
            title={selectedPatient.isOverview ? "Sessions Today" : "Completed Sessions"}
            value={patientData.sessionsToday.toString()}
            icon={<Calendar className="h-6 w-6 text-green-600" />}
            subtitle={selectedPatient.isOverview ? "Completed sessions" : `of ${selectedPatient.totalSessions || 'N/A'} total`}
          />
          <StatCard
            title="Next Appointment"
            value={selectedPatient.isOverview ? patientData.nextAppointment : selectedPatient.nextSession || 'Not scheduled'}
            icon={<Clock className="h-6 w-6 text-orange-600" />}
            subtitle=""
          />
          <StatCard
            title={selectedPatient.isOverview ? "Treatment Goals" : "Pain Level"}
            value={selectedPatient.isOverview ? patientData.treatmentGoals.toString() : `${selectedPatient.painLevel || 'N/A'}/10`}
            icon={<Target className="h-6 w-6 text-purple-600" />}
            subtitle={selectedPatient.isOverview ? "Goals achieved" : "Current pain level"}
          />
        </div>

        {/* Quick Access Navigation */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Access</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              to="/appointments" 
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 hover:border-blue-300"
            >
              <div className="flex items-center">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <CalendarDays className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-gray-900">Appointments</h3>
                  <p className="text-sm text-gray-600">Manage patient appointments</p>
                </div>
              </div>
            </Link>

            <Link 
              to="/exercises" 
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 hover:border-green-300"
            >
              <div className="flex items-center">
                <div className="p-3 bg-green-100 rounded-lg">
                  <Activity className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-gray-900">Exercise Library</h3>
                  <p className="text-sm text-gray-600">Manage exercises and plans</p>
                </div>
              </div>
            </Link>

            <Link 
              to="/users" 
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow border border-gray-200 hover:border-purple-300"
            >
              <div className="flex items-center">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <UserCheck className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <h3 className="font-medium text-gray-900">Patient Management</h3>
                  <p className="text-sm text-gray-600">View and manage patients</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        {/* Patient-Specific Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <RadialProgressChart 
            percentage={patientData.exerciseCompletion} 
            title="Exercise Completion" 
            subtitle={selectedPatient.isOverview ? 'Average across all patients' : `${selectedPatient.name}'s progress`}
          />
          <StreakTracker 
            streakDays={7} 
            currentStreak={patientData.streak} 
          />
          <AdherenceRate 
            rate={patientData.adherenceRate} 
            trend={5} 
          />
        </div>

        {/* Exercise Manager Section */}
        <div className="mb-8">
          <ExerciseManager selectedPatient={selectedPatient.name} />
        </div>

        {/* Session Management */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <NextMeeting 
            doctorName="You"
            date="Today"
            time="2:00 PM"
            canJoin={true}
          />
          <UpcomingSessions />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <RecoveryTrendsChart selectedPatient={selectedPatient.name} />
          <TreatmentPlanPieChart />
        </div>

        {/* Communication & Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <EnhancedRecentMessages 
            isPhysio={true} 
            selectedPatient={selectedPatient.name} 
          />
          <AIInsights 
            insights={physioInsights} 
            isPatient={false} 
          />
        </div>
      </div>
    </div>
  );
};

export default PhysioDashboard;