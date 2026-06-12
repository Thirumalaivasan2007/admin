import React, { useState, useEffect } from 'react';
import { X, Key, Shield, Zap, RefreshCw, User, Check, AlertTriangle, Activity } from 'lucide-react';
import { adminServices } from '../services/adminApi';

const UserAnalyticsModal = ({ userId, onClose }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [togglingKeyId, setTogglingKeyId] = useState(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await adminServices.getUserAnalytics(userId);
      setData(response.data);
    } catch (err) {
      console.error("Failed to fetch user analytics:", err);
      setError(err.response?.data?.message || "Could not fetch user intelligence reports.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchAnalytics();
    }
  }, [userId]);

  const handleToggleKey = async (keyId) => {
    setTogglingKeyId(keyId);
    try {
      await adminServices.toggleApiKeyStatus(keyId);
      // Refresh local analytics state
      const response = await adminServices.getUserAnalytics(userId);
      setData(response.data);
    } catch (err) {
      console.error("Failed to toggle API key status:", err);
      alert(err.response?.data?.message || "Failed to toggle key status.");
    } finally {
      setTogglingKeyId(null);
    }
  };

  if (!userId) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 100,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      background: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
    }}>
      <div className="glass-card animate-fade-in" style={{
        position: 'relative',
        width: '100%',
        maxWidth: '850px',
        maxHeight: '90vh',
        overflowY: 'auto',
        background: '#0d0d0d',
        borderColor: 'rgba(6, 182, 212, 0.2)',
        boxShadow: '0 0 50px rgba(6, 182, 212, 0.1)',
        padding: '0',
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '25px 30px',
          borderBottom: '1px solid var(--border)',
          background: 'rgba(0,0,0,0.3)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{
              width: '45px',
              height: '45px',
              borderRadius: '12px',
              background: 'rgba(6, 182, 212, 0.1)',
              border: '1px solid rgba(6, 182, 212, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary)',
            }}>
              <User size={22} />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>User Node Intelligence</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1px', marginTop: '4px' }}>
                Granular Analytics & API Control
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '8px',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#fff'}
            onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '30px' }}>
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px', padding: '60px 0' }}>
              <RefreshCw size={30} className="cyan-glow" style={{ animation: 'spin 2s linear infinite' }} />
              <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Polling user intelligence records...</p>
            </div>
          ) : error ? (
            <div style={{
              padding: '20px',
              background: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              color: 'var(--danger)',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '14px',
            }}>
              <AlertTriangle size={20} />
              {error}
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
              {/* Profile Card & Big Stats */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 2fr',
                gap: '25px',
              }}>
                {/* User Bio */}
                <div style={{
                  padding: '20px',
                  background: 'rgba(255, 255, 255, 0.01)',
                  border: '1px solid var(--border)',
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }}>
                  <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#fff' }}>{data.user.name}</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>{data.user.email}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '5px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '8px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      background: data.user.plan === 'pro' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(6, 182, 212, 0.15)',
                      color: data.user.plan === 'pro' ? 'var(--secondary)' : 'var(--primary)',
                      border: `1px solid ${data.user.plan === 'pro' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(6, 182, 212, 0.2)'}`,
                    }}>
                      PLAN: {data.user.plan.toUpperCase()}
                    </span>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: '8px',
                      fontSize: '10px',
                      fontWeight: 'bold',
                      background: data.user.isBanned ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                      color: data.user.isBanned ? 'var(--danger)' : 'var(--secondary)',
                      border: `1px solid ${data.user.isBanned ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}`,
                    }}>
                      {data.user.isBanned ? 'BANNED' : 'ACTIVE'}
                    </span>
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '10px' }}>
                    Registered: {new Date(data.user.createdAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Performance Metrics */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '15px',
                }}>
                  <div style={{
                    padding: '20px 15px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    textAlign: 'center',
                  }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>Chats Logged</span>
                    <h4 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '10px', color: '#fff' }}>{data.analytics.totalPrompts}</h4>
                  </div>
                  <div style={{
                    padding: '20px 15px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    textAlign: 'center',
                  }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>B2B Keys</span>
                    <h4 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '10px', color: 'var(--primary)' }}>{data.analytics.totalApiKeys}</h4>
                  </div>
                  <div style={{
                    padding: '20px 15px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    textAlign: 'center',
                  }}>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>B2B Requests</span>
                    <h4 style={{ fontSize: '24px', fontWeight: 'bold', marginTop: '10px', color: 'var(--secondary)' }}>{data.analytics.totalApiHits}</h4>
                  </div>
                </div>
              </div>

              {/* API Keys Configuration */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Key size={16} style={{ color: 'var(--primary)' }} />
                  B2B Credentials & Override Access
                </h4>
                {data.analytics.apiKeys.length === 0 ? (
                  <div style={{
                    padding: '20px',
                    textAlign: 'center',
                    background: 'rgba(255, 255, 255, 0.01)',
                    border: '1px solid var(--border)',
                    borderRadius: '16px',
                    fontSize: '13px',
                    color: 'var(--text-muted)',
                  }}>
                    No B2B developer keys have been provisioned by this user node.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {data.analytics.apiKeys.map((key) => (
                      <div key={key._id} style={{
                        padding: '15px 20px',
                        background: 'rgba(255,255,255,0.01)',
                        border: '1px solid var(--border)',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'between',
                        gap: '20px',
                      }}>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#fff' }}>{key.name}</span>
                            <span style={{
                              padding: '2px 8px',
                              borderRadius: '6px',
                              fontSize: '8px',
                              fontWeight: 'black',
                              background: key.status === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                              color: key.status === 'active' ? 'var(--secondary)' : 'var(--danger)',
                              border: `1px solid ${key.status === 'active' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
                            }}>
                              {key.status.toUpperCase()}
                            </span>
                          </div>
                          <div style={{
                            fontFamily: 'monospace',
                            fontSize: '11px',
                            color: 'var(--text-muted)',
                            marginTop: '6px',
                            background: '#050505',
                            padding: '4px 10px',
                            borderRadius: '8px',
                            display: 'inline-block',
                          }}>
                            {key.key.substring(0, 16)}••••••••••••••••
                          </div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '6px' }}>
                            Hits: <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{key.totalHits}</span> | Created: {new Date(key.createdAt).toLocaleDateString()}
                          </div>
                        </div>

                        {/* Revocation Override Switch */}
                        <button
                          disabled={togglingKeyId === key._id}
                          onClick={() => handleToggleKey(key._id)}
                          style={{
                            background: 'transparent',
                            border: `1px solid ${key.status === 'active' ? 'var(--danger)' : 'var(--secondary)'}`,
                            color: key.status === 'active' ? 'var(--danger)' : 'var(--secondary)',
                            padding: '6px 14px',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: '600',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                          }}
                          onMouseEnter={(e) => {
                            if (togglingKeyId !== key._id) {
                              e.currentTarget.style.background = key.status === 'active' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = 'transparent';
                          }}
                        >
                          {togglingKeyId === key._id ? 'Updating...' : key.status === 'active' ? 'Revoke Key' : 'Activate Key'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* User Node Activity Logs */}
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '15px', textTransform: 'uppercase', letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Activity size={16} style={{ color: 'var(--secondary)' }} />
                  Audit Trail Events (Last 10)
                </h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '200px', overflowY: 'auto', paddingRight: '10px' }}>
                  {data.logs.map((log, i) => (
                    <div key={i} style={{
                      padding: '10px 15px',
                      background: 'rgba(255, 255, 255, 0.01)',
                      border: '1px solid var(--border)',
                      borderRadius: '10px',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      fontSize: '12px',
                    }}>
                      <div>
                        <span style={{
                          color: log.status === 'success' ? 'var(--secondary)' : 'var(--danger)',
                          fontWeight: 'bold',
                          marginRight: '10px',
                        }}>
                          [{log.type.toUpperCase()}]
                        </span>
                        <span style={{ color: '#fff' }}>{log.message}</span>
                      </div>
                      <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>
                        {new Date(log.createdAt).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                  {data.logs.length === 0 && (
                    <div style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '12px', padding: '20px' }}>
                      No audit logs linked to this user's node.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '20px 30px',
          borderTop: '1px solid var(--border)',
          background: 'rgba(0,0,0,0.3)',
          display: 'flex',
          justifyContent: 'end',
        }}>
          <button 
            onClick={onClose} 
            style={{
              background: 'var(--primary)',
              border: 'none',
              color: '#000',
              padding: '8px 20px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.filter = 'brightness(1)'}
          >
            Done
          </button>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default UserAnalyticsModal;
