import { supabase } from './supabaseClient';
import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { 
  Elements, 
  CardElement, 
  useStripe, 
  useElements 
} from '@stripe/react-stripe-js';
import { 
  CreditCard, 
  Bitcoin, 
  ShieldCheck, 
  Smartphone, 
  User, 
  Clock,
  Copy,
  CheckCircle,
  MessageSquare
} from 'lucide-react';
import './styles.css';

// Initialize sandbox publishable instance pointer
const stripePromise = loadStripe('pk_test_51Otl6BC9RURXTbJp36L8mO8SjI2KzZ6R8KxlbXwW9E2VpL0M3F4K5J6N7P8Q9R0S1T2U3V4W5X6Y7Z8A9B0C1D2E3F4');

const DEMO_WALLETS = {
  USDC: '0x71C233105B91788c42214C224242424242424242',
  BTC: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
  ETH: '0x71C233105B91788c42214C224242424242424242',
  SOL: 'HN7cABviunccv5Afb2wLk46tu7Y6mH9UN4jE8627z97h'
};

const CRYPTO_PRICES = {
  USDC: '272.50',
  BTC: '0.00342',
  ETH: '0.0912',
  SOL: '1.845'
};

// SUB-COMPONENT: Stripe Sandbox Form
function SandboxCardForm({ isProcessing, setIsProcessing, timeLeft, cardHolder, setCardHolder, postalCode, setPostalCode }) {
  const stripe = useStripe();
  const elements = useElements();

  const handleCardSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    try {
      const cardElement = elements.getElement(CardElement);
      
      // Execute genuine sandbox transaction token allocation handshake
      const { paymentMethod, error: stripeError } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: {
          name: cardHolder,
          address: { postal_code: postalCode }
        }
      });

      if (stripeError) throw stripeError;

      // Log transaction reference straight into your Supabase orders schema row
      const { data, error: dbError } = await supabase
        .from('orders')
        .insert([
          {
            payment_method: 'stripe_sandbox_card',
            crypto_tx_hash: paymentMethod.id, // Securely logging generated 'pm_...' payload reference
            amount_paid_pence: 21500,
            status: 'completed'
          }
        ])
        .select();

      if (dbError) throw dbError;
      alert(`💳 SANDBOX TRANSACTION SUCCESSFUL!\nToken Handshake mapped in Supabase: ${data[0].id}\nNo real money was moved.`);
      
      setCardHolder('');
      setPostalCode('');
      cardElement.clear();

    } catch (err) {
      alert(`Stripe Sandbox Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleCardSubmit}>
      <div className="alert-box alert-blue">
        <ShieldCheck size={16} style={{ marginRight: '0.5rem', float: 'left' }} />
        <span>Sandbox Mode Enabled. You can safely type real card formats or mock numbers for testing.</span>
        <div style={{ clear: 'both' }}></div>
      </div>
      
      <div className="form-group">
        <label className="form-label">Name on Card</label>
        <input type="text" value={cardHolder} onChange={(e) => setCardHolder(e.target.value)} placeholder="Wayne Wol" className="form-input" required />
      </div>

      <div className="form-group">
        <label className="form-label">Card Credentials</label>
        <div className="stripe-input-container">
          <CardElement options={{ style: { base: { fontSize: '16px', color: '#111827' } } }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
        <div className="form-group">
          <label className="form-label">Country</label>
          <select className="form-select">
            <option>Kenya</option>
            <option>United States</option>
            <option>United Kingdom</option>
          </select>
        </div>
        <div className="form-group">
          <label className="form-label">Postal Code</label>
          <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="00100" className="form-input" required />
        </div>
      </div>

      <button type="submit" disabled={isProcessing || timeLeft <= 0 || !stripe} className="submit-btn" style={{ marginTop: '1rem' }}>
        {isProcessing ? 'Authorizing Sandbox Rails...' : 'Get Tickets'}
      </button>
    </form>
  );
}

// MAIN PLATFORM INSTANCE
export default function App() {
  const [activeTab, setActiveTab] = useState('card');
  const [timeLeft, setTimeLeft] = useState(480);
  const [cryptoTimeLeft, setCryptoTimeLeft] = useState(900);
  const [cryptoCoin, setCryptoCoin] = useState('USDC');
  const [copied, setCopied] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  useEffect(() => {
    if (cryptoTimeLeft <= 0) return;
    const timer = setInterval(() => setCryptoTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [cryptoTimeLeft]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(DEMO_WALLETS[cryptoCoin]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGooglePayClick = async () => {
    setIsProcessing(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([
          {
            payment_method: 'google_pay_sandbox',
            crypto_tx_hash: `SANDBOX_G_PAY_TOKEN_${Math.random().toString(36).substring(5).toUpperCase()}`,
            amount_paid_pence: 21500,
            status: 'completed'
          }
        ])
        .select();

      if (error) throw error;
      alert(`🤖 GOOGLE PAY EXPRESS Handshake Logged in Supabase: ${data[0].id}`);
    } catch (err) {
      alert(`Database Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCryptoSubmit = async (e) => {
    e.preventDefault();
    if (!txHash.trim()) return;
    
    setIsProcessing(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([
          {
            payment_method: `crypto_${cryptoCoin}`,
            crypto_tx_hash: txHash,
            amount_paid_pence: 21500,
            status: 'pending'
          }
        ])
        .select();

      if (error) throw error;
      alert(`🎉 Crypto receipt logged into cloud Supabase schema: ${data[0].id}`);
      setTxHash('');
    } catch (err) {
      alert(`Database Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      <header className="tm-header">
        <div className="tm-header-container">
          <div className="tm-logo-group">
            <span className="tm-logo">ticketmaster</span>
          </div>
          <div className="tm-timer-badge">
            <Clock size={14} color="#ffffff" style={{ marginRight: '0.25rem' }} />
            <span className="tm-timer-text">{formatTime(timeLeft)} time remaining</span>
          </div>
        </div>
      </header>

      {/* Primary Event Summary Bar matching screenshot layout details */}
      <div style={{ maxWidth: '1100px', margin: '1rem auto 0 auto', padding: '0 0.75rem' }}>
        <div className="event-info-bar">
          <div className="event-breadcrumbs">Home / Concert Tickets / Rock / Taylor Swift</div>
          <div className="event-title-row">
            <h1 className="event-main-title">Taylor Swift | The Eras Tour</h1>
            <button type="button" className="more-info-btn">More Info</button>
          </div>
          <p className="event-meta-text">Sat • Aug 17 • 6:30 PM • Wembley Stadium, London</p>
          <div className="event-important-note">
            <strong>Important Event Info:</strong> No tickets will be released prior to 72 hours before the event.
          </div>
        </div>
      </div>

      <main className="checkout-container">
        
        {/* LEFT COMPONENT ELEMENT ROW */}
        <div>
          {/* Section Seating Visual representation mapping mapping from screenshots */}
          <div className="stadium-map-box">
            <div style={{ textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: '700', color: '#64748b', marginBottom: '0.5rem', textAlign: 'left' }}>Venue Seating Overview</div>
            {/* Using a structural placeholder representation box to outline Section 508 highlight parameters cleanly */}
            <div style={{ width: '100%', height: '140px', backgroundColor: '#e2e8f0', borderRadius: '6px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1px solid #cbd5e1' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: '900', color: '#026cdf' }}>SECTION 508</span>
              <span style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.25rem', fontWeight: '600' }}>Row 20 • Seat 24 Selected</span>
            </div>
          </div>

          <div className="payment-panel">
            <h2 className="panel-title">
              <span className="step-number">1</span>
              Select Payment Method
            </h2>

            <div className="tab-navigation">
              <button type="button" className={`tab-button ${activeTab === 'card' ? 'active' : ''}`} onClick={() => setActiveTab('card')}>
                <CreditCard size={16} />
                <span>Card / Google Pay</span>
              </button>
              <button type="button" className={`tab-button ${activeTab === 'crypto' ? 'active' : ''}`} onClick={() => setActiveTab('crypto')}>
                <Bitcoin size={16} />
                <span>Crypto Wallet</span>
              </button>
            </div>

            {activeTab === 'card' && (
              <div>
                <div style={{ marginBottom: '1.5rem', paddingBottom: '1.25rem', borderBottom: '1px dashed #e5e7eb' }}>
                  <label className="form-label" style={{ marginBottom: '0.5rem' }}>Express Checkout Option</label>
                  <button type="button" onClick={handleGooglePayClick} className="gpay-express-btn">
                    <span>Google Pay</span>
                  </button>
                </div>

                <div style={{ position: 'relative', textAlign: 'center', margin: '1.5rem 0 1rem 0' }}>
                  <div style={{ position: 'absolute', top: '50%', left: '0', right: '0', height: '1px', backgroundColor: '#e5e7eb', zIndex: '1' }}></div>
                  <span style={{ position: 'relative', zIndex: '2', backgroundColor: '#ffffff', padding: '0 0.75rem', fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700', display: 'block', width: 'fit-content', margin: '0 auto' }}>
                    Or enter card manually
                  </span>
                </div>

                <Elements stripe={stripePromise}>
                  <SandboxCardForm 
                    isProcessing={isProcessing} 
                    setIsProcessing={setIsProcessing} 
                    timeLeft={timeLeft}
                    cardHolder={cardHolder}
                    setCardHolder={setCardHolder}
                    postalCode={postalCode}
                    setPostalCode={setPostalCode}
                  />
                </Elements>
              </div>
            )}

            {activeTab === 'crypto' && (
              <form onSubmit={handleCryptoSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div className="alert-box alert-orange" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>⚠️ Exchange Rate Allocation Expiry:</span>
                  <strong style={{ fontFamily: 'monospace' }}>{formatTime(cryptoTimeLeft)}</strong>
                </div>

                <div>
                  <label className="form-label">Select Target Crypto Asset</label>
                  <div className="crypto-grid">
                    {['USDC', 'BTC', 'ETH', 'SOL'].map((coin) => (
                      <div key={coin} onClick={() => { setCryptoCoin(coin); setCryptoTimeLeft(900); }} className={`crypto-card ${cryptoCoin === coin ? 'active' : ''}`}>
                        <span>{coin}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '0.75rem', borderRadius: '0.5rem', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.65rem', color: '#64748b', textTransform: 'uppercase', fontWeight: 700 }}>Required Transfer Amount</span>
                  <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', marginTop: '0.125rem' }}>
                    {CRYPTO_PRICES[cryptoCoin]} <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>{cryptoCoin}</span>
                  </h2>
                </div>

                <div>
                  <label className="form-label">Destination Merchant Wallet Address</label>
                  <div style={{ display: 'flex', gap: '0.375rem' }}>
                    <input type="text" readOnly value={DEMO_WALLETS[cryptoCoin]} className="form-input" style={{ fontFamily: 'monospace', fontSize: '0.7rem', backgroundColor: '#f1f5f9', color: '#334155' }} />
                    <button type="button" onClick={handleCopyAddress} style={{ backgroundColor: '#026cdf', color: 'white', border: 'none', borderRadius: '0.5rem', padding: '0 0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">On-Chain Transaction Hash Receipt</label>
                  <input type="text" placeholder="Paste on-chain block receipt signature..." className="form-input" value={txHash} onChange={(e) => setTxHash(e.target.value)} required />
                </div>

                <button type="submit" disabled={isProcessing || timeLeft <= 0} className="submit-btn" style={{ backgroundColor: '#026cdf' }}>
                  {isProcessing ? 'Writing to Supabase Instance...' : 'Confirm Transaction Receipt'}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: HIGH-FIDELITY SUMMARY SEAT DETAILS ROW MAP */}
        <div>
          <div className="ticket-card">
            <div className="ticket-header-row">
              <div>
                <h3 className="ticket-seat-title">Sec 508 • Row 20 • Seat 24</h3>
                <span className="badge-purple">Verified Resale Ticket</span>
              </div>
              <div className="ticket-price-display">
                <span>£215.00</span>
                <span style={{ display: 'block', fontSize: '0.65rem', color: '#64748b', fontWeight: '500', marginTop: '0.125rem' }}>ea</span>
              </div>
            </div>

            <div className="ticket-info-list">
              <div className="info-item-row">
                <User size={18} color="#4b5563" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
                <div>
                  <h4 className="info-item-heading">Single Ticket</h4>
                  <p className="info-item-subtext">You'll be seated alone.</p>
                </div>
              </div>

              <div className="info-item-row">
                <Smartphone size={18} color="#4b5563" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
                <div>
                  <h4 className="info-item-heading">Mobile Ticket</h4>
                  <p className="info-item-subtext">Scan barcode from your mobile device app.</p>
                </div>
              </div>

              <div className="info-item-row">
                <MessageSquare size={18} color="#4b5563" style={{ flexShrink: 0, marginTop: '0.125rem' }} />
                <div>
                  <h4 className="info-item-heading">Notes From Seller</h4>
                  <p className="info-item-subtext" style={{ fontStyle: 'italic' }}>"Great seat with a clear view of the stage!"</p>
                </div>
              </div>
            </div>

            <div className="price-breakdown" style={{ padding: '1.25rem' }}>
              <div className="flex-row-space" style={{ color: '#4b5563', fontSize: '0.85rem' }}>
                <span>1 Ticket</span>
                <span style={{ fontWeight: '700', color: '#111827' }}>£215.00</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
