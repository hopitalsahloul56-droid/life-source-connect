import Header from '@/components/Header';
import Footer from '@/components/Footer';
import DonationForm from '@/components/donation/DonationForm';

const DonatePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <DonationForm />
      <Footer />
    </div>
  );
};

export default DonatePage;
