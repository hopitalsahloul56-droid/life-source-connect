import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Clock, User, Droplet, AlertCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

interface Appointment {
  id: string;
  first_name: string;
  last_name: string;
  identity_number: string;
  phone_number: string;
  blood_type: string;
  appointment_date: string;
}

const AppointmentsCalendar = () => {
  const { t, language } = useLanguage();
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update current time every minute for real-time tracking
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  // Fetch appointments and categorize them
  const fetchAppointments = async () => {
    const { data, error } = await supabase
      .from('donation_requests')
      .select('id, first_name, last_name, identity_number, phone_number, blood_type, appointment_date')
      .eq('status', 'approved')
      .not('appointment_date', 'is', null)
      .order('appointment_date', { ascending: true });

    if (error) {
      console.error('Error fetching appointments:', error);
      return;
    }

    const now = new Date();
    const upcoming: Appointment[] = [];
    const past: Appointment[] = [];

    (data as Appointment[]).forEach((apt) => {
      if (new Date(apt.appointment_date) > now) {
        upcoming.push(apt);
      } else {
        past.push(apt);
      }
    });

    setUpcomingAppointments(upcoming);
    setPastAppointments(past.reverse()); // Most recent first for past
  };

  // Initial fetch
  useEffect(() => {
    fetchAppointments();
  }, []);

  // Re-categorize appointments when time changes
  useEffect(() => {
    const now = new Date();
    
    // Move expired upcoming appointments to past
    const stillUpcoming: Appointment[] = [];
    const newlyPast: Appointment[] = [];

    upcomingAppointments.forEach((apt) => {
      if (new Date(apt.appointment_date) > now) {
        stillUpcoming.push(apt);
      } else {
        newlyPast.push(apt);
      }
    });

    if (newlyPast.length > 0) {
      setUpcomingAppointments(stillUpcoming);
      setPastAppointments((prev) => [...newlyPast.reverse(), ...prev]);
    }
  }, [currentTime]);

  // Real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('appointments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'donation_requests',
        },
        () => {
          fetchAppointments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(language === 'ar' ? 'ar-TN' : 'fr-TN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      time: date.toLocaleTimeString(language === 'ar' ? 'ar-TN' : 'fr-TN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
  };

  const getTimeUntil = (dateString: string) => {
    const now = new Date();
    const appointmentDate = new Date(dateString);
    const diff = appointmentDate.getTime() - now.getTime();

    if (diff < 0) return null;

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return language === 'ar' ? `${days} أيام` : `${days} jours`;
    }
    if (hours > 0) {
      return language === 'ar' ? `${hours} ساعة` : `${hours}h`;
    }
    return language === 'ar' ? `${minutes} دقيقة` : `${minutes}min`;
  };

  const isImminentAppointment = (dateString: string) => {
    const now = new Date();
    const appointmentDate = new Date(dateString);
    const diff = appointmentDate.getTime() - now.getTime();
    return diff > 0 && diff < 60 * 60 * 1000; // Within 1 hour
  };

  const renderAppointmentTable = (appointments: Appointment[], isPast: boolean) => {
    if (appointments.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>{isPast ? t.admin.noPastAppointments : t.admin.noUpcomingAppointments}</p>
        </div>
      );
    }

    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t.form.firstName} {t.form.lastName}</TableHead>
            <TableHead>{t.form.identityNumber}</TableHead>
            <TableHead>{t.form.bloodType}</TableHead>
            <TableHead>{t.admin.appointmentDate}</TableHead>
            <TableHead>{t.admin.appointmentTime}</TableHead>
            {!isPast && <TableHead></TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {appointments.map((apt) => {
            const { date, time } = formatDateTime(apt.appointment_date);
            const timeUntil = !isPast ? getTimeUntil(apt.appointment_date) : null;
            const isImminent = !isPast && isImminentAppointment(apt.appointment_date);

            return (
              <TableRow
                key={apt.id}
                className={isImminent ? 'bg-warning/10 animate-pulse' : isPast ? 'opacity-70' : ''}
              >
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    {apt.first_name} {apt.last_name}
                  </div>
                </TableCell>
                <TableCell>{apt.identity_number}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Droplet className="w-4 h-4 text-destructive" />
                    {apt.blood_type}
                  </div>
                </TableCell>
                <TableCell>{date}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    {time}
                  </div>
                </TableCell>
                {!isPast && (
                  <TableCell>
                    {timeUntil && (
                      <Badge
                        variant="outline"
                        className={
                          isImminent
                            ? 'bg-warning/20 text-warning border-warning'
                            : 'bg-primary/10 text-primary border-primary'
                        }
                      >
                        {timeUntil}
                      </Badge>
                    )}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    );
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold">{t.admin.calendar}</h2>
      </div>

      <Tabs defaultValue="upcoming" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="upcoming" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {t.admin.upcomingAppointments}
            {upcomingAppointments.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {upcomingAppointments.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="past" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {t.admin.pastAppointments}
            {pastAppointments.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {pastAppointments.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming">
          {renderAppointmentTable(upcomingAppointments, false)}
        </TabsContent>

        <TabsContent value="past">
          {renderAppointmentTable(pastAppointments, true)}
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default AppointmentsCalendar;
