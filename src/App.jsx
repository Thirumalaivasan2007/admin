import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ShieldAlert, 
  Activity, 
  Settings, 
  LogOut,
  Search,
  Bell,
  Mail,
  ExternalLink,
  RefreshCcw,
  MessageSquare,
  Megaphone,
  Check,
  X,
  Plus,
  CreditCard
} from 'lucide-react';
import { motion } from 'framer-motion';
import { adminServices } from './services/adminApi';
import AdminLogin from './components/AdminLogin';
import UserAnalyticsModal from './components/UserAnalyticsModal';

const AdminDashboard = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('user'));
  const [activeTab, setActiveTab] = useState('overview');
  const [statsData, setStatsData] = useState({ totalUsers: 0, totalEmails: 0, failedEmails: 0, loginAttempts: 0 });
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [selectedUserIdForAnalytics, setSelectedUserIdForAnalytics] = useState(null);
  
  // Broadcast states
  const [broadcastSubject, setBroadcastSubject] = useState('');
  const [broadcastHtml, setBroadcastHtml] = useState('');
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [broadcastStatus, setBroadcastStatus] = useState('');
  
  // Ticket resolve states
  const [resolvingTicketId, setResolvingTicketId] = useState(null);

  const [isLoading, setIsLoading] = useState(true);
  const [spotifyEnabled, setSpotifyEnabled] = useState(true);
  const [calendarEnabled, setCalendarEnabled] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [statsRes, usersRes, logsRes, ticketsRes] = await Promise.all([
        adminServices.getStats(),
        adminServices.getUsers(),
        adminServices.getLogs(),
        adminServices.getTickets().catch(err => ({ data: [] }))
      ]);
      setStatsData(statsRes.data);
      setUsers(usersRes.data);
      setLogs(logsRes.data);
      setTickets(ticketsRes.data);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResolveTicket = async (ticketId) => {
    setResolvingTicketId(ticketId);
    try {
      await adminServices.resolveTicket(ticketId);
      // Refresh tickets list
      const response = await adminServices.getTickets();
      setTickets(response.data);
      
      // Refresh logs
      const logsRes = await adminServices.getLogs();
      setLogs(logsRes.data);
      
      alert("✅ Support Ticket resolved and user has been notified via automatic email!");
    } catch (error) {
      console.error('Error resolving ticket:', error);
      alert(error.response?.data?.message || 'Failed to resolve ticket.');
    } finally {
      setResolvingTicketId(null);
    }
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastSubject.trim() || !broadcastHtml.trim()) {
      alert("Please fill in both the Subject and HTML Content for the broadcast.");
      return;
    }
    if (!confirm(`Are you sure you want to broadcast this campaign to all active users?`)) {
      return;
    }
    setIsBroadcasting(true);
    setBroadcastStatus('Initiating broadcast campaign...');
    try {
      await adminServices.broadcastMessage(broadcastSubject, broadcastHtml);
      setBroadcastStatus('Broadcast campaign launched successfully!');
      setBroadcastSubject('');
      setBroadcastHtml('');
      
      // Refresh stats/logs
      fetchData();
      setTimeout(() => setBroadcastStatus(''), 4000);
    } catch (error) {
      console.error('Broadcast failed:', error);
      setBroadcastStatus('Error launching campaign: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsBroadcasting(false);
    }
  };

  const handleToggleBan = async (userId) => {
    try {
      const response = await adminServices.toggleBanUser(userId);
      // Update local users list status
      setUsers(prevUsers => prevUsers.map(u => 
        u._id === userId ? { ...u, isBanned: response.data.user.isBanned } : u
      ));
      
      // Update Stats & Logs
      const [statsRes, logsRes] = await Promise.all([
        adminServices.getStats(),
        adminServices.getLogs()
      ]);
      setStatsData(statsRes.data);
      setLogs(logsRes.data);
    } catch (error) {
      console.error('Error toggling ban status:', error);
      alert(error.response?.data?.message || 'Failed to toggle ban status');
    }
  };

  useEffect(() => {
    fetchData();
    // Auto-refresh every 60 seconds
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: 'Total Intelligence', value: statsData.totalUsers, icon: Users, color: 'var(--primary)' },
    { label: 'Pro Subscriptions', value: statsData.proUsers || 0, icon: Activity, color: 'var(--secondary)' },
    { label: 'Total Revenue (INR)', value: `₹${(statsData.totalRevenue || 0).toLocaleString()}`, icon: CreditCard, color: '#10b981' },
    { label: 'Security Events', value: statsData.loginAttempts, icon: ShieldAlert, color: 'var(--danger)' },
  ];

  if (!isLoggedIn) {
    return <AdminLogin onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="admin-container" style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-main)' }}>
      {/* Sidebar */}
      <aside style={{ width: '280px', borderRight: '1px solid var(--border)', padding: '30px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '40px', height: '40px', background: 'linear-gradient(135deg, var(--primary), var(--secondary))', borderRadius: '10px' }}></div>
          <h1 style={{ fontSize: '20px', fontWeight: 'bold', letterSpacing: '1px' }}>ZYLRON <span className="cyan-glow">ADMIN</span></h1>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
          {[
            { id: 'overview', label: 'Overview', icon: LayoutDashboard },
            { id: 'users', label: 'User Nodes', icon: Users },
            { id: 'tickets', label: 'Support Tickets', icon: MessageSquare },
            { id: 'broadcast', label: 'Broadcast Node', icon: Megaphone },
            { id: 'security', label: 'Security Logs', icon: ShieldAlert },
            { id: 'omni', label: 'Omni-Vision', icon: Activity },
            { id: 'devops', label: 'DevOps Node', icon: ShieldAlert },
            { id: 'proxy', label: 'Proxy Health', icon: Mail },
            { id: 'settings', label: 'Core Settings', icon: Settings },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                console.log('Switching to:', item.id);
                setActiveTab(item.id);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '12px',
                border: 'none',
                background: activeTab === item.id ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
                color: activeTab === item.id ? 'var(--primary)' : 'var(--text-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                textAlign: 'left',
                fontSize: '15px',
                position: 'relative',
                zIndex: 10
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = activeTab === item.id ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255,255,255,0.05)'}
              onMouseLeave={(e) => e.currentTarget.style.background = activeTab === item.id ? 'rgba(6, 182, 212, 0.15)' : 'transparent'}
            >
              <item.icon size={20} />
              {item.label}
              {activeTab === item.id && (
                <motion.div 
                  layoutId="active-pill"
                  style={{ position: 'absolute', left: 0, width: '4px', height: '20px', background: 'var(--primary)', borderRadius: '0 4px 4px 0' }}
                />
              )}
            </button>
          ))}
        </nav>

        <button style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', color: 'var(--danger)', background: 'transparent', border: 'none', cursor: 'pointer' }}>
          <LogOut size={20} />
          Sign Out
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
        {/* Header */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
          <div>
            <h2 style={{ fontSize: '24px', fontWeight: '600' }}>Neural Command Center</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Welcome back, Root Administrator.</p>
          </div>

          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{ position: 'relative' }}>
              <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
              <input 
                type="text" 
                placeholder="Search nodes..." 
                style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: '10px', padding: '10px 15px 10px 40px', color: '#fff', width: '250px' }}
              />
            </div>
            <button className="glass-card" style={{ padding: '10px', color: '#fff', background: 'transparent', cursor: 'pointer' }}><Bell size={20} /></button>
          </div>
        </header>

        {/* Stats Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '25px', marginBottom: '40px' }}>
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card" 
              style={{ padding: '25px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                <span style={{ color: 'var(--text-muted)', fontSize: '14px' }}>{stat.label}</span>
                <stat.icon size={20} style={{ color: stat.color }} />
              </div>
              <h3 style={{ fontSize: '28px', fontWeight: '700' }}>{stat.value}</h3>
              <div style={{ fontSize: '12px', color: 'var(--secondary)', marginTop: '5px' }}>+12% from last cycle</div>
            </motion.div>
          ))}
        </div>

        {/* Dynamic Content */}
        <div className="animate-fade-in">
          {activeTab === 'overview' && (
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '25px' }}>
              <section className="glass-card" style={{ padding: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '25px' }}>
                  <h3 style={{ fontSize: '18px' }}>Recent Intelligence Uplinks</h3>
                  <button onClick={() => setActiveTab('users')} style={{ background: 'transparent', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '14px' }}>
                    View All <ExternalLink size={14} />
                  </button>
                </div>
                
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '13px' }}>
                      <th style={{ padding: '15px 0' }}>NODE IDENTITY</th>
                      <th>ROLE</th>
                      <th>EMAIL</th>
                      <th>TIMESTAMP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.slice(0, 5).map((user, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)', fontSize: '14px', opacity: user.isBanned ? 0.6 : 1 }}>
                        <td style={{ padding: '20px 0', fontWeight: '500' }}>
                          <button 
                            onClick={() => setSelectedUserIdForAnalytics(user._id)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: '500', cursor: 'pointer', padding: 0, textDecoration: 'none', textAlign: 'left', fontSize: '14px' }}
                            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                          >
                            {user.name}
                          </button>
                          {user.isBanned && (
                            <span style={{ color: 'var(--danger)', fontSize: '10px', marginLeft: '8px', fontWeight: 'bold', border: '1px solid var(--danger)', padding: '1px 6px', borderRadius: '4px', background: 'rgba(239, 68, 68, 0.1)' }}>
                              BANNED
                            </span>
                          )}
                        </td>
                        <td>
                          <span style={{ 
                            padding: '4px 10px', 
                            borderRadius: '20px', 
                            fontSize: '11px', 
                            background: user.role === 'admin' ? 'rgba(6, 182, 212, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                            color: user.role === 'admin' ? 'var(--primary)' : 'var(--secondary)'
                          }}>
                            {user.role.toUpperCase()}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>{user.email}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>

              <section className="glass-card" style={{ padding: '30px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '25px' }}>Live Security Stream</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', maxHeight: '400px', overflowY: 'auto', paddingRight: '10px' }}>
                  {logs.slice(0, 8).map((log, i) => (
                    <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '5px', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px', borderLeft: `3px solid ${log.status === 'success' ? 'var(--secondary)' : 'var(--danger)'}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: log.status === 'success' ? 'var(--secondary)' : 'var(--danger)' }}>
                          {log.type.toUpperCase()}
                        </span>
                        <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{new Date(log.createdAt).toLocaleTimeString()}</span>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-main)' }}>{log.message}</p>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          )}

          {activeTab === 'users' && (
            <section className="glass-card animate-fade-in" style={{ padding: '30px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '25px' }}>Global User Directory</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '13px' }}>
                    <th style={{ padding: '15px 0' }}>NAME</th>
                    <th>EMAIL</th>
                    <th>ROLE</th>
                    <th>STATUS</th>
                    <th>ACCOUNT CREATED</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user, i) => {
                    const currentUser = JSON.parse(localStorage.getItem('user'));
                    const isSelf = user._id === currentUser?.id || user._id === currentUser?._id;
                    
                    return (
                      <tr key={i} style={{ borderBottom: '1px solid var(--border)', fontSize: '14px', opacity: user.isBanned ? 0.75 : 1 }}>
                        <td style={{ padding: '20px 0', fontWeight: '600' }}>
                          <button 
                            onClick={() => setSelectedUserIdForAnalytics(user._id)}
                            style={{ background: 'transparent', border: 'none', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer', padding: 0, textDecoration: 'none', textAlign: 'left', fontSize: '14px' }}
                            onMouseEnter={(e) => e.currentTarget.style.textDecoration = 'underline'}
                            onMouseLeave={(e) => e.currentTarget.style.textDecoration = 'none'}
                          >
                            {user.name}
                          </button>
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>{user.email}</td>
                        <td>
                          <span style={{ 
                            padding: '4px 12px', 
                            borderRadius: '20px', 
                            fontSize: '11px', 
                            background: user.role === 'admin' ? 'rgba(6, 182, 212, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                            color: user.role === 'admin' ? 'var(--primary)' : 'var(--secondary)'
                          }}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <span style={{ 
                            padding: '4px 12px', 
                            borderRadius: '20px', 
                            fontSize: '11px', 
                            background: user.isBanned ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                            color: user.isBanned ? 'var(--danger)' : 'var(--secondary)',
                            border: user.isBanned ? '1px solid rgba(239, 68, 68, 0.2)' : '1px solid rgba(16, 185, 129, 0.2)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px'
                          }}>
                            <span style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: user.isBanned ? 'var(--danger)' : 'var(--secondary)'
                            }}></span>
                            {user.isBanned ? 'SUSPENDED' : 'OPERATIONAL'}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-muted)' }}>{new Date(user.createdAt).toLocaleString()}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <button
                              onClick={() => setSelectedUserIdForAnalytics(user._id)}
                              style={{
                                background: 'transparent',
                                border: '1px solid var(--primary)',
                                color: 'var(--primary)',
                                padding: '5px 12px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                fontSize: '12px',
                                fontWeight: '600',
                                transition: 'all 0.2s ease'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(6, 182, 212, 0.1)'}
                              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                            >
                              Analytics
                            </button>
                            {isSelf ? (
                              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                                Active Admin
                              </span>
                            ) : (
                              <button 
                                onClick={() => handleToggleBan(user._id)}
                                style={{ 
                                  background: 'transparent', 
                                  border: `1px solid ${user.isBanned ? 'var(--secondary)' : 'var(--danger)'}`, 
                                  color: user.isBanned ? 'var(--secondary)' : 'var(--danger)', 
                                  padding: '5px 12px', 
                                  borderRadius: '8px', 
                                  cursor: 'pointer', 
                                  fontSize: '12px',
                                  fontWeight: '600',
                                  transition: 'all 0.2s ease'
                                }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = user.isBanned ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = 'transparent';
                                }}
                              >
                                {user.isBanned ? 'Unban Node' : 'Kill Switch'}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </section>
          )}

          {activeTab === 'security' && (
            <section className="glass-card animate-fade-in" style={{ padding: '30px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '25px' }}>Security & Audit Trail</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {logs.filter(l => l.type !== 'omni_vision' && l.type !== 'devops_agent').map((log, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '150px 100px 1fr 150px', gap: '20px', alignItems: 'center', padding: '15px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--primary)' }}>{log.type.replace('_', ' ').toUpperCase()}</div>
                    <div style={{ color: log.status === 'success' ? 'var(--secondary)' : 'var(--danger)', fontSize: '12px' }}>{log.status.toUpperCase()}</div>
                    <div style={{ fontSize: '14px' }}>{log.message} <span style={{ color: 'var(--text-muted)', fontSize: '12px' }}>({log.target})</span></div>
                    <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'right' }}>{new Date(log.createdAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 'omni' && (
            <section className="glass-card animate-fade-in" style={{ padding: '30px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '25px' }}>👁️ Omni-Vision Intelligence</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {logs.filter(l => l.type === 'omni_vision').map((log, i) => (
                  <div key={i} style={{ padding: '15px', background: 'rgba(6, 182, 212, 0.05)', borderRadius: '12px', border: '1px solid rgba(6, 182, 212, 0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontWeight: '600', color: 'var(--primary)' }}>SCREEN ANALYSIS</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                    <p style={{ fontSize: '14px' }}>{log.message}</p>
                  </div>
                ))}
                {logs.filter(l => l.type === 'omni_vision').length === 0 && (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>No Omni-Vision sessions recorded yet.</p>
                )}
              </div>
            </section>
          )}

          {activeTab === 'devops' && (
            <section className="glass-card animate-fade-in" style={{ padding: '30px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '25px' }}>🤖 DevOps Self-Healing Nodes</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {logs.filter(l => l.type === 'devops_agent').map((log, i) => (
                  <div key={i} style={{ padding: '15px', background: 'rgba(16, 185, 129, 0.05)', borderRadius: '12px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                      <span style={{ fontWeight: '600', color: 'var(--secondary)' }}>COMMIT REVIEW</span>
                      <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                    <p style={{ fontSize: '14px' }}>{log.message}</p>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Target Repo: {log.target}</span>
                  </div>
                ))}
                {logs.filter(l => l.type === 'devops_agent').length === 0 && (
                  <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>No DevOps activity detected.</p>
                )}
              </div>
            </section>
          )}

          {activeTab === 'proxy' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
              <section className="glass-card animate-fade-in" style={{ padding: '30px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '25px' }}>Proxy Dispatch Analytics</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>Success Rate</span>
                    <span className="green-glow">{(statsData.totalEmails / (statsData.totalEmails + statsData.failedEmails) * 100 || 0).toFixed(1)}%</span>
                  </div>
                  <div style={{ width: '100%', height: '10px', background: '#222', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{ width: `${(statsData.totalEmails / (statsData.totalEmails + statsData.failedEmails) * 100 || 0)}%`, height: '100%', background: 'var(--secondary)' }}></div>
                  </div>
                  <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                    Total Dispatched: {statsData.totalEmails} | Failed: {statsData.failedEmails}
                  </div>
                </div>
              </section>

              <section className="glass-card animate-fade-in" style={{ padding: '30px' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '25px' }}>Neural Engine Health</h3>
                <div style={{ padding: '20px', background: 'rgba(16, 185, 129, 0.05)', border: '1px solid var(--secondary)', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--secondary)', marginBottom: '10px' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--secondary)', boxShadow: '0 0 10px var(--secondary)' }}></div>
                    <span style={{ fontWeight: '600' }}>Operational</span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Master Bypass Proxy is communicating effectively with Google Apps Script. All neural links are stable.</p>
                </div>
              </section>
            </div>
          )}

          {activeTab === 'settings' && (
            <section className="glass-card animate-fade-in" style={{ padding: '30px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '25px' }}>Core System Configuration</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
                <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px', border: '1px solid var(--border)' }}>
                  <h4 style={{ fontSize: '15px', color: 'var(--primary)', marginBottom: '15px' }}>Voice Neural Link (Jarvis Mode)</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Enable Hyper-Realistic Speech</span>
                      <input type="checkbox" defaultChecked />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Primary Voice Persona</span>
                      <select style={{ background: 'var(--bg-main)', color: '#fff', border: '1px solid var(--border)', padding: '5px 10px', borderRadius: '8px' }}>
                        <option value="pNInz6obpg8nEByWQX7d">Adam (Deep & Authoritative)</option>
                        <option value="21m00Tcm4TlvDq8ikWAM">Rachel (Clear & Professional)</option>
                        <option value="AZnzlk1XjtKdl9skWID9">Nicole (Friendly & Soft)</option>
                      </select>
                    </div>
                    <button 
                      onClick={() => alert('✅ Voice Neural Link Updated! Restarting speech core...')}
                      style={{ alignSelf: 'flex-start', background: 'var(--primary)', color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                    >
                      Save Voice Config
                    </button>
                  </div>
                </div>

                <div style={{ padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '15px', border: '1px solid var(--border)' }}>
                  <h4 style={{ fontSize: '15px', color: 'var(--secondary)', marginBottom: '15px' }}>Advanced API Orchestration</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Spotify Neural Link</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '12px', color: spotifyEnabled ? 'var(--secondary)' : 'var(--danger)', fontWeight: 'bold' }}>
                          {spotifyEnabled ? 'ACTIVE ENGINE' : 'INACTIVE'}
                        </span>
                        <input 
                          type="checkbox" 
                          checked={spotifyEnabled}
                          onChange={(e) => setSpotifyEnabled(e.target.checked)}
                          style={{ cursor: 'pointer', width: '35px', height: '18px' }}
                        />
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>Google Calendar Sync</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ fontSize: '12px', color: calendarEnabled ? 'var(--secondary)' : 'var(--danger)', fontWeight: 'bold' }}>
                          {calendarEnabled ? 'ACTIVE ENGINE' : 'INACTIVE'}
                        </span>
                        <input 
                          type="checkbox" 
                          checked={calendarEnabled}
                          onChange={(e) => setCalendarEnabled(e.target.checked)}
                          style={{ cursor: 'pointer', width: '35px', height: '18px' }}
                        />
                      </div>
                    </div>
                    <p style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {calendarEnabled ? '* Neural Action Engine is monitoring for Calendar events.' : '* Calendar synchronization is currently restricted.'}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeTab === 'tickets' && (
            <section className="glass-card animate-fade-in" style={{ padding: '30px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={20} style={{ color: 'var(--primary)' }} />
                Support Tickets & Resolution Console
              </h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', fontSize: '13px' }}>
                    <th style={{ padding: '15px 0' }}>USER</th>
                    <th>CATEGORY</th>
                    <th>MESSAGE</th>
                    <th>STATUS</th>
                    <th>CREATED AT</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)', fontSize: '14px', opacity: ticket.status === 'resolved' ? 0.6 : 1 }}>
                      <td style={{ padding: '20px 0', fontWeight: '500' }}>
                        <div>{ticket.userId?.name || 'Unknown Node'}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{ticket.userId?.email || 'N/A'}</div>
                      </td>
                      <td>
                        <span style={{ 
                          padding: '3px 8px', 
                          borderRadius: '8px', 
                          fontSize: '11px', 
                          fontWeight: 'bold',
                          background: 'rgba(6, 182, 212, 0.1)', 
                          color: 'var(--primary)',
                          border: '1px solid rgba(6, 182, 212, 0.2)'
                        }}>
                          {ticket.category.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-main)', maxWidth: '280px', wordBreak: 'break-word', paddingRight: '15px' }}>{ticket.message}</td>
                      <td>
                        <span style={{ 
                          padding: '4px 12px', 
                          borderRadius: '20px', 
                          fontSize: '11px', 
                          background: ticket.status === 'resolved' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: ticket.status === 'resolved' ? 'var(--secondary)' : 'var(--danger)',
                          border: ticket.status === 'resolved' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(239, 68, 68, 0.2)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <span style={{
                            width: '6px',
                            height: '6px',
                            borderRadius: '50%',
                            background: ticket.status === 'resolved' ? 'var(--secondary)' : 'var(--danger)'
                          }}></span>
                          {ticket.status.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ color: 'var(--text-muted)' }}>{new Date(ticket.createdAt).toLocaleString()}</td>
                      <td>
                        {ticket.status !== 'resolved' ? (
                          <button 
                            disabled={resolvingTicketId === ticket._id}
                            onClick={() => handleResolveTicket(ticket._id)}
                            style={{ 
                              background: 'transparent', 
                              border: '1px solid var(--secondary)', 
                              color: 'var(--secondary)', 
                              padding: '5px 12px', 
                              borderRadius: '8px', 
                              cursor: 'pointer', 
                              fontSize: '12px',
                              fontWeight: '600',
                              transition: 'all 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                              if (resolvingTicketId !== ticket._id) e.currentTarget.style.background = 'rgba(16, 185, 129, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = 'transparent';
                            }}
                          >
                            {resolvingTicketId === ticket._id ? 'Resolving...' : 'Resolve Ticket'}
                          </button>
                        ) : (
                          <span style={{ fontSize: '12px', color: 'var(--secondary)', fontStyle: 'italic', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Check size={14} /> User Notified
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                  {tickets.length === 0 && (
                    <tr>
                      <td colSpan="6" style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                        No support tickets submitted yet. Core systems are optimal.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>
          )}

          {activeTab === 'broadcast' && (
            <section className="glass-card animate-fade-in" style={{ padding: '30px' }}>
              <h3 style={{ fontSize: '18px', marginBottom: '15px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Megaphone size={20} style={{ color: 'var(--primary)' }} />
                Global Broadcast Campaign Engine
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '14px', marginBottom: '25px' }}>
                Write and dispatch secure HTML/text email campaigns directly to all active user nodes in the network via Google Apps Script Proxy.
              </p>

              <form onSubmit={handleBroadcast} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-muted)' }}>CAMPAIGN SUBJECT</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Zylron AI v3.0 Release Update" 
                    value={broadcastSubject}
                    onChange={(e) => setBroadcastSubject(e.target.value)}
                    style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '10px', padding: '12px 15px', color: '#fff', fontSize: '14px' }}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-muted)' }}>HTML TEMPLATE BODY</label>
                    <textarea 
                      placeholder="<h3>Welcome to Zylron v3.0, {{name}}!</h3><p>We have introduced brand new B2B Developer APIs and support ticketing tools.</p>"
                      value={broadcastHtml}
                      onChange={(e) => setBroadcastHtml(e.target.value)}
                      style={{ background: 'var(--bg-main)', border: '1px solid var(--border)', borderRadius: '10px', padding: '15px', color: '#fff', fontFamily: 'monospace', fontSize: '13px', minHeight: '220px', resize: 'vertical' }}
                      required
                    />
                    <span style={{ fontSize: '11px', color: 'var(--primary)' }}>* Note: You can use template variable <strong>{`{{name}}`}</strong> to dynamically interpolate the user's registered name.</span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <label style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--text-muted)' }}>LIVE EMAIL RENDER PREVIEW</label>
                    <div style={{ 
                      flex: 1, 
                      background: '#0a0a0a', 
                      border: '1px solid var(--border)', 
                      borderRadius: '10px', 
                      padding: '20px', 
                      overflowY: 'auto', 
                      color: '#fff', 
                      fontFamily: 'sans-serif',
                      fontSize: '14px',
                      minHeight: '220px'
                    }}>
                      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px', marginBottom: '15px', fontSize: '12px', color: 'var(--text-muted)' }}>
                        <strong>Subject:</strong> {broadcastSubject || '(No Subject)'}
                      </div>
                      <div dangerouslySetInnerHTML={{ __html: broadcastHtml.replace(/{{name}}/g, 'Root Administrator') || '<span style="color: #475569; font-style: italic;">HTML email campaign preview will render here dynamically...</span>' }} />
                    </div>
                  </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isBroadcasting}
                  style={{ 
                    background: 'var(--primary)', 
                    color: '#000', 
                    border: 'none', 
                    padding: '14px 28px', 
                    borderRadius: '10px', 
                    cursor: 'pointer', 
                    fontWeight: 'bold', 
                    fontSize: '14px',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    alignSelf: 'flex-start',
                    boxShadow: '0 0 15px rgba(6, 182, 212, 0.2)'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.filter = 'brightness(1)'}
                >
                  {isBroadcasting ? 'Broadcasting...' : 'Launch Broadcast Campaign'}
                </button>

                {broadcastStatus && (
                  <div style={{ 
                    padding: '12px 18px', 
                    background: broadcastStatus.includes('Error') ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', 
                    border: `1px solid ${broadcastStatus.includes('Error') ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
                    color: broadcastStatus.includes('Error') ? 'var(--danger)' : 'var(--secondary)',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: '500'
                  }}>
                    {broadcastStatus}
                  </div>
                )}
              </form>
            </section>
          )}
        </div>
      </main>

      {/* Analytics Modal */}
      {selectedUserIdForAnalytics && (
        <UserAnalyticsModal 
          userId={selectedUserIdForAnalytics} 
          onClose={() => setSelectedUserIdForAnalytics(null)} 
        />
      )}
    </div>
  );
};

export default AdminDashboard;
