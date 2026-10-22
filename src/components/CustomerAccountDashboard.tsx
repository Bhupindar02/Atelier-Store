'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import type { Session } from '@/lib/auth';
import type { SerializedCustomerOrder } from '@/types/orders';
import SignOutButton from '@/components/SignOutButton';

interface CustomerAccountDashboardProps {
  initialSession: Session;
  isUnauthorizedAdmin?: boolean;
  isUnauthorizedOrder?: boolean;
  initialOrders?: SerializedCustomerOrder[];
  initialTab?: TabType;
}

type TabType = 'orders' | 'profile' | 'preferences' | 'security';

export default function CustomerAccountDashboard({
  initialSession,
  isUnauthorizedAdmin = false,
  isUnauthorizedOrder = false,
  initialOrders = [],
  initialTab,
}: CustomerAccountDashboardProps) {
  const router = useRouter();

  // Active navigation tab — default to 'orders' if orders exist or if requested, otherwise 'profile'
  const [activeTab, setActiveTab] = useState<TabType>(
    initialTab || (initialOrders && initialOrders.length > 0 ? 'orders' : 'profile')
  );

  // Orders state
  const [orders, setOrders] = useState<SerializedCustomerOrder[]>(initialOrders);
  const [isRefreshingOrders, setIsRefreshingOrders] = useState(false);
  const [refreshError, setRefreshError] = useState('');
  const [expandedOrderIds, setExpandedOrderIds] = useState<Record<string, boolean>>({});
  const [orderFilter, setOrderFilter] = useState<'all' | 'paid' | 'pending' | 'failed'>('all');
  const [copiedOrderNumber, setCopiedOrderNumber] = useState<string | null>(null);

  // Customer state
  const [userName, setUserName] = useState(initialSession.user.name || '');
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(initialSession.user.name || '');
  const [isSavingName, setIsSavingName] = useState(false);
  const [nameSaveSuccess, setNameSaveSuccess] = useState(false);
  const [nameError, setNameError] = useState('');

  // Preferences state
  const [preferredSalon, setPreferredSalon] = useState('paris');
  const [sizingStandard, setSizingStandard] = useState('eu');
  const [notifyRunway, setNotifyRunway] = useState(true);
  const [notifyMadeToOrder, setNotifyMadeToOrder] = useState(true);
  const [notifyPrivateInvitations, setNotifyPrivateInvitations] = useState(false);
  const [preferencesSaved, setPreferencesSaved] = useState(false);

  // Security actions state
  const [isRevokingSessions, setIsRevokingSessions] = useState(false);
  const [revokeSuccessMessage, setRevokeSuccessMessage] = useState('');
  const [copiedId, setCopiedId] = useState<'client' | 'session' | null>(null);

  const isAdmin = initialSession.user.role === 'admin';

  const memberSince = initialSession.user.createdAt
    ? new Intl.DateTimeFormat('en-US', {
        month: 'long',
        year: 'numeric',
      }).format(new Date(initialSession.user.createdAt))
    : 'Privileged Client';

  // Extract initials for the client monogram crest
  const initials = (userName || initialSession.user.email || 'MA')
    .split(' ')
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Handle Name Update via Better Auth client
  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setNameError('');
    if (!nameInput.trim()) {
      setNameError('Please enter a valid name.');
      return;
    }

    setIsSavingName(true);
    try {
      const res = await authClient.updateUser({
        name: nameInput.trim(),
      });

      if (res.error) {
        setNameError(res.error.message || 'Failed to update name.');
      } else {
        setUserName(nameInput.trim());
        setIsEditingName(false);
        setNameSaveSuccess(true);
        setTimeout(() => setNameSaveSuccess(false), 3000);
        router.refresh();
      }
    } catch {
      setNameError('An unexpected error occurred while updating profile.');
    } finally {
      setIsSavingName(false);
    }
  };

  // Handle Revoking Other Sessions via endpoint
  const handleRevokeOtherSessions = async () => {
    setIsRevokingSessions(true);
    setRevokeSuccessMessage('');
    try {
      const response = await fetch('/api/auth/revoke-other-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setRevokeSuccessMessage('All other active browser and mobile sessions have been terminated.');
        setTimeout(() => setRevokeSuccessMessage(''), 4000);
      } else {
        setRevokeSuccessMessage('Could not revoke sessions at this moment.');
      }
    } catch {
      setRevokeSuccessMessage('Connection error during session revocation.');
    } finally {
      setIsRevokingSessions(false);
    }
  };

  const handleCopy = (text: string, type: 'client' | 'session') => {
    navigator.clipboard.writeText(text);
    setCopiedId(type);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSavePreferences = (e: React.FormEvent) => {
    e.preventDefault();
    setPreferencesSaved(true);
    setTimeout(() => setPreferencesSaved(false), 3000);
  };

  const toggleOrderExpand = (id: string) => {
    setExpandedOrderIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyOrderNumber = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedOrderNumber(num);
    setTimeout(() => setCopiedOrderNumber(null), 2000);
  };

  const handleRefreshOrders = async () => {
    setIsRefreshingOrders(true);
    setRefreshError('');
    try {
      const res = await fetch('/api/account/orders');
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setOrders(data.orders);
      } else {
        setRefreshError(data.message || 'Could not refresh orders at this time.');
      }
    } catch {
      setRefreshError('Network error while retrieving order ledger.');
    } finally {
      setIsRefreshingOrders(false);
    }
  };

  const formatOrderDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
      }).format(date);
    } catch {
      return isoString;
    }
  };

  const settledOrdersCount = orders.filter((o) => o.paymentStatus === 'paid').length;
  const settledTotalCents = orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.totalCents, 0);

  const filteredOrders = orders.filter((order) => {
    if (orderFilter === 'paid') return order.paymentStatus === 'paid';
    if (orderFilter === 'pending')
      return order.paymentStatus === 'unpaid' || order.paymentStatus === 'pending';
    if (orderFilter === 'failed')
      return order.paymentStatus === 'failed' || order.status === 'cancelled';
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {/* Top Breadcrumb Navigation */}
      <div className="flex items-center justify-between text-xs pb-4 border-b border-[#e8e3db]">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] font-medium text-[#787065] hover:text-[#1a1714] transition-colors"
        >
          <span>←</span>
          <span>Boutique Catalog</span>
        </Link>
        <div className="flex items-center gap-4 text-[10px] uppercase tracking-[0.18em] text-[#8e857b]">
          <span>Maison Atelier Client Portal</span>
          <span className="opacity-40">|</span>
          <span className="text-[#1a1714] font-medium">Session Active</span>
        </div>
      </div>

      {/* Unauthorized Admin Notice */}
      {isUnauthorizedAdmin && (
        <div className="p-5 bg-[#fff3f2] border-l-2 border-[#a11826] text-[#a11826] flex items-start gap-4 animate-fadeIn">
          <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 6.75h.008v.008H12v-.008Z" />
          </svg>
          <div className="space-y-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider">Administrative Access Restricted</h4>
            <p className="text-xs text-[#7c1d28] font-light leading-relaxed">
              Your account is registered as a valued Client. Administrative console access is reserved for accounts with verified Atelier Administrator roles.
            </p>
          </div>
        </div>
      )}

      {/* Unauthorized Order Notice */}
      {isUnauthorizedOrder && (
        <div className="p-5 bg-[#fff3f2] border-l-2 border-[#a11826] text-[#a11826] flex items-start gap-4 animate-fadeIn">
          <svg className="w-5 h-5 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="1.5" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 6.75h.008v.008H12v-.008Z" />
          </svg>
          <div className="space-y-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider">Acquisition Record Restricted</h4>
            <p className="text-xs text-[#7c1d28] font-light leading-relaxed">
              The requested order dossier belongs to a different client profile or could not be found. Only orders authenticated to your account are accessible.
            </p>
          </div>
        </div>
      )}

      {/* Main Client Profile Hero Header */}
      <div className="bg-white border border-[#e8e3db] p-8 sm:p-12 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-8 border-b border-[#e8e3db]">
          <div className="flex items-center gap-5 sm:gap-6">
            {/* Monogram Crest Avatar */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[#1a1714] text-[#d4af6a] border border-[#d4af6a]/40 flex items-center justify-center font-serif text-xl sm:text-2xl font-light tracking-wider shrink-0 shadow-inner">
              {initials}
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center gap-3">
                <span className="text-[9px] tracking-[0.3em] uppercase font-semibold text-[#8e857b]">
                  MAISON ATELIER
                </span>
                <span className={`text-[8px] tracking-[0.2em] uppercase px-2.5 py-0.5 font-mono ${
                  isAdmin
                    ? 'bg-[#1a1714] text-[#d4af6a] border border-[#d4af6a]/40 font-semibold'
                    : 'bg-[#faf9f7] text-[#3a3530] border border-[#d6cfc5]'
                }`}>
                  {isAdmin ? 'ADMINISTRATOR' : 'PRIVILEGED CLIENT'}
                </span>
              </div>
              <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-light text-[#1a1714]">
                {userName || 'Valued Client'}
              </h1>
              <p className="text-xs text-[#787065] font-light">
                Client Member since {memberSince} · {initialSession.user.email}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start md:self-center">
            {isAdmin && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1a1714] text-[#d4af6a] text-[10px] uppercase tracking-[0.2em] font-medium border border-[#d4af6a]/50 hover:bg-[#a11826] hover:text-white transition-colors"
              >
                <span>Admin Console</span>
                <span className="text-xs">→</span>
              </Link>
            )}
            <SignOutButton />
          </div>
        </div>

        {/* Quick VIP Stats Bar */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
          <div className="space-y-1">
            <span className="text-[9px] uppercase tracking-[0.2em] text-[#8e857b] font-medium">
              Client Status
            </span>
            <p className="text-sm font-medium text-[#1a1714]">Circle of Patrons</p>
            <p className="text-xs text-[#787065] font-light">Haute Maroquinerie Tier</p>
          </div>
          <div className="space-y-1">
            <span className="text-[9px] uppercase tracking-[0.2em] text-[#8e857b] font-medium">
              Salon Concierge Liaison
            </span>
            <p className="text-sm font-medium text-[#1a1714]">Rue Saint-Honoré</p>
            <p className="text-xs text-[#787065] font-light">Direct Private Line Active</p>
          </div>
          <div className="space-y-1">
            <span className="text-[9px] uppercase tracking-[0.2em] text-[#8e857b] font-medium">
              Archival Acquisitions
            </span>
            <p className="text-sm font-medium text-[#1a1714] font-mono">
              {orders.length} {orders.length === 1 ? 'Record' : 'Records'}
            </p>
            <p className="text-xs text-[#787065] font-light">
              {settledOrdersCount} Certified & Settled
            </p>
          </div>
          <div className="space-y-1">
            <span className="text-[9px] uppercase tracking-[0.2em] text-[#8e857b] font-medium">
              Portfolio Settlement
            </span>
            <p className="text-sm font-medium text-[#1a1714] font-mono">
              ${(settledTotalCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
            </p>
            <p className="text-xs text-[#787065] font-light">Authoritative Ledger Total</p>
          </div>
        </div>
      </div>

      {/* Account Navigation Tabs */}
      <div className="border-b border-[#e8e3db] flex items-center gap-2 sm:gap-6 text-xs uppercase tracking-[0.18em] font-medium overflow-x-auto scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`py-3.5 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
            activeTab === 'orders'
              ? 'border-[#1a1714] text-[#1a1714] font-semibold'
              : 'border-transparent text-[#787065] hover:text-[#1a1714]'
          }`}
        >
          <span>Acquisitions & Orders</span>
          {orders.length > 0 && (
            <span className="px-1.5 py-0.5 text-[9px] bg-[#1a1714] text-white font-mono rounded-full">
              {orders.length}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`py-3.5 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'profile'
              ? 'border-[#1a1714] text-[#1a1714] font-semibold'
              : 'border-transparent text-[#787065] hover:text-[#1a1714]'
          }`}
        >
          <span>Profile & Credentials</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('preferences')}
          className={`py-3.5 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'preferences'
              ? 'border-[#1a1714] text-[#1a1714] font-semibold'
              : 'border-transparent text-[#787065] hover:text-[#1a1714]'
          }`}
        >
          <span>Atelier Concierge & Salons</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={`py-3.5 px-3 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'security'
              ? 'border-[#1a1714] text-[#1a1714] font-semibold'
              : 'border-transparent text-[#787065] hover:text-[#1a1714]'
          }`}
        >
          <span>Security & Sessions</span>
        </button>

        {isAdmin && (
          <Link
            href="/admin"
            className="py-3.5 px-3 text-[#d4af6a] hover:text-[#8c6d32] transition-colors whitespace-nowrap font-semibold ml-auto flex items-center gap-1.5"
          >
            <span>Executive Console</span>
            <span className="text-xs">↗</span>
          </Link>
        )}
      </div>

      {/* ── TAB: ACQUISITIONS & ORDER HISTORY ── */}
      {activeTab === 'orders' && (
        <div className="space-y-8 animate-fadeIn">
          {refreshError && (
            <div className="p-4 bg-[#fff3f2] border-l-2 border-[#a11826] text-[#a11826] text-xs font-light flex items-center justify-between">
              <span>{refreshError}</span>
              <button
                type="button"
                onClick={() => setRefreshError('')}
                className="text-xs uppercase tracking-wider text-[#a11826] hover:underline cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Section Header Card */}
          <div className="bg-white border border-[#e8e3db] p-8 sm:p-10 shadow-[0_2px_16px_rgba(0,0,0,0.02)] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#e8e3db]">
              <div>
                <span className="text-[9px] tracking-[0.3em] uppercase font-semibold text-[#8e857b] block mb-1">
                  CLIENT ARCHIVES · PROVENANCE LEDGER
                </span>
                <h2 className="font-serif text-2xl sm:text-3xl font-light text-[#1a1714]">
                  Acquisitions & Order History
                </h2>
                <p className="text-xs text-[#787065] font-light mt-1">
                  Every certified piece purchased through your authenticated account is recorded with permanent cryptographic provenance.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleRefreshOrders}
                  disabled={isRefreshingOrders}
                  className="px-4 py-2 bg-[#faf9f7] border border-[#d6cfc5] text-[#1a1714] text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-[#1a1714] hover:text-white transition-colors disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  <span className={isRefreshingOrders ? 'animate-spin' : ''}>↻</span>
                  <span>{isRefreshingOrders ? 'Syncing…' : 'Refresh Ledger'}</span>
                </button>
              </div>
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#8e857b] mr-2">Filter:</span>
              <button
                type="button"
                onClick={() => setOrderFilter('all')}
                className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] font-mono transition-colors cursor-pointer ${
                  orderFilter === 'all'
                    ? 'bg-[#1a1714] text-white font-medium'
                    : 'bg-[#faf9f7] text-[#5c544d] border border-[#e8e3db] hover:border-[#1a1714]'
                }`}
              >
                All ({orders.length})
              </button>
              <button
                type="button"
                onClick={() => setOrderFilter('paid')}
                className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] font-mono transition-colors cursor-pointer ${
                  orderFilter === 'paid'
                    ? 'bg-[#166534] text-white font-medium'
                    : 'bg-[#faf9f7] text-[#5c544d] border border-[#e8e3db] hover:border-[#166534]'
                }`}
              >
                Certified & Paid ({orders.filter((o) => o.paymentStatus === 'paid').length})
              </button>
              <button
                type="button"
                onClick={() => setOrderFilter('pending')}
                className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] font-mono transition-colors cursor-pointer ${
                  orderFilter === 'pending'
                    ? 'bg-[#92400e] text-white font-medium'
                    : 'bg-[#faf9f7] text-[#5c544d] border border-[#e8e3db] hover:border-[#92400e]'
                }`}
              >
                Pending Clearance ({orders.filter((o) => o.paymentStatus === 'unpaid' || o.paymentStatus === 'pending').length})
              </button>
              <button
                type="button"
                onClick={() => setOrderFilter('failed')}
                className={`px-3 py-1.5 text-[10px] uppercase tracking-[0.16em] font-mono transition-colors cursor-pointer ${
                  orderFilter === 'failed'
                    ? 'bg-[#991b1b] text-white font-medium'
                    : 'bg-[#faf9f7] text-[#5c544d] border border-[#e8e3db] hover:border-[#991b1b]'
                }`}
              >
                Incomplete ({orders.filter((o) => o.paymentStatus === 'failed' || o.status === 'cancelled').length})
              </button>
            </div>
          </div>

          {/* Empty State */}
          {filteredOrders.length === 0 ? (
            <div className="bg-white border border-[#e8e3db] p-12 text-center space-y-6 shadow-sm">
              <div className="w-16 h-16 mx-auto rounded-full bg-[#faf9f7] border border-[#d4af6a] text-[#d4af6a] flex items-center justify-center font-serif text-2xl">
                ✦
              </div>
              <div className="space-y-2 max-w-md mx-auto">
                <span className="text-[9px] uppercase tracking-[0.3em] font-medium text-[#8e857b] block">
                  ARCHIVAL DOSSIER EMPTY
                </span>
                <h3 className="font-serif text-2xl font-light text-[#1a1714]">
                  {orders.length === 0 ? 'No Archival Acquisitions Recorded' : 'No Acquisitions Match Filter'}
                </h3>
                <p className="text-xs text-[#787065] font-light leading-relaxed">
                  {orders.length === 0
                    ? 'All creations commissioned or acquired while signed in to your Maison Atelier account will be permanently certified and cataloged in this private archival dossier.'
                    : 'There are no acquisition records matching your selected status filter.'}
                </p>
              </div>
              <div className="pt-2 flex justify-center gap-4">
                {orders.length === 0 ? (
                  <Link
                    href="/collections"
                    className="px-6 py-3 bg-[#1a1714] text-white text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-[#a11826] transition-colors"
                  >
                    Explore Boutique Catalog →
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => setOrderFilter('all')}
                    className="px-6 py-2.5 bg-[#1a1714] text-white text-[10px] uppercase tracking-[0.2em] font-medium cursor-pointer"
                  >
                    Show All Acquisitions
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order) => {
                const isPaid = order.paymentStatus === 'paid';
                const isPending = order.paymentStatus === 'unpaid' || order.paymentStatus === 'pending';
                const isFailed = order.paymentStatus === 'failed' || order.status === 'cancelled';
                const isExpanded = Boolean(expandedOrderIds[order.id]);
                const itemCount = order.items.reduce((acc, i) => acc + i.quantity, 0);

                return (
                  <div
                    key={order.id}
                    className="bg-white border border-[#e8e3db] shadow-sm transition-all hover:border-[#d6cfc5] overflow-hidden"
                  >
                    {/* Top Order Summary Card Header */}
                    <div className="p-6 sm:p-8 space-y-4">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e8e3db]">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] uppercase tracking-[0.25em] text-[#8e857b] font-mono">
                              Deed Reference:
                            </span>
                            <span className="font-mono text-sm font-semibold text-[#1a1714]">
                              {order.orderNumber}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleCopyOrderNumber(order.orderNumber)}
                              title="Copy Reference"
                              className="text-xs text-[#8e857b] hover:text-[#1a1714] cursor-pointer"
                            >
                              {copiedOrderNumber === order.orderNumber ? '✓ Copied' : '⧉'}
                            </button>
                          </div>
                          <p className="text-xs text-[#787065] font-light">
                            Recorded on {formatOrderDate(order.createdAt)}
                          </p>
                        </div>

                        {/* Status Badges & Total */}
                        <div className="flex flex-wrap items-center gap-3">
                          {/* Payment status badge */}
                          {isPaid ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#f0fdf4] border border-[#16a34a]/30 text-[#166534] text-[10px] uppercase tracking-widest font-mono font-medium">
                              <span>✓</span>
                              <span>Payment Certified</span>
                            </span>
                          ) : isPending ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#fffbeb] border border-[#f59e0b]/40 text-[#92400e] text-[10px] uppercase tracking-widest font-mono font-medium">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#d97706] animate-pulse" />
                              <span>Pending Clearance</span>
                            </span>
                          ) : isFailed ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#fef2f2] border border-[#ef4444]/30 text-[#991b1b] text-[10px] uppercase tracking-widest font-mono font-medium">
                              <span>✕</span>
                              <span>Incomplete</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#faf9f7] border border-[#d6cfc5] text-[#5c544d] text-[10px] uppercase tracking-widest font-mono font-medium">
                              <span>{order.paymentStatus}</span>
                            </span>
                          )}

                          {/* Fulfillment status badge */}
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#faf9f7] border border-[#e8e3db] text-[#3a3530] text-[10px] uppercase tracking-widest font-mono">
                            <span>Status: {order.status}</span>
                          </span>

                          {/* Authoritative Total */}
                          <div className="text-right sm:pl-3 sm:border-l sm:border-[#e8e3db]">
                            <span className="text-[9px] uppercase tracking-wider text-[#8e857b] block font-mono">
                              Total Settled
                            </span>
                            <span className="font-mono text-base sm:text-lg font-semibold text-[#1a1714]">
                              ${(order.totalCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Items Preview Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
                        <div className="flex items-center gap-3 overflow-x-auto py-1">
                          {order.items.slice(0, 4).map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center gap-3 bg-[#faf9f7] border border-[#e8e3db] p-2 shrink-0 pr-3"
                            >
                              <div className="relative w-12 h-14 bg-[#f2ede6] border border-[#e8e3db] shrink-0 overflow-hidden">
                                {item.productSnapshot?.primaryImage ? (
                                  <Image
                                    src={item.productSnapshot.primaryImage}
                                    alt={item.productSnapshot.name}
                                    fill
                                    sizes="48px"
                                    className="object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-xs text-[#8e857b]">
                                    ✦
                                  </div>
                                )}
                              </div>
                              <div className="text-left space-y-0.5 max-w-[140px]">
                                <p className="font-serif text-xs text-[#1a1714] truncate font-light">
                                  {item.productSnapshot?.name}
                                </p>
                                <p className="text-[10px] text-[#787065] font-mono">
                                  Qty: {item.quantity} · {item.size}
                                </p>
                              </div>
                            </div>
                          ))}
                          {order.items.length > 4 && (
                            <span className="text-[10px] font-mono text-[#8e857b] px-2">
                              +{order.items.length - 4} more
                            </span>
                          )}
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            type="button"
                            onClick={() => toggleOrderExpand(order.id)}
                            className="px-3.5 py-2 bg-[#faf9f7] border border-[#d6cfc5] text-[#1a1714] text-[10px] uppercase tracking-[0.16em] font-medium hover:bg-[#1a1714] hover:text-white transition-colors cursor-pointer flex items-center gap-1.5"
                          >
                            <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
                            <span className="text-xs">{isExpanded ? '▴' : '▾'}</span>
                          </button>

                          <Link
                            href={`/account/orders/${order.id}`}
                            className="px-3.5 py-2 bg-[#1a1714] text-white text-[10px] uppercase tracking-[0.16em] font-medium hover:bg-[#a11826] transition-colors"
                          >
                            Dossier →
                          </Link>

                          <Link
                            href={`/checkout/success?order_id=${order.id}`}
                            className="p-2 border border-[#d6cfc5] text-[#5c544d] hover:text-[#1a1714] hover:border-[#1a1714] transition-colors text-xs"
                            title="Certificate of Acquisition"
                          >
                            📜
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Inline Expandable Details Accordion */}
                    {isExpanded && (
                      <div className="bg-[#faf9f7] border-t border-[#e8e3db] p-6 sm:p-8 space-y-6 animate-fadeIn">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs pb-6 border-b border-[#e8e3db]">
                          {/* Shipping Destination */}
                          <div>
                            <span className="text-[9px] uppercase tracking-[0.2em] text-[#8e857b] font-medium block mb-2">
                              Armored Courier Destination
                            </span>
                            {order.shippingAddress ? (
                              <div className="bg-white border border-[#e8e3db] p-4 text-[#3a3530] font-light space-y-0.5">
                                {order.shippingAddress.line1 && <p>{order.shippingAddress.line1}</p>}
                                {order.shippingAddress.line2 && <p>{order.shippingAddress.line2}</p>}
                                <p>
                                  {[
                                    order.shippingAddress.city,
                                    order.shippingAddress.state,
                                    order.shippingAddress.postalCode,
                                  ]
                                    .filter(Boolean)
                                    .join(', ')}
                                </p>
                                {order.shippingAddress.country && (
                                  <p className="font-mono uppercase text-[10px] text-[#787065]">
                                    {order.shippingAddress.country}
                                  </p>
                                )}
                              </div>
                            ) : (
                              <div className="bg-white border border-[#e8e3db] p-4 text-[#787065] italic">
                                White-glove concierge dispatch protocol.
                              </div>
                            )}
                          </div>

                          {/* Client Credentials & Settlement Ref */}
                          <div>
                            <span className="text-[9px] uppercase tracking-[0.2em] text-[#8e857b] font-medium block mb-2">
                              Dossier Reference & Settlement
                            </span>
                            <div className="bg-white border border-[#e8e3db] p-4 space-y-1.5 text-xs">
                              <p className="text-[#1a1714]">
                                Client: <strong className="font-medium">{order.customerName || userName}</strong>
                              </p>
                              <p className="text-[#5c544d] font-mono text-[11px]">
                                Email: {order.customerEmail}
                              </p>
                              {order.stripePaymentIntentId && (
                                <p className="text-[#8e857b] font-mono text-[10px] pt-1">
                                  Stripe PI: {order.stripePaymentIntentId}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Itemized breakdown table */}
                        <div className="space-y-3">
                          <span className="text-[9px] uppercase tracking-[0.2em] text-[#8e857b] font-medium block">
                            Allocated Pieces ({itemCount})
                          </span>

                          <div className="bg-white border border-[#e8e3db] divide-y divide-[#e8e3db]">
                            {order.items.map((item) => (
                              <div
                                key={item.id}
                                className="p-4 flex items-center justify-between gap-4"
                              >
                                <div className="flex items-center gap-4 min-w-0">
                                  <div className="relative w-14 h-16 bg-[#f2ede6] border border-[#e8e3db] shrink-0 overflow-hidden">
                                    {item.productSnapshot?.primaryImage ? (
                                      <Image
                                        src={item.productSnapshot.primaryImage}
                                        alt={item.productSnapshot.name}
                                        fill
                                        sizes="56px"
                                        className="object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-xs text-[#8e857b]">
                                        ✦
                                      </div>
                                    )}
                                  </div>
                                  <div className="space-y-0.5 min-w-0">
                                    <span className="text-[9px] uppercase tracking-wider text-[#8e857b] font-mono block">
                                      SKU: {item.productSnapshot?.sku} · Size: {item.size}
                                    </span>
                                    <h4 className="font-serif text-sm font-light text-[#1a1714] truncate">
                                      {item.productSnapshot?.name}
                                    </h4>
                                    {item.productSnapshot?.material && (
                                      <p className="text-xs text-[#787065] font-light">
                                        {item.productSnapshot.material}
                                        {item.productSnapshot.color ? ` · ${item.productSnapshot.color}` : ''}
                                      </p>
                                    )}
                                    <p className="text-[11px] text-[#5c544d] font-mono">
                                      {item.quantity} × ${(item.unitPriceCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                    </p>
                                  </div>
                                </div>

                                <div className="text-right shrink-0">
                                  <span className="font-mono text-sm font-semibold text-[#1a1714]">
                                    ${(item.lineTotalCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Breakdown summary */}
                        <div className="bg-white border border-[#e8e3db] p-4 text-xs space-y-2">
                          <div className="flex justify-between text-[#5c544d]">
                            <span>Subtotal</span>
                            <span className="font-mono text-[#1a1714]">
                              ${(order.subtotalCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </span>
                          </div>
                          <div className="flex justify-between text-[#5c544d]">
                            <span>White-Glove Armored Courier Delivery</span>
                            <span className="font-mono text-[#166534] font-medium">
                              {order.shippingFeeCents === 0
                                ? 'COMPLIMENTARY'
                                : `$${(order.shippingFeeCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
                            </span>
                          </div>
                          <div className="pt-2 border-t border-[#e8e3db] flex justify-between items-baseline font-semibold text-[#1a1714]">
                            <span>Total Settled</span>
                            <span className="font-mono text-base">
                              ${(order.totalCents / 100).toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── TAB 1: PROFILE & CREDENTIALS ── */}
      {activeTab === 'profile' && (
        <div className="space-y-8 animate-fadeIn">
          {nameSaveSuccess && (
            <div className="p-4 bg-[#f0f9f4] border-l-2 border-[#2d5a3c] text-[#2d5a3c] text-xs font-light flex items-center gap-2">
              <span>✓</span>
              <span>Client display name successfully updated in Maison Atelier records.</span>
            </div>
          )}

          {/* Credentials Card */}
          <div className="bg-white border border-[#e8e3db] p-8 sm:p-12 shadow-[0_2px_16px_rgba(0,0,0,0.02)] space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e8e3db]">
              <div>
                <span className="text-[9px] tracking-[0.3em] uppercase font-semibold text-[#8e857b] block mb-1">
                  CLIENT RECORD
                </span>
                <h2 className="font-serif text-2xl font-light text-[#1a1714]">
                  Personal Credentials & Identity
                </h2>
              </div>
              {!isEditingName && (
                <button
                  type="button"
                  onClick={() => {
                    setNameInput(userName);
                    setIsEditingName(true);
                  }}
                  className="self-start sm:self-auto text-[10px] uppercase tracking-[0.2em] font-medium text-[#1a1714] border border-[#d6cfc5] px-4 py-2 hover:bg-[#1a1714] hover:text-white transition-colors cursor-pointer"
                >
                  Edit Name
                </button>
              )}
            </div>

            {/* Editable Name Form */}
            {isEditingName ? (
              <form onSubmit={handleSaveName} className="p-6 bg-[#faf9f7] border border-[#e8e3db] space-y-4">
                <span className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#3a3530] block">
                  Update Registered Client Name
                </span>
                <div className="space-y-1.5">
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Full Name"
                    className="w-full bg-white border border-[#d6cfc5] px-4 py-2.5 text-sm text-[#1a1714] focus:outline-none focus:border-[#1a1714]"
                  />
                  {nameError && (
                    <p className="text-[11px] text-[#a11826] font-light">{nameError}</p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="submit"
                    disabled={isSavingName}
                    className="px-5 py-2.5 bg-[#1a1714] text-white text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-[#a11826] transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    {isSavingName ? 'Updating…' : 'Save Changes'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditingName(false);
                      setNameError('');
                    }}
                    className="px-5 py-2.5 border border-[#d6cfc5] text-[10px] uppercase tracking-[0.2em] text-[#787065] hover:text-[#1a1714] transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : null}

            {/* Credentials Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-1.5">
                <span className="text-[10px] uppercase tracking-[0.18em] text-[#8e857b]">Registered Name</span>
                <p className="text-base text-[#1a1714] font-medium">{userName || 'Not Specified'}</p>
                <p className="text-xs text-[#787065] font-light">Official appellation on acquisition certificates</p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] uppercase tracking-[0.18em] text-[#8e857b]">Primary Email</span>
                <div className="flex items-center gap-2">
                  <p className="text-base text-[#1a1714] font-medium">{initialSession.user.email}</p>
                  <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 bg-[#f0f9f4] text-[#2d5a3c] border border-[#2d5a3c]/30 font-mono">
                    VERIFIED
                  </span>
                </div>
                <p className="text-xs text-[#787065] font-light">Primary dispatch channel for invoices & concierge notes</p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] uppercase tracking-[0.18em] text-[#8e857b]">Unique Client ID</span>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-[#787065] font-mono break-all">{initialSession.user.id}</p>
                  <button
                    type="button"
                    onClick={() => handleCopy(initialSession.user.id, 'client')}
                    className="text-[10px] uppercase tracking-wider text-[#a11826] hover:underline cursor-pointer shrink-0"
                  >
                    {copiedId === 'client' ? 'Copied ✓' : 'Copy'}
                  </button>
                </div>
                <p className="text-xs text-[#787065] font-light">Cryptographic ledger reference for client portfolio</p>
              </div>

              <div className="space-y-1.5">
                <span className="text-[10px] uppercase tracking-[0.18em] text-[#8e857b]">Membership Enactment</span>
                <p className="text-base text-[#1a1714] font-medium">{memberSince}</p>
                <p className="text-xs text-[#787065] font-light">Registered under Maison Atelier charter</p>
              </div>
            </div>
          </div>

          {/* VIP Patron Privileges Pillar */}
          <div className="bg-[#181714] text-[#f5f2eb] border border-[#2b2823] p-8 sm:p-12 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#2b2823]">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#d4af6a]" />
                  <span className="text-[9px] tracking-[0.3em] uppercase font-semibold text-[#d4af6a]">
                    PRIVILÈGES DE LA MAISON
                  </span>
                </div>
                <h3 className="font-serif text-2xl font-light text-white">
                  Circle of Patrons Tier
                </h3>
              </div>
              <span className="text-xs font-mono text-[#d4af6a] uppercase tracking-widest px-3 py-1 border border-[#d4af6a]/40 self-start sm:self-auto">
                TIER I ACTIVE
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-2 text-xs">
              <div className="space-y-2 p-4 bg-[#201e19] border border-[#2e2a24]">
                <h4 className="text-[11px] uppercase tracking-wider font-semibold text-[#d4af6a]">
                  ✦ Archival Runway Previews
                </h4>
                <p className="text-[#a0978d] font-light leading-relaxed">
                  First-access reservation window for numbered, limited made-to-order runway debuts 48 hours prior to public release.
                </p>
              </div>

              <div className="space-y-2 p-4 bg-[#201e19] border border-[#2e2a24]">
                <h4 className="text-[11px] uppercase tracking-wider font-semibold text-[#d4af6a]">
                  ✦ Bespoke Hot-Stamping & Patina
                </h4>
                <p className="text-[#a0978d] font-light leading-relaxed">
                  Complimentary initials foil-stamping and custom Tuscan patina enhancement on all artisanal leather goods.
                </p>
              </div>

              <div className="space-y-2 p-4 bg-[#201e19] border border-[#2e2a24]">
                <h4 className="text-[11px] uppercase tracking-wider font-semibold text-[#d4af6a]">
                  ✦ Armored White-Glove Logistics
                </h4>
                <p className="text-[#a0978d] font-light leading-relaxed">
                  Doorstep courier delivery with climate control and insured personal presentation across worldwide metropolises.
                </p>
              </div>

              <div className="space-y-2 p-4 bg-[#201e19] border border-[#2e2a24]">
                <h4 className="text-[11px] uppercase tracking-wider font-semibold text-[#d4af6a]">
                  ✦ Master Artisan Restoration
                </h4>
                <p className="text-[#a0978d] font-light leading-relaxed">
                  Lifetime leather rejuvenation and wax conditioning assessments provided at our Florentine and Parisian ateliers.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 2: ATELIER CONCIERGE & SALON PREFERENCES ── */}
      {activeTab === 'preferences' && (
        <div className="space-y-8 animate-fadeIn">
          {preferencesSaved && (
            <div className="p-4 bg-[#f0f9f4] border-l-2 border-[#2d5a3c] text-[#2d5a3c] text-xs font-light flex items-center gap-2">
              <span>✓</span>
              <span>Your salon liaison preferences and dispatch dispatches have been saved.</span>
            </div>
          )}

          {/* Assigned Salon Liaison Card */}
          <div className="bg-white border border-[#e8e3db] p-8 sm:p-12 shadow-[0_2px_16px_rgba(0,0,0,0.02)] space-y-6">
            <div>
              <span className="text-[9px] tracking-[0.3em] uppercase font-semibold text-[#8e857b] block mb-1">
                LIAISON PRIVÉE
              </span>
              <h2 className="font-serif text-2xl font-light text-[#1a1714]">
                Assigned Personal Salon Concierge
              </h2>
            </div>

            <div className="p-6 bg-[#faf9f7] border border-[#e8e3db] flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#1a1714] text-[#d4af6a] font-serif flex items-center justify-center text-lg font-light shrink-0">
                  VS
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-sm font-medium text-[#1a1714]">
                    Madame Vivienne de Saint-Germain
                  </h4>
                  <p className="text-xs text-[#787065] font-light">
                    Senior Client Concierge · Rue Saint-Honoré Salon, Paris
                  </p>
                  <p className="text-[10px] text-[#a0978d] font-mono">
                    Direct Concierge Reference: VDG-PAR-09
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <a
                  href="tel:+33142680000"
                  className="px-4 py-2 border border-[#d6cfc5] text-[10px] uppercase tracking-[0.2em] text-[#1a1714] hover:bg-[#1a1714] hover:text-white transition-colors"
                >
                  Direct Telephone
                </a>
                <a
                  href="mailto:concierge@maison-atelier.com"
                  className="px-4 py-2 bg-[#1a1714] text-white text-[10px] uppercase tracking-[0.2em] hover:bg-[#a11826] transition-colors"
                >
                  Private Dispatch
                </a>
              </div>
            </div>
          </div>

          {/* Preferences Form */}
          <form onSubmit={handleSavePreferences} className="bg-white border border-[#e8e3db] p-8 sm:p-12 shadow-[0_2px_16px_rgba(0,0,0,0.02)] space-y-8">
            <div>
              <span className="text-[9px] tracking-[0.3em] uppercase font-semibold text-[#8e857b] block mb-1">
                SALON APPOINTMENT & SIZING PROFILE
              </span>
              <h3 className="font-serif text-2xl font-light text-[#1a1714]">
                Fitting Salons & Correspondence
              </h3>
            </div>

            {/* Preferred Salon Boutique */}
            <div className="space-y-3 pt-4 border-t border-[#e8e3db]">
              <label className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#3a3530] block">
                Primary Boutique for Appointments & Pickup
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { id: 'paris', name: 'Paris Flagship', address: '12 Rue Saint-Honoré, 75001 Paris' },
                  { id: 'firenze', name: 'Firenze Atelier', address: "Via de' Tornabuoni 14, 50123 Firenze" },
                  { id: 'newyork', name: 'New York Salon', address: '740 Madison Avenue, NY 10065' },
                ].map((salon) => (
                  <label
                    key={salon.id}
                    className={`p-4 border cursor-pointer transition-all space-y-1 block ${
                      preferredSalon === salon.id
                        ? 'border-[#1a1714] bg-[#faf9f7] shadow-sm'
                        : 'border-[#e8e3db] hover:border-[#d6cfc5]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="salon"
                      value={salon.id}
                      checked={preferredSalon === salon.id}
                      onChange={() => setPreferredSalon(salon.id)}
                      className="sr-only"
                    />
                    <span className="text-xs font-medium text-[#1a1714] block">{salon.name}</span>
                    <span className="text-[11px] text-[#787065] font-light block leading-relaxed">{salon.address}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Sizing Standard */}
            <div className="space-y-3 pt-4 border-t border-[#e8e3db]">
              <label className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#3a3530] block">
                Preferred Tailoring Sizing Standard
              </label>
              <div className="flex flex-wrap gap-4">
                {[
                  { id: 'eu', label: 'European (FR / IT Standard)' },
                  { id: 'uk', label: 'British (UK Savile Row Standard)' },
                  { id: 'us', label: 'American (US Standard)' },
                ].map((s) => (
                  <label
                    key={s.id}
                    className={`px-4 py-2.5 border text-xs cursor-pointer transition-all ${
                      sizingStandard === s.id
                        ? 'border-[#1a1714] bg-[#1a1714] text-white'
                        : 'border-[#d6cfc5] text-[#3a3530] hover:border-[#1a1714]'
                    }`}
                  >
                    <input
                      type="radio"
                      name="sizing"
                      value={s.id}
                      checked={sizingStandard === s.id}
                      onChange={() => setSizingStandard(s.id)}
                      className="sr-only"
                    />
                    <span>{s.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Notification Toggles */}
            <div className="space-y-4 pt-4 border-t border-[#e8e3db]">
              <label className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[#3a3530] block">
                Client Dispatches & Archival Alerts
              </label>

              <div className="space-y-3 text-xs">
                <label className="flex items-center justify-between p-3 bg-[#faf9f7] border border-[#e8e3db] cursor-pointer">
                  <span className="text-[#3a3530] font-light">
                    Advance notice for seasonal runway collections & debut silhouettes
                  </span>
                  <input
                    type="checkbox"
                    checked={notifyRunway}
                    onChange={(e) => setNotifyRunway(e.target.checked)}
                    className="accent-[#1a1714] w-4 h-4 ml-4"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-[#faf9f7] border border-[#e8e3db] cursor-pointer">
                  <span className="text-[#3a3530] font-light">
                    Availability notifications for made-to-order artisanal allocations
                  </span>
                  <input
                    type="checkbox"
                    checked={notifyMadeToOrder}
                    onChange={(e) => setNotifyMadeToOrder(e.target.checked)}
                    className="accent-[#1a1714] w-4 h-4 ml-4"
                  />
                </label>

                <label className="flex items-center justify-between p-3 bg-[#faf9f7] border border-[#e8e3db] cursor-pointer">
                  <span className="text-[#3a3530] font-light">
                    Private salon cocktail invitations & private trunk show passes
                  </span>
                  <input
                    type="checkbox"
                    checked={notifyPrivateInvitations}
                    onChange={(e) => setNotifyPrivateInvitations(e.target.checked)}
                    className="accent-[#1a1714] w-4 h-4 ml-4"
                  />
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="px-6 py-3 bg-[#1a1714] text-white text-[10px] uppercase tracking-[0.2em] font-semibold hover:bg-[#a11826] transition-colors cursor-pointer"
            >
              Save Salon Preferences
            </button>
          </form>
        </div>
      )}

      {/* ── TAB 3: SECURITY & SESSIONS ── */}
      {activeTab === 'security' && (
        <div className="space-y-8 animate-fadeIn">
          {revokeSuccessMessage && (
            <div className="p-4 bg-[#f0f9f4] border-l-2 border-[#2d5a3c] text-[#2d5a3c] text-xs font-light flex items-center gap-2">
              <span>✓</span>
              <span>{revokeSuccessMessage}</span>
            </div>
          )}

          {/* Active Session Vault */}
          <div className="bg-white border border-[#e8e3db] p-8 sm:p-12 shadow-[0_2px_16px_rgba(0,0,0,0.02)] space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e8e3db]">
              <div>
                <span className="text-[9px] tracking-[0.3em] uppercase font-semibold text-[#8e857b] block mb-1">
                  SECURITY & INTEGRITY
                </span>
                <h2 className="font-serif text-2xl font-light text-[#1a1714]">
                  Active Session & Authenticated Token
                </h2>
              </div>
              <span className="text-[9px] uppercase tracking-wider px-3 py-1 bg-[#f0f9f4] text-[#2d5a3c] border border-[#2d5a3c]/30 font-mono self-start sm:self-auto">
                ENCRYPTED TLS 1.3
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-[0.18em] text-[#8e857b]">Session Lifetime</span>
                <p className="text-sm text-[#1a1714] font-medium">7 Days Persistent Token</p>
                <p className="text-xs text-[#787065] font-light">Automatically refreshed on daily client access</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-[0.18em] text-[#8e857b]">Session Identifier</span>
                <div className="flex items-center gap-2">
                  <p className="text-xs text-[#787065] font-mono break-all">{initialSession.session.id}</p>
                  <button
                    type="button"
                    onClick={() => handleCopy(initialSession.session.id, 'session')}
                    className="text-[10px] uppercase tracking-wider text-[#a11826] hover:underline cursor-pointer shrink-0"
                  >
                    {copiedId === 'session' ? 'Copied ✓' : 'Copy'}
                  </button>
                </div>
                <p className="text-xs text-[#787065] font-light">Stored in secure HTTP-only browser cookie</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-[0.18em] text-[#8e857b]">Database Authentication Engine</span>
                <p className="text-sm text-[#1a1714] font-medium">Better Auth & Neon Postgres</p>
                <p className="text-xs text-[#787065] font-light">Verified server-side on every request</p>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-[0.18em] text-[#8e857b]">Account Authorization Role</span>
                <p className="text-sm text-[#1a1714] font-mono capitalize">{initialSession.user.role || 'user'}</p>
                <p className="text-xs text-[#787065] font-light">Governs route protections across account & admin consoles</p>
              </div>
            </div>
          </div>

          {/* Session Revocation Action Card */}
          <div className="bg-[#181714] text-[#f5f2eb] border border-[#2b2823] p-8 sm:p-12 space-y-6">
            <div className="space-y-2">
              <span className="text-[9px] tracking-[0.3em] uppercase font-semibold text-[#d4af6a] block">
                DEVICE RECOVERY & SESSION LOG
              </span>
              <h3 className="font-serif text-2xl font-light text-white">
                Multi-Device Session Management
              </h3>
              <p className="text-xs text-[#a0978d] font-light leading-relaxed max-w-2xl">
                If you suspect unauthorized devices or signed in from a shared computer, you can terminate all other active sessions immediately while keeping your current browser session intact.
              </p>
            </div>

            <div className="pt-4 border-t border-[#2b2823] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <button
                type="button"
                onClick={handleRevokeOtherSessions}
                disabled={isRevokingSessions}
                className="self-start px-6 py-3 bg-[#a11826] text-white text-[10px] uppercase tracking-[0.2em] font-medium hover:bg-[#80131e] transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isRevokingSessions ? 'Terminating Sessions…' : 'Revoke All Other Sessions'}
              </button>

              <span className="text-[10px] text-[#8e857b] font-mono">
                CWE-613 Hardened Endpoint Active
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Boutique Navigation Footer Links */}
      <div className="pt-8 border-t border-[#e8e3db] flex flex-wrap gap-6 items-center justify-between text-xs">
        <div className="flex flex-wrap gap-4">
          <Link
            href="/collections"
            className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#1a1714] hover:text-[#a11826] underline underline-offset-4"
          >
            Explore Collections →
          </Link>
          <Link
            href="/new-arrivals"
            className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#1a1714] hover:text-[#a11826] underline underline-offset-4"
          >
            Spring 2026 Debut →
          </Link>
          <Link
            href="/collections/handbags"
            className="text-[10px] uppercase tracking-[0.2em] font-medium text-[#1a1714] hover:text-[#a11826] underline underline-offset-4"
          >
            Haute Maroquinerie →
          </Link>
        </div>
        <SignOutButton variant="minimal" />
      </div>
    </div>
  );
}
