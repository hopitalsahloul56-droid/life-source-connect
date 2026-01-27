import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { BarChart3, Clock, CheckCircle, XCircle, Users, Eye, Calendar, Loader2, LogOut } from 'lucide-react';
import AppointmentsCalendar from './AppointmentsCalendar';
interface DonationRequest {
  id: string;
  first_name: string;
  last_name: string;
  identity_number: string;
  phone_number: string;
  email: string | null;
  date_of_birth: string;
  blood_type: string;
  address: string | null;
  eligibility_answers: Record<string, boolean>;
  is_eligible: boolean;
  ineligibility_reason: string | null;
  status: 'pending' | 'approved' | 'rejected';
  appointment_date: string | null;
  admin_notes: string | null;
  created_at: string;
}
const AdminPanel = () => {
  const {
    t,
    language
  } = useLanguage();
  const {
    user,
    isAdmin,
    isLoading: authLoading,
    signOut
  } = useAuth();
  const navigate = useNavigate();
  const [requests, setRequests] = useState<DonationRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<DonationRequest | null>(null);
  const [appointmentDate, setAppointmentDate] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate('/auth');
      } else if (!isAdmin) {
        toast.error(t.auth.notAdmin);
        navigate('/');
      }
    }
  }, [user, isAdmin, authLoading, navigate, t]);
  useEffect(() => {
    if (isAdmin) {
      fetchRequests();
    }
  }, [isAdmin]);
  const fetchRequests = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('donation_requests').select('*').order('created_at', {
        ascending: false
      });
      if (error) throw error;
      setRequests(data as DonationRequest[]);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast.error(t.common.error);
    } finally {
      setIsLoading(false);
    }
  };
  const sendStatusEmail = async (request: DonationRequest, status: 'approved' | 'rejected', appointmentDateValue?: string) => {
    if (!request.email) {
      console.log('No email provided, skipping notification');
      return;
    }
    try {
      const {
        error
      } = await supabase.functions.invoke('send-status-email', {
        body: {
          email: request.email,
          firstName: request.first_name,
          lastName: request.last_name,
          status: status,
          appointmentDate: appointmentDateValue,
          language: language
        }
      });
      if (error) {
        console.error('Error sending email:', error);
      } else {
        console.log('Status email sent successfully');
      }
    } catch (error) {
      console.error('Error invoking email function:', error);
    }
  };
  const updateRequestStatus = async (id: string, status: 'approved' | 'rejected') => {
    setIsUpdating(true);
    try {
      const updateData: any = {
        status
      };
      if (status === 'approved' && appointmentDate) {
        updateData.appointment_date = new Date(appointmentDate).toISOString();
      }
      if (adminNotes) {
        updateData.admin_notes = adminNotes;
      }
      const {
        error
      } = await supabase.from('donation_requests').update(updateData).eq('id', id);
      if (error) throw error;

      // Send email notification
      const request = requests.find(r => r.id === id);
      if (request) {
        await sendStatusEmail(request, status, status === 'approved' ? appointmentDate : undefined);
      }
      toast.success(status === 'approved' ? t.admin.approved : t.admin.rejected);
      fetchRequests();
      setSelectedRequest(null);
      setAppointmentDate('');
      setAdminNotes('');
    } catch (error) {
      console.error('Error updating request:', error);
      toast.error(t.common.error);
    } finally {
      setIsUpdating(false);
    }
  };
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length
  };
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-warning/10 text-warning border-warning">{t.admin.pending}</Badge>;
      case 'approved':
        return <Badge variant="outline" className="bg-success/10 text-success border-success">{t.admin.approved}</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive">{t.admin.rejected}</Badge>;
      default:
        return null;
    }
  };
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'ar' ? 'ar-TN' : 'fr-TN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  if (authLoading || isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>;
  }
  if (!isAdmin) {
    return null;
  }
  return <div className="min-h-screen pt-20 pb-12 bg-warm">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-secondary-foreground">{t.admin.title}</h1>
            <p className="text-muted-foreground mt-1">{user?.email}</p>
          </div>
          <Button variant="outline" onClick={signOut}>
            <LogOut className="w-4 h-4 mr-2" />
            {t.nav.logout}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-4 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{stats.total}</p>
            <p className="text-sm text-muted-foreground">{t.admin.total}</p>
          </Card>
          <Card className="p-4 text-center">
            <Clock className="w-8 h-8 mx-auto mb-2 text-warning" />
            <p className="text-2xl font-bold">{stats.pending}</p>
            <p className="text-sm text-muted-foreground">{t.admin.pending}</p>
          </Card>
          <Card className="p-4 text-center">
            <CheckCircle className="w-8 h-8 mx-auto mb-2 text-success" />
            <p className="text-2xl font-bold">{stats.approved}</p>
            <p className="text-sm text-muted-foreground">{t.admin.approved}</p>
          </Card>
          <Card className="p-4 text-center">
            <XCircle className="w-8 h-8 mx-auto mb-2 text-destructive" />
            <p className="text-2xl font-bold">{stats.rejected}</p>
            <p className="text-sm text-muted-foreground">{t.admin.rejected}</p>
          </Card>
        </div>

        {/* Appointments Calendar */}
        <AppointmentsCalendar />

        <div className="mt-8">
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-semibold">{t.admin.requests}</h2>
          </div>

          {requests.length === 0 ? <p className="text-center text-muted-foreground py-8">
              {t.admin.noRequests}
            </p> : <div className="space-y-4">
              {requests.map(request => <div key={request.id} className="flex flex-col md:flex-row md:items-center justify-between p-4 rounded-xl bg-secondary/50 gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold">
                        {request.first_name} {request.last_name}
                      </h3>
                      {getStatusBadge(request.status)}
                      {!request.is_eligible && <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive text-xs">
                          {t.form.ineligibleTitle}
                        </Badge>}
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>{request.phone_number} | {request.blood_type}</p>
                      <p>{t.admin.requestDate}: {formatDate(request.created_at)}</p>
                      {request.appointment_date && <p className="text-success">
                          <Calendar className="w-4 h-4 inline mr-1" />
                          {formatDate(request.appointment_date)}
                        </p>}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" onClick={() => {
                    setSelectedRequest(request);
                    setAppointmentDate('');
                    setAdminNotes(request.admin_notes || '');
                  }}>
                          <Eye className="w-4 h-4 mr-1" />
                          {t.admin.viewDetails}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>
                            {request.first_name} {request.last_name}
                          </DialogTitle>
                        </DialogHeader>

                        <div className="space-y-6 mt-4">
                          {/* Personal Info */}
                          <div>
                            <h4 className="font-semibold mb-3">{t.admin.personalInfo}</h4>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="text-muted-foreground">{t.form.identityNumber}:</span>
                                <p className="font-medium">{request.identity_number}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">{t.form.phoneNumber}:</span>
                                <p className="font-medium">{request.phone_number}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">{t.form.email}:</span>
                                <p className="font-medium">{request.email || '-'}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">{t.form.dateOfBirth}:</span>
                                <p className="font-medium">{formatDate(request.date_of_birth)}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">{t.form.bloodType}:</span>
                                <p className="font-medium">{request.blood_type}</p>
                              </div>
                              <div>
                                <span className="text-muted-foreground">{t.form.address}:</span>
                                <p className="font-medium">{request.address || '-'}</p>
                              </div>
                            </div>
                          </div>

                          {/* Eligibility */}
                          <div>
                            <h4 className="font-semibold mb-3">{t.admin.eligibilityAnswers}</h4>
                            <div className="space-y-2 text-sm">
                              {Object.entries(request.eligibility_answers).map(([key, value]) => {
                          const questionKey = key as keyof typeof t.form;
                          const questionText = t.form[questionKey] as string;
                          return <div key={key} className="flex justify-between items-start gap-4">
                                    <span className="text-muted-foreground">{questionText}</span>
                                    <Badge variant={value ? 'destructive' : 'outline'}>
                                      {value ? t.form.yes : t.form.no}
                                    </Badge>
                                  </div>;
                        })}
                            </div>
                            {request.ineligibility_reason && <div className="mt-3 p-3 bg-destructive/10 rounded-lg">
                                <p className="text-sm text-destructive">
                                  <strong>{t.form.ineligibleReason}</strong> {request.ineligibility_reason}
                                </p>
                              </div>}
                          </div>

                          {/* Actions */}
                          {request.status === 'pending' && request.is_eligible && <div className="space-y-4 pt-4 border-t">
                              <div className="space-y-2">
                                <Label>{t.admin.appointmentDate}</Label>
                                <Input type="datetime-local" value={appointmentDate} onChange={e => setAppointmentDate(e.target.value)} />
                              </div>
                              <div className="space-y-2">
                                <Label>{t.admin.notes}</Label>
                                <Textarea value={adminNotes} onChange={e => setAdminNotes(e.target.value)} rows={2} />
                              </div>
                              <div className="flex gap-3">
                                <Button className="flex-1 bg-success hover:bg-success/90" onClick={() => updateRequestStatus(request.id, 'approved')} disabled={isUpdating}>
                                  {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  {t.admin.approve}
                                </Button>
                                <Button variant="destructive" className="flex-1" onClick={() => updateRequestStatus(request.id, 'rejected')} disabled={isUpdating}>
                                  {isUpdating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                  <XCircle className="w-4 h-4 mr-2" />
                                  {t.admin.reject}
                                </Button>
                              </div>
                            </div>}
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>)}
            </div>}
        </Card>
        </div>
      </div>
    </div>;
};
export default AdminPanel;