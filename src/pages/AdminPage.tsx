import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AdminPanel from '@/components/admin/AdminPanel';

const AdminPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <AdminPanel />
      <Footer />
    </div>
  );
};

export default AdminPage;
