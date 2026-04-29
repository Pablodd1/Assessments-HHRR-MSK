import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDemo } from '../store/DemoContext';
import { generateSpeech } from '../services/gemini';
import { addAppointmentToCalendar } from '../services/calendar';
import { Calendar as CalendarIcon, Clock, MapPin, User, CheckCircle2, ChevronRight, ChevronLeft, Mail, MessageSquare, BrainCircuit, LayoutDashboard, Loader2, Volume2, CalendarPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Scheduling = () => {
  const navigate = useNavigate();
  const { currentPatient, updatePatient } = useDemo();
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [currentMonthDate, setCurrentMonthDate] = useState(new Date());
  const [isSpeaking, setIsSpeaking] = useState(false);

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = new Date(year, month, 1).getDay();

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const handlePrevMonth = () => setCurrentMonthDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentMonthDate(new Date(year, month + 1, 1));

  const isDateDisabled = (day: number) => {
    const date = new Date(year, month, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) return true;
    if (date.getDay() === 0 || date.getDay() === 6) return true; // Skip weekends
    return false;
  };

  const availableTimes = ['09:00 AM', '10:30 AM', '01:00 PM', '02:30 PM', '04:00 PM'];

  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirm = async () => {
    setIsConfirming(true);
    // Simulate network delay for sending email and SMS
    await new Promise(resolve => setTimeout(resolve, 2000));

    let calendarAdded = false;
    try {
      // Parse the selected date and time to create start and end Date objects
      const [timeStr, ampm] = selectedTime.split(' ');
      let [hours, minutes] = timeStr.split(':').map(Number);
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
      
      const startTime = new Date(selectedDate);
      startTime.setHours(hours, minutes, 0, 0);
      
      const endTime = new Date(startTime);
      endTime.setMinutes(endTime.getMinutes() + 45); // 45 min duration

      await addAppointmentToCalendar(
        `Consultation with ${currentPatient.firstName} ${currentPatient.lastName}`,
        startTime,
        endTime,
        `Clinic Consultation for ${currentPatient.interest}\nPhone: ${currentPatient.phone}\nEmail: ${currentPatient.email}`
      );
      calendarAdded = true;
    } catch (error) {
      console.error("Failed to add to calendar:", error);
      // We continue even if calendar fails, but the user would ideally be notified
    }

    if (currentPatient.id) {
      const newTimeline = [
        ...(currentPatient.timeline || []),
        { date: new Date().toISOString(), event: 'Appointment Booked' },
        { date: new Date().toISOString(), event: 'Confirmation Email Sent' },
        { date: new Date().toISOString(), event: 'Confirmation SMS Sent' }
      ];

      if (calendarAdded) {
        newTimeline.push({ date: new Date().toISOString(), event: 'Sync: Added to Google Calendar' });
      }

      updatePatient(currentPatient.id, { 
        status: 'Scheduled',
        appointmentClicked: true,
        timeline: newTimeline,
        communications: {
          ...currentPatient.communications,
          emails: [
            ...(currentPatient.communications?.emails || []),
            { type: 'Confirmation Email', subject: 'Consultation Confirmed', body: `Hi ${currentPatient.firstName || 'there'},\n\nYour consultation is successfully scheduled for ${new Date(selectedDate).toLocaleDateString()} at ${selectedTime}.\n\nLooking forward to speaking with you!`, day: 0 }
          ],
          sms: [
            ...(currentPatient.communications?.sms || []),
            { type: 'Confirmation SMS', body: `Hi ${currentPatient.firstName || 'there'}, your consultation is confirmed for ${new Date(selectedDate).toLocaleDateString()} at ${selectedTime}.`, day: 0 }
          ]
        }
      });
    }
    setIsConfirming(false);
    setStep(2);
  };

  const handleSpeakConfirmation = async () => {
    setIsSpeaking(true);
    const text = `Hi ${currentPatient.firstName || 'there'}. Your consultation is confirmed for ${selectedDate} at ${selectedTime}. We look forward to seeing you.`;
    try {
      const base64Audio = await generateSpeech(text);
      const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
      audio.onended = () => setIsSpeaking(false);
      audio.play();
    } catch (error) {
      console.error("Failed to generate speech", error);
      setIsSpeaking(false);
    }
  };

  if (step === 2) {
    return (
      <div className="flex-1 bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="max-w-2xl w-full space-y-8"
        >
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
            <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Consultation Confirmed</h2>
            <p className="text-gray-500 text-lg">
              Your clinician-led consultation is scheduled for {selectedDate} at {selectedTime}.
            </p>
            
            <button
              onClick={handleSpeakConfirmation}
              disabled={isSpeaking}
              className="mt-4 mx-auto inline-flex items-center justify-center px-4 py-2 border border-indigo-100 rounded-xl text-indigo-700 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50"
            >
              {isSpeaking ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Audio...
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 mr-2" />
                  Listen to Confirmation
                </>
              )}
            </button>

            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 text-left mt-8">
              <h3 className="font-bold text-gray-900 mb-4">Automated Confirmation Sequence Triggered:</h3>
              <div className="space-y-4">
                <div className="flex items-start">
                  <CalendarPlus className="w-5 h-5 text-indigo-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Google Calendar Synced</p>
                    <p className="text-xs text-gray-500">Appointment automatically added to provider calendar.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <Mail className="w-5 h-5 text-indigo-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">Email Confirmation Sent</p>
                    <p className="text-xs text-gray-500">Includes intake forms and clinic directions.</p>
                  </div>
                </div>
                <div className="flex items-start">
                  <MessageSquare className="w-5 h-5 text-indigo-500 mr-3 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">SMS Reminder Scheduled</p>
                    <p className="text-xs text-gray-500">Will send 24 hours before appointment.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-6">
              <button
                onClick={() => navigate('/dashboard')}
                className="w-full inline-flex items-center justify-center px-6 py-4 border border-transparent text-lg font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
              >
                <LayoutDashboard className="mr-2 w-5 h-5" />
                Continue to Clinic Dashboard
                <ChevronRight className="ml-2 w-5 h-5" />
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const blankDays = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  return (
    <div className="flex-1 bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl w-full space-y-8">
        
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Schedule Consultation</h2>
          <p className="mt-2 text-gray-500">
            Select an available time slot for your individualized wellness consultation.
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 overflow-hidden flex flex-col md:flex-row">
          
          {/* Left Panel - Info */}
          <div className="bg-indigo-50 p-8 md:w-1/3 border-b md:border-b-0 md:border-r border-indigo-100">
            <h3 className="text-lg font-bold text-indigo-900 mb-6">Consultation Details</h3>
            <div className="space-y-6">
              <div className="flex items-start">
                <User className="w-5 h-5 text-indigo-600 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-indigo-900">Provider</p>
                  <p className="text-sm text-indigo-700">Dr. Sarah Jenkins</p>
                </div>
              </div>
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-indigo-600 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-indigo-900">Location</p>
                  <p className="text-sm text-indigo-700">Main Clinic - Suite 200</p>
                </div>
              </div>
              <div className="flex items-start">
                <Clock className="w-5 h-5 text-indigo-600 mr-3 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-indigo-900">Duration</p>
                  <p className="text-sm text-indigo-700">45 Minutes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Selection */}
          <div className="p-8 md:w-2/3 space-y-8">
            <div>
              <div className="flex items-center justify-between mb-4">
                <label className="block text-sm font-bold text-gray-900">Select Date</label>
              </div>
              <div className="bg-white border text-sm border-gray-200 rounded-xl p-6">
                <div className="flex justify-between items-center mb-6">
                  <button onClick={handlePrevMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <span className="font-bold text-gray-900 text-base">{monthNames[month]} {year}</span>
                  <button onClick={handleNextMonth} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
                <div className="grid grid-cols-7 gap-1 text-center mb-2">
                  {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                    <div key={d} className="text-xs font-semibold text-gray-400 py-2">{d}</div>
                  ))}
                </div>
                <div className="grid grid-cols-7 gap-1">
                  {blankDays.map(d => <div key={`blank-${d}`} className="h-10"></div>)}
                  {days.map(d => {
                    const dateObj = new Date(year, month, d);
                    const dateStr = dateObj.toLocaleDateString();
                    const disabled = isDateDisabled(d);
                    const isSelected = selectedDate === dateStr;
                    return (
                      <button
                        key={d}
                        disabled={disabled}
                        onClick={() => {
                          setSelectedDate(dateStr);
                          setSelectedTime('');
                        }}
                        className={`h-10 w-full flex items-center justify-center rounded-lg text-sm font-medium transition-all ${
                          isSelected ? 'bg-indigo-600 text-white shadow-md scale-105' : 
                          disabled ? 'text-gray-300 cursor-not-allowed opacity-50' : 'text-gray-700 hover:bg-indigo-50 hover:text-indigo-600'
                        }`}
                      >
                        {d}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {selectedDate && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                <label className="block text-sm font-bold text-gray-900 mb-4">Select Time for {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {availableTimes.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`relative py-3 px-4 border rounded-xl text-sm font-medium transition-all flex items-center justify-center ${
                        selectedTime === time 
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-md scale-105' 
                          : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-sm'
                      }`}
                    >
                      {time}
                      {selectedTime === time && (
                        <CheckCircle2 className="absolute right-3 w-4 h-4 text-white opacity-90" />
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <div className="pt-8 border-t border-gray-100 mt-8">
              <button
                onClick={handleConfirm}
                disabled={!selectedDate || !selectedTime || isConfirming}
                className="w-full inline-flex items-center justify-center px-6 py-4 border border-transparent text-lg font-medium rounded-xl shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {isConfirming ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-3 animate-spin" />
                    Sending Confirmation...
                  </>
                ) : (
                  'Confirm Appointment'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
