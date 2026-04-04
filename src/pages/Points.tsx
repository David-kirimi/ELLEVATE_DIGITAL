import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Coins, CheckCircle2, AlertCircle, ShoppingCart, ArrowRight, Phone } from 'lucide-react';
import { db, auth } from '../firebase';
import { doc, updateDoc, increment, getDoc, onSnapshot, collection, addDoc } from 'firebase/firestore';
import axios from 'axios';
import toast from 'react-hot-toast';

const POINT_PACKS = [
  { id: 'pack1', points: 50, price: 500, popular: false },
  { id: 'pack2', points: 150, price: 1200, popular: true },
  { id: 'pack3', points: 500, price: 3500, popular: false },
  { id: 'pack4', points: 1200, price: 7500, popular: false },
];

export default function Points() {
  const [isBuying, setIsBuying] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [mpesaKeys, setMpesaKeys] = useState<any>(null);

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'siteSettings', 'mpesa'), (doc) => {
      if (doc.exists()) {
        setMpesaKeys(doc.data());
      }
    });
    return () => unsub();
  }, []);

  const handleBuy = async (pack: typeof POINT_PACKS[0]) => {
    if (!auth.currentUser) {
      setError("Please sign in to purchase points");
      return;
    }

    if (!phoneNumber || phoneNumber.length < 10) {
      setError("Please enter a valid M-Pesa phone number (e.g. 254700000000)");
      return;
    }

    // Format phone number to 254...
    let formattedPhone = phoneNumber.trim();
    if (formattedPhone.startsWith('0')) {
      formattedPhone = '254' + formattedPhone.slice(1);
    } else if (formattedPhone.startsWith('+')) {
      formattedPhone = formattedPhone.slice(1);
    }

    setIsBuying(pack.id);
    setError(null);
    setSuccess(null);

    const loadingToast = toast.loading(`Initiating M-Pesa payment for ${pack.points} points...`);

    try {
      const response = await axios.post('/api/mpesa/stkpush', {
        phoneNumber: formattedPhone,
        amount: pack.price,
        userId: auth.currentUser.uid,
        packId: pack.id,
        keys: mpesaKeys
      });

      if (response.data.ResponseCode === "0") {
        toast.success("STK Push sent! Please check your phone to complete payment.", { id: loadingToast });
        setSuccess(`STK Push sent to ${formattedPhone}. Once you enter your PIN, your points will be added automatically.`);
        
        // Record the transaction as pending
        const transactionRef = await addDoc(collection(db, 'transactions'), {
          userId: auth.currentUser.uid,
          userEmail: auth.currentUser.email,
          phoneNumber: formattedPhone,
          amount: pack.price,
          points: pack.points,
          status: 'pending',
          merchantRequestId: response.data.MerchantRequestID,
          checkoutRequestId: response.data.CheckoutRequestID,
          timestamp: new Date().toISOString()
        });

        // In this demo, we'll simulate the successful callback after 10 seconds
        // because we don't have a public URL for Safaricom to hit.
        setTimeout(async () => {
          try {
            const userDocRef = doc(db, 'users', auth.currentUser!.uid);
            await updateDoc(userDocRef, {
              points: increment(pack.points)
            });
            
            // Update transaction status
            await updateDoc(transactionRef, {
              status: 'completed',
              completedAt: new Date().toISOString()
            });

            toast.success(`Payment confirmed! Added ${pack.points} points.`);
          } catch (err) {
            console.error("Error updating points after simulation:", err);
          }
        }, 15000);

      } else {
        throw new Error(response.data.CustomerMessage || "STK Push failed");
      }
    } catch (err: any) {
      console.error("Purchase error:", err);
      const msg = err.response?.data?.error || err.message || "An error occurred during the purchase.";
      setError(msg);
      toast.error(msg, { id: loadingToast });
    } finally {
      setIsBuying(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-32 pb-20">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl mb-4">Purchase Points</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Get points to vote for your favorite contestants and help them win! 
            1 point = 1 vote.
          </p>
        </div>

        {success && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-green-50 text-green-700 p-6 rounded-3xl border border-green-100 flex items-center justify-center font-bold"
          >
            <CheckCircle2 className="w-6 h-6 mr-3" />
            {success}
          </motion.div>
        )}

        {error && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8 bg-red-50 text-red-700 p-6 rounded-3xl border border-red-100 flex items-center justify-center font-bold"
          >
            <AlertCircle className="w-6 h-6 mr-3" />
            {error}
          </motion.div>
        )}

        <div className="max-w-md mx-auto mb-12">
          <label className="block text-sm font-bold text-gray-700 mb-2">M-Pesa Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="tel"
              placeholder="e.g. 254712345678"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white border border-gray-100 focus:ring-2 focus:ring-brand-orange outline-none shadow-sm"
            />
          </div>
          <p className="mt-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider text-center">
            Enter the number that will receive the M-Pesa STK Push
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {POINT_PACKS.map((pack) => (
            <motion.div
              key={pack.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className={`relative bg-white p-8 rounded-[40px] shadow-sm hover:shadow-xl transition-all border ${
                pack.popular ? 'border-brand-orange ring-2 ring-brand-orange/10' : 'border-gray-100'
              } flex flex-col items-center text-center`}
            >
              {pack.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-brand-orange text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  Most Popular
                </div>
              )}
              
              <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6">
                <Coins className="w-10 h-10 text-brand-orange" />
              </div>
              
              <h3 className="text-3xl font-bold mb-2">{pack.points}</h3>
              <p className="text-gray-400 font-bold uppercase text-xs tracking-widest mb-6">Points</p>
              
              <div className="text-4xl font-display font-bold mb-8">
                <span className="text-sm font-sans align-top mr-1">KSh</span>
                {pack.price}
              </div>
              
              <button
                onClick={() => handleBuy(pack)}
                disabled={isBuying !== null}
                className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center transition-all ${
                  pack.popular 
                    ? 'bg-brand-orange text-white hover:bg-orange-600' 
                    : 'bg-brand-black text-white hover:bg-brand-orange'
                } disabled:opacity-50`}
              >
                {isBuying === pack.id ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5 mr-2" /> Buy Now
                  </>
                )}
              </button>
            </motion.div>
          ))}
        </div>

        <div className="mt-20 bg-brand-black text-white p-12 rounded-[40px] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-32 -mt-32" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl">
              <h2 className="text-3xl md:text-4xl mb-4">Need help with payments?</h2>
              <p className="text-gray-400">
                We support M-Pesa, Card, and Bank transfers. If you encounter any issues with your purchase, our support team is available 24/7.
              </p>
            </div>
            <a 
              href="https://wa.me/254700000000" 
              className="bg-white text-brand-black px-8 py-4 rounded-full font-bold flex items-center hover:bg-brand-orange hover:text-white transition-all"
            >
              Contact Support <ArrowRight className="ml-2 w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
