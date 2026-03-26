// frontend/src/pages/admin/AdminDashboard.jsx  (ADD NOTIFICATION to existing)
// This is a wrapper patch — add notification bell to AdminSidebar/layout
// The actual full AdminDashboard should have notifications in its header.
// Since admin pages already exist, we provide a drop-in AdminLayout with notifications.

// frontend/src/components/AdminLayout.jsx — CREATE THIS FILE
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Calendar, CreditCard, BarChart2, Settings, LogOut, Shield } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import NotificationPanel from './NotificationPanel';

const navItems = [
  { label:'Dashboard', icon:LayoutDashboard, path:'/admin/dashboard' },
  { label:'User Management', icon:Users, path:'/admin/users' },
  { label:'Appointments', icon:Calendar, path:'/admin/appointments' },
  { label:'Billing', icon:CreditCard, path:'/admin/billing' },
  { label:'Reports', icon:BarChart2, path:'/admin/reports' },
  { label:'Settings', icon:Settings, path:'/admin/settings' },
];

export default function AdminLayout({ children, pageTitle, pageSubtitle, topbarRight }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const { notifications, unreadCount, markAsRead, markAllRead, deleteNotification } = useNotifications();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={{ display:'flex', height:'100vh', background:'#0d1526', fontFamily:"'DM Sans',system-ui,sans-serif" }}>
      {/* Sidebar */}
      <div style={{ width:240, background:'#0f1729', height:'100vh', display:'flex', flexDirection:'column', borderRight:'1px solid rgba(255,255,255,0.06)', flexShrink:0 }}>
        <div style={{ padding:'24px 20px 16px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <div style={{ width:34, height:34, borderRadius:10, background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <Shield size={16} color="#fff" />
            </div>
            <div>
              <div style={{ color:'#f1f5f9', fontWeight:700, fontSize:16 }}>HAMS Admin</div>
              <div style={{ color:'#475569', fontSize:11 }}>Management Portal</div>
            </div>
          </div>
        </div>
        <div style={{ padding:'12px 16px 12px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:34, height:34, borderRadius:'50%', background:'linear-gradient(135deg,#ef4444,#dc2626)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:13 }}>
              {user.first_name?.[0]}{user.last_name?.[0]}
            </div>
            <div>
              <div style={{ color:'#f1f5f9', fontWeight:600, fontSize:13 }}>{user.first_name} {user.last_name}</div>
              <div style={{ color:'#ef4444', fontSize:11, fontWeight:600 }}>Administrator</div>
            </div>
          </div>
        </div>
        <nav style={{ flex:1, padding:'12px 10px', overflowY:'auto' }}>
          {navItems.map(({ label, icon:Icon, path }) => (
            <Link key={path} to={path} style={{
              display:'flex', alignItems:'center', gap:10,
              padding:'10px 12px', borderRadius:10, marginBottom:2,
              background:location.pathname===path?'rgba(99,102,241,0.15)':'transparent',
              color:location.pathname===path?'#818cf8':'#64748b',
              textDecoration:'none', fontWeight:location.pathname===path?600:400, fontSize:14,
              border:location.pathname===path?'1px solid rgba(99,102,241,0.2)':'1px solid transparent',
            }}>
              <Icon size={16} /> {label}
            </Link>
          ))}
        </nav>
        <div style={{ padding:'12px 14px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
          <button onClick={handleLogout} style={{ width:'100%', padding:'9px 12px', borderRadius:10, border:'none', background:'rgba(239,68,68,0.08)', color:'#ef4444', cursor:'pointer', display:'flex', alignItems:'center', gap:8, fontSize:13, fontWeight:500 }}>
            <LogOut size={14}/> Logout
          </button>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', overflow:'hidden' }}>
        <div style={{ height:64, background:'rgba(15,23,41,0.8)', backdropFilter:'blur(12px)', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 28px', flexShrink:0 }}>
          <div>
            <h1 style={{ color:'#f1f5f9', fontWeight:700, fontSize:20, margin:0 }}>{pageTitle}</h1>
            {pageSubtitle && <p style={{ color:'#475569', fontSize:13, margin:0 }}>{pageSubtitle}</p>}
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:12 }}>
            {topbarRight}
            <NotificationPanel notifications={notifications} unreadCount={unreadCount} onMarkRead={markAsRead} onMarkAllRead={markAllRead} onDelete={deleteNotification} />
          </div>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:28 }}>{children}</div>
      </div>
    </div>
  );
}