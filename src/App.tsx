import './App.css'

type NavItemType = {
  label: string
  icon: string
  active?: boolean
  children?: NavItemType[]
}

type StatCardType = {
  label: string
  value: string
  change: string
  caption: string
  positive?: boolean
}

type OrderType = {
  id: string
  customer: string
  product: string
  amount: string
  status: string
}

const sidebarItems: NavItemType[] = [
  { label: 'Dashboard', icon: '◉', active: true },
  {
    label: 'Products',
    icon: '◈',
    children: [{ label: 'Inventory', icon: '◌' }, { label: 'Pricing', icon: '◌' }],
  },
  {
    label: 'Orders',
    icon: '◍',
    children: [{ label: 'Fulfillment', icon: '◌' }, { label: 'Returns', icon: '◌' }],
  },
  {
    label: 'Customers',
    icon: '◎',
    children: [{ label: 'Segments', icon: '◌' }, { label: 'Loyalty', icon: '◌' }],
  },
  {
    label: 'Analytics',
    icon: '◐',
    children: [{ label: 'Reports', icon: '◌' }, { label: 'Forecasts', icon: '◌' }],
  },
  {
    label: 'AI Assistant',
    icon: '◑',
    children: [{ label: 'Settings', icon: '◌' }, { label: 'Copilot', icon: '◌' }],
  },
]

const stats: StatCardType[] = [
  { label: 'Total Sales', value: '$84.2K', change: '+12.4%', caption: 'vs last month', positive: true },
  { label: 'Orders', value: '1,284', change: '+8.1%', caption: 'processed today', positive: true },
  { label: 'Products', value: '328', change: '+3.2%', caption: 'active SKUs', positive: true },
  { label: 'Customers', value: '9,410', change: '+5.7%', caption: 'retained users', positive: true },
]

const orders: OrderType[] = [
  { id: '#1024', customer: 'Ava Patel', product: 'Aurora Lamp', amount: '$240', status: 'Delivered' },
  { id: '#1025', customer: 'Marcus Chen', product: 'Nova Headset', amount: '$180', status: 'Packed' },
  { id: '#1026', customer: 'Lina Gomez', product: 'Halo Chair', amount: '$320', status: 'Processing' },
]

function App() {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-badge">✦</div>
          <div>
            <div className="brand-title">Store AI Manager</div>
            <div className="brand-subtitle">Commerce OS</div>
          </div>
        </div>

        <nav className="sidebar-nav" aria-label="Sidebar navigation">
          {sidebarItems.map((item) => (
            <SidebarItem key={item.label} item={item} />
          ))}
        </nav>

        <div className="sidebar-card">
          <p className="card-label">AI Assistant</p>
          <h3>Live insights enabled</h3>
          <p>Automations are monitoring stock, demand, and customer trends.</p>
          <button type="button" className="ghost-btn">
            Open Copilot
          </button>
        </div>
      </aside>

      <main className="main-content">
        <header className="topbar">
          <div>
            <p className="eyebrow">Operations center</p>
            <h1>Store AI Manager</h1>
          </div>
          <div className="topbar-actions">
            <button type="button" className="ghost-btn">
              + New report
            </button>
            <div className="profile-pill">
              <div className="avatar">AL</div>
              <div>
                <strong>Alex Lee</strong>
                <span>AI Lead</span>
              </div>
            </div>
          </div>
        </header>

        <section className="hero-panel">
          <div>
            <p className="eyebrow">Today at a glance</p>
            <h2>Demand is rising across premium accessories.</h2>
            <p>
              Stock health is strong, conversion improved 18%, and AI recommendations are driving faster fulfillment.
            </p>
          </div>
          <div className="hero-chip">+18.2% this week</div>
        </section>

        <section className="stats-grid" aria-label="Performance overview">
          {stats.map((stat) => (
            <article className="stat-card" key={stat.label}>
              <div className="stat-top">
                <p>{stat.label}</p>
                <span className={`badge ${stat.positive ? 'positive' : 'neutral'}`}>{stat.change}</span>
              </div>
              <div className="stat-value">{stat.value}</div>
              <div className="stat-foot">{stat.caption}</div>
            </article>
          ))}
        </section>

        <section className="content-grid">
          <div className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Live activity</p>
                <h3>Recent Orders</h3>
              </div>
              <button type="button" className="ghost-btn small">
                View all
              </button>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Order</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td>{order.id}</td>
                      <td>{order.customer}</td>
                      <td>{order.product}</td>
                      <td>{order.amount}</td>
                      <td>
                        <span className="status-pill">{order.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">Automation</p>
                <h3>Command Center</h3>
              </div>
            </div>
            <div className="insights-list">
              <div className="insight-item">
                <strong>Inventory sync</strong>
                <span>All high-demand products are stocked above target.</span>
              </div>
              <div className="insight-item">
                <strong>Customer sentiment</strong>
                <span>Positive feedback rose 11% after the new assistant rollout.</span>
              </div>
              <div className="insight-item">
                <strong>Marketing pulse</strong>
                <span>Bundle recommendations are converting at 24%.</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

function SidebarItem({ item, depth = 0 }: { item: NavItemType; depth?: number }) {
  return (
    <div>
      <div className={`nav-item depth-${depth} ${item.active ? 'active' : ''}`}>
        <div className="nav-left">
          <span className="icon">{item.icon}</span>
          <span>{item.label}</span>
        </div>
        {item.children?.length ? <span className="chevron">›</span> : null}
      </div>
      {item.children?.length ? (
        <div className="nav-children">
          {item.children.map((child) => (
            <SidebarItem key={child.label} item={child} depth={depth + 1} />
          ))}
        </div>
      ) : null}
    </div>
  )
}

export default App
