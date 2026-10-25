'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { EquipmentOrder } from '@/types';
import { districtList } from '@/data/services';
import { saveOrderToFirestore } from '@/lib/firestoreService';
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  ArrowRight,
  Truck,
  Landmark,
  Banknote,
  Upload,
  Copy,
  Check,
  ShieldCheck,
  Heart,
  Sparkles
} from 'lucide-react';

export const CartDrawer: React.FC = () => {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    clearCart,
    cartTotal,
    cartRegularTotal,
    cartSavings,
    cartCount,
    isCartDrawerOpen,
    closeCartDrawer
  } = useCart();

  const { user } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();

  // Checkout step: 'cart' | 'checkout' | 'success'
  const [step, setStep] = useState<'cart' | 'checkout' | 'success'>('cart');

  // Checkout Form State (Auto-filled from user profile if available)
  const [customerName, setCustomerName] = useState(user?.name || '');
  const [customerPhone, setCustomerPhone] = useState(user?.phone || '');
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '');
  const [district, setDistrict] = useState(user?.district || districtList[0]);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank_transfer'>('cod');
  const [bankSlipBase64, setBankSlipBase64] = useState<string>('');
  const [bankReference, setBankReference] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [completedOrder, setCompletedOrder] = useState<EquipmentOrder | null>(null);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Sync profile data when user changes
  useEffect(() => {
    if (user) {
      if (!customerName && user.name) setCustomerName(user.name);
      if (!customerPhone && user.phone) setCustomerPhone(user.phone);
      if (!deliveryAddress && user.address) setDeliveryAddress(user.address);
      if (user.district) setDistrict(user.district);
    }
  }, [user]);

  // Reset step to 'cart' when drawer reopens if not success
  useEffect(() => {
    if (isCartDrawerOpen && step === 'success') {
      setStep('cart');
    }
  }, [isCartDrawerOpen]);

  if (!isCartDrawerOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBankSlipBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || !deliveryAddress.trim()) {
      alert('කරුණාකර ඔබගේ නම, දුරකථන අංකය සහ ලිපිනය ඇතුළත් කරන්න.');
      return;
    }

    if (cart.length === 0) return;

    setIsSubmitting(true);
    try {
      const randomCode = Math.floor(1000 + Math.random() * 9000);
      const orderCode = `PLC-ORD-2026-${randomCode}`;

      const newOrder: EquipmentOrder = {
        id: orderCode,
        orderCode: orderCode,
        userId: user?.id || 'guest',
        contactName: customerName.trim(),
        contactPhone: customerPhone.trim(),
        contactEmail: user?.email || '',
        deliveryAddress: deliveryAddress.trim(),
        district: district,
        items: cart.map((c) => ({
          itemId: c.item.id,
          name: language === 'si' && c.item.name.si ? c.item.name.si : c.item.name.en,
          quantity: c.quantity,
          priceLKR: c.item.salePriceLKR || c.item.priceLKR,
          regularPriceLKR: c.item.regularPriceLKR,
          imageUrl: c.item.images[0] || ''
        })),
        totalAmountLKR: cartTotal,
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === 'cod' ? 'cod_pending' : 'pending_verification',
        bankSlipUrl: bankSlipBase64,
        bankReference: bankReference.trim(),
        status: 'order_received',
        orderStatus: 'pending',
        createdAt: new Date().toISOString()
      };

      await saveOrderToFirestore(newOrder);

      setCompletedOrder(newOrder);
      clearCart();
      setStep('success');
    } catch (err) {
      console.error('Error placing order:', err);
      alert('ඇණවුම සම්පූර්ණ කිරීමේදී දෝෂයක් ඇතිවිය. කරුණාකර නැවත උත්සාහ කරන්න.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity"
        onClick={closeCartDrawer}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900 leading-tight">
                  {step === 'checkout'
                    ? language === 'si'
                      ? 'ඇණවුම් තොරතුරු සහ ගෙවීම'
                      : 'Delivery & Payment'
                    : step === 'success'
                    ? language === 'si'
                      ? 'ඇණවුම සාර්ථකයි!'
                      : 'Order Confirmed!'
                    : language === 'si'
                    ? 'ඔබගේ කරත්තය (Cart)'
                    : 'Shopping Cart'}
                </h2>
                <p className="text-xs text-slate-500">
                  {cartCount} {cartCount === 1 ? 'item' : 'items'} in your cart
                </p>
              </div>
            </div>

            <button
              onClick={closeCartDrawer}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5">
            {/* STEP 1: CART ITEMS LIST */}
            {step === 'cart' && (
              <>
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                    <div className="w-20 h-20 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                      <ShoppingBag className="w-10 h-10 opacity-60" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-base font-bold text-slate-800">
                        {language === 'si' ? 'ඔබගේ කරත්තය හිස්ය' : 'Your Cart is Empty'}
                      </h3>
                      <p className="text-xs text-slate-500 max-w-xs">
                        {language === 'si'
                          ? 'වෛද්‍ය උපකරණ ගවේෂණය කර පහසුවෙන් මිලදී ගැනීමට කරත්තයට එකතු කරන්න.'
                          : 'Explore our medical catalog and add hospital beds, wheelchairs, and recovery supplies.'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        closeCartDrawer();
                        router.push('/store');
                      }}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                    >
                      {language === 'si' ? 'වෙළඳසැලට යන්න' : 'Browse Medical Store'}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Items List */}
                    <div className="space-y-3">
                      {cart.map((cartItem) => {
                        const { item, quantity } = cartItem;
                        const title = language === 'si' && item.name.si ? item.name.si : item.name.en;
                        const price = item.salePriceLKR || item.priceLKR;
                        const regular = item.regularPriceLKR;

                        return (
                          <div
                            key={item.id}
                            className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex gap-3 group"
                          >
                            {/* Product Thumbnail */}
                            <div className="w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100 relative">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={item.images[0]}
                                alt={title}
                                className="w-full h-full object-cover"
                              />
                              {item.discountPercentage && item.discountPercentage > 0 ? (
                                <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-rose-600 text-[9px] font-black text-white">
                                  -{item.discountPercentage}%
                                </span>
                              ) : null}
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0 flex flex-col justify-between">
                              <div>
                                <h4 className="text-xs sm:text-[13px] font-bold text-slate-900 leading-snug line-clamp-2">
                                  {title}
                                </h4>
                                <div className="flex items-baseline gap-2 mt-1">
                                  <span className="text-sm font-black text-blue-600">
                                    LKR {price.toLocaleString()}
                                  </span>
                                  {regular && regular > price && (
                                    <span className="text-xs text-slate-400 line-through">
                                      LKR {regular.toLocaleString()}
                                    </span>
                                  )}
                                </div>
                              </div>

                              {/* Quantity Stepper & Remove */}
                              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                                <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-slate-50">
                                  <button
                                    onClick={() => updateQuantity(item.id, quantity - 1)}
                                    className="p-1 px-2 hover:bg-slate-200 text-slate-600 cursor-pointer"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="px-2.5 text-xs font-bold text-slate-800">
                                    {quantity}
                                  </span>
                                  <button
                                    onClick={() => updateQuantity(item.id, quantity + 1)}
                                    className="p-1 px-2 hover:bg-slate-200 text-slate-600 cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>

                                <button
                                  onClick={() => removeFromCart(item.id)}
                                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Remove item"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Savings Highlight */}
                    {cartSavings > 0 && (
                      <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 flex items-center justify-between text-xs">
                        <span className="font-semibold flex items-center gap-1.5">
                          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                          {language === 'si' ? 'ඔබගේ ඉතිරිය (Savings):' : 'Total Discount Savings:'}
                        </span>
                        <span className="font-black text-emerald-700">
                          - LKR {cartSavings.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {/* STEP 2: CHECKOUT FORM */}
            {step === 'checkout' && (
              <form onSubmit={handlePlaceOrder} className="space-y-4">
                <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-200/60 text-xs text-blue-900 flex items-center justify-between">
                  <span>
                    {user
                      ? language === 'si'
                        ? 'ඔබගේ Profile තොරතුරු ස්වයංක්‍රීයව එක්විය.'
                        : 'Auto-filled from your profile.'
                      : language === 'si'
                      ? 'අමුත්තෙකු ලෙස ඇණවුම සම්පූර්ණ කරන්න'
                      : 'Ordering as Guest'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setStep('cart')}
                    className="text-blue-700 font-bold hover:underline cursor-pointer"
                  >
                    {language === 'si' ? 'කරත්තය බලන්න' : 'Edit Cart'}
                  </button>
                </div>

                {/* Delivery Information */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    1. {language === 'si' ? 'භාරගන්නාගේ තොරතුරු' : 'Customer & Delivery Info'}
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'si' ? 'සම්පූර්ණ නම *' : 'Full Name *'}
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="e.g. Nimesha Sampath"
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'si' ? 'දුරකථන අංකය *' : 'Phone Number *'}
                    </label>
                    <input
                      type="tel"
                      required
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="077 123 4567"
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'si' ? 'බෙදාහැරීමේ ලිපිනය *' : 'Delivery Address *'}
                    </label>
                    <textarea
                      required
                      rows={2}
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Street address, building, city"
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      {language === 'si' ? 'දිස්ත්‍රික්කය *' : 'District *'}
                    </label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {districtList.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Payment Method Selection */}
                <div className="space-y-3 pt-2 border-t border-slate-200">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    2. {language === 'si' ? 'ගෙවීම් ක්‍රමය තෝරන්න (Payment Method)' : 'Payment Method'}
                  </h3>

                  <div className="grid grid-cols-1 gap-2.5">
                    {/* Cash on Delivery */}
                    <label
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                        paymentMethod === 'cod'
                          ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="mt-0.5 text-blue-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-slate-900">
                          <Banknote className="w-4 h-4 text-emerald-600" />
                          <span>
                            {language === 'si'
                              ? 'භාණ්ඩ ලැබුණු පසු මුදල් ගෙවීම (Cash on Delivery)'
                              : 'Cash on Delivery (COD)'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          {language === 'si'
                            ? 'භාණ්ඩය නිවසටම ලැබී පරීක්ෂා කිරීමෙන් පසු මුදල් ලබාදෙන්න.'
                            : 'Pay cash to the delivery officer after inspecting your medical equipment.'}
                        </p>
                      </div>
                    </label>

                    {/* Bank Transfer */}
                    <label
                      onClick={() => setPaymentMethod('bank_transfer')}
                      className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                        paymentMethod === 'bank_transfer'
                          ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                          : 'border-slate-200 bg-white hover:bg-slate-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'bank_transfer'}
                        onChange={() => setPaymentMethod('bank_transfer')}
                        className="mt-0.5 text-blue-600"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 font-bold text-xs sm:text-sm text-slate-900">
                          <Landmark className="w-4 h-4 text-blue-600" />
                          <span>
                            {language === 'si' ? 'බැංකු තැන්පතු (Bank Transfer)' : 'Bank Transfer'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
                          {language === 'si'
                            ? 'අපගේ බැංකු ගිණුමට මුදල් තැන්පත් කර රිසිට්පත එවන්න.'
                            : 'Direct bank transfer / online banking to our company bank account.'}
                        </p>
                      </div>
                    </label>
                  </div>

                  {/* Bank Transfer Account Details Box */}
                  {paymentMethod === 'bank_transfer' && (
                    <div className="p-3.5 rounded-xl bg-slate-900 text-white space-y-2 text-xs">
                      <div className="flex items-center justify-between pb-1.5 border-b border-slate-700">
                        <span className="font-bold text-blue-400">
                          Prime Life Care Company Account
                        </span>
                        <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">
                          Commercial Bank
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <span className="text-slate-400 block">Bank:</span>
                          <span className="font-semibold">Commercial Bank</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Branch:</span>
                          <span className="font-semibold">Colombo 03 (Colpetty)</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Account Name:</span>
                          <span className="font-semibold">Prime Life Care (Pvt) Ltd</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">Account Number:</span>
                          <span className="font-mono font-bold text-amber-300">1000 548 920</span>
                        </div>
                      </div>

                      {/* Optional Bank Slip / Ref */}
                      <div className="pt-2 border-t border-slate-700 space-y-2">
                        <div>
                          <label className="text-[11px] text-slate-300 block mb-1">
                            {language === 'si'
                              ? 'ගනුදෙනු අංකය (Transaction Reference - විකල්ප):'
                              : 'Transaction Reference (Optional):'}
                          </label>
                          <input
                            type="text"
                            value={bankReference}
                            onChange={(e) => setBankReference(e.target.value)}
                            placeholder="e.g. TXN-948102"
                            className="w-full px-2.5 py-1.5 text-xs rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none"
                          />
                        </div>

                        <div>
                          <label className="text-[11px] text-slate-300 block mb-1">
                            {language === 'si'
                              ? 'රිසිට්පතේ ඡායාරූපය (Bank Slip - විකල්ප):'
                              : 'Upload Bank Slip / Screenshot (Optional):'}
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="w-full text-xs text-slate-300 file:mr-2 file:py-1 file:px-2.5 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-blue-600 file:text-white cursor-pointer"
                          />
                          {bankSlipBase64 && (
                            <p className="text-[10px] text-emerald-400 mt-1">
                              ✓ Slip image attached
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  {isSubmitting ? (
                    <span>{language === 'si' ? 'සැකසෙමින් පවතී...' : 'Processing Order...'}</span>
                  ) : (
                    <>
                      <span>
                        {language === 'si'
                          ? `රු. ${cartTotal.toLocaleString()} ක් ගෙවා ඇණවුම තහවුරු කරන්න`
                          : `Confirm Order (LKR ${cartTotal.toLocaleString()})`}
                      </span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* STEP 3: ORDER SUCCESS CONFIRMATION */}
            {step === 'success' && completedOrder && (
              <div className="py-6 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-black text-slate-900">
                    {language === 'si' ? 'ඇණවුම සාර්ථකව භාරගන්නා ලදී!' : 'Order Placed Successfully!'}
                  </h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    {language === 'si'
                      ? 'අපගේ ප්‍රවාහන අංශය පැය 2-24ක් තුළ ඔබව අමතා බෙදාහැරීම තහවුරු කරනු ඇත.'
                      : 'Our dispatch team will contact you shortly to confirm express delivery.'}
                  </p>
                </div>

                {/* Order Code Box */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500 font-semibold">
                      {language === 'si' ? 'ඇණවුම් කේතය (Order Code):' : 'Order Tracking Code:'}
                    </span>
                    <button
                      onClick={() => copyToClipboard(completedOrder.orderCode)}
                      className="text-xs text-blue-600 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                    >
                      {copiedCode ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedCode ? 'Copied!' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="text-base font-black text-slate-900 font-mono tracking-wider">
                    {completedOrder.orderCode}
                  </div>
                  <div className="text-xs text-slate-600 pt-1 border-t border-slate-200/80 flex justify-between">
                    <span>{language === 'si' ? 'ගෙවීම් ක්‍රමය:' : 'Payment:'}</span>
                    <span className="font-bold uppercase text-slate-800">
                      {completedOrder.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Bank Transfer'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 flex justify-between">
                    <span>{language === 'si' ? 'මුළු මුදල:' : 'Total Amount:'}</span>
                    <span className="font-black text-blue-600">
                      LKR {completedOrder.totalAmountLKR.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => {
                      closeCartDrawer();
                      router.push('/profile?tab=orders');
                    }}
                    className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                  >
                    {language === 'si'
                      ? 'ඇණවුම Profile එකෙන් පරීක්ෂා කරන්න (Track Order)'
                      : 'Track in Profile & Orders'}
                  </button>

                  <button
                    onClick={() => {
                      closeCartDrawer();
                      router.push('/store');
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-all cursor-pointer"
                  >
                    {language === 'si' ? 'තවත් භාණ්ඩ බලන්න' : 'Continue Shopping'}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer Subtotal & Action Bar (When in Cart step) */}
          {step === 'cart' && cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-3">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{language === 'si' ? 'සාමාන්‍ය වටිනාකම' : 'Regular Total'}:</span>
                  <span className="line-through">LKR {cartRegularTotal.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm sm:text-base font-black text-slate-900">
                  <span>{language === 'si' ? 'ගෙවිය යුතු මුදල' : 'Subtotal'}:</span>
                  <span className="text-blue-600">LKR {cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Truck className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span>
                    {language === 'si'
                      ? 'කොළඹ ඇතුළු දිවයින පුරා නොමිලේ ප්‍රවාහනය සහ සවි කිරීම'
                      : 'Islandwide delivery & bedside assembly included'}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setStep('checkout')}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <span>
                  {language === 'si' ? 'මිලදී ගැනීමට යන්න (Proceed to Checkout)' : 'Proceed to Checkout'}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
