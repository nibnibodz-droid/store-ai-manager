import { useEffect, useMemo, useState } from 'react'
import './App.css'
import { createOrder, getOrders } from './services/ordersService'
import { createProduct, deleteProduct, getProducts, updateProduct } from './services/productsService'
import { getCustomers } from './services/customersService'
import { supabase } from './lib/supabase'
import type { Customer, Order, Product } from './types/supabaseModels'

type ViewKey = 'dashboard' | 'products' | 'orders' | 'customers' | 'ai' | 'analytics' | 'settings'

type ProductFormState = {
  title: string
  description: string
  price: string
  stock: string
  category: string
}

type OrderFormState = {
  customer_id: string
  status: string
  amount: string
}

type CustomerFormState = {
  name: string
  email: string
}

type SettingsState = {
  aiEnabled: boolean
  autoReorder: boolean
  emailAlerts: boolean
  dashboardMode: string
}

type NavItem = {
  key: ViewKey
  label: string
  icon: string
}

const navItems: NavItem[] = [
  { key: 'dashboard', label: 'Dashboard', icon: '◉' },
  { key: 'products', label: 'Products', icon: '◈' },
  { key: 'orders', label: 'Orders', icon: '◍' },
  { key: 'customers', label: 'Customers', icon: '◎' },
  { key: 'ai', label: 'AI', icon: '◑' },
  { key: 'analytics', label: 'Analytics', icon: '◐' },
  { key: 'settings', label: 'Settings', icon: '⚙' },
]

const initialProducts: Product[] = [
  { id: 'product-1', title: 'Aurora Lamp', description: 'Ambient desk lamp', price: 149, stock: 18, category: 'Lighting' },
  { id: 'product-2', title: 'Nova Headset', description: 'Immersive audio headset', price: 199, stock: 9, category: 'Audio' },
  { id: 'product-3', title: 'Halo Chair', description: 'Ergonomic home office chair', price: 329, stock: 12, category: 'Furniture' },
]

const initialOrders: Order[] = [
  { id: 'order-1', customer_id: 'customer-1', status: 'Delivered', amount: 240, created_at: '2026-08-02T14:22:00.000Z' },
  { id: 'order-2', customer_id: 'customer-2', status: 'Packed', amount: 180, created_at: '2026-08-03T10:10:00.000Z' },
  { id: 'order-3', customer_id: 'customer-3', status: 'Processing', amount: 320, created_at: '2026-08-03T12:05:00.000Z' },
]

const initialCustomers: Customer[] = [
  { id: 'customer-1', name: 'Ava Patel', email: 'ava@example.com' },
  { id: 'customer-2', name: 'Marcus Chen', email: 'marcus@example.com' },
  { id: 'customer-3', name: 'Lina Gomez', email: 'lina@example.com' },
]

const emptyProductForm: ProductFormState = {
  title: '',
  description: '',
  price: '',
  stock: '',
  category: '',
}

const emptyOrderForm: OrderFormState = {
  customer_id: '',
  status: 'Pending',
  amount: '',
}

const emptyCustomerForm: CustomerFormState = {
  name: '',
  email: '',
}

const initialSettings: SettingsState = {
  aiEnabled: true,
  autoReorder: true,
  emailAlerts: true,
  dashboardMode: 'Weekly',
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value)

const formatNumber = (value: number) => new Intl.NumberFormat('en-US').format(value)

const getOrderAmount = (order: Order) => {
  const rawValue = (order as Order & { total?: number | null }).total ?? order.amount
  const parsedValue = typeof rawValue === 'number' ? rawValue : Number.parseFloat(String(rawValue ?? ''))

  return Number.isFinite(parsedValue) ? parsedValue : 0
}

function App() {
  const [activeView, setActiveView] = useState<ViewKey>('dashboard')
  const [products, setProducts] = useState<Product[]>(initialProducts)
  const [orders, setOrders] = useState<Order[]>(initialOrders)
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [isLoading, setIsLoading] = useState(true)
  const [statusMessage, setStatusMessage] = useState('Store data is syncing with Supabase.')
  const [error, setError] = useState<string | null>(null)
  const [productForm, setProductForm] = useState<ProductFormState>(emptyProductForm)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)
  const [isProductModalOpen, setIsProductModalOpen] = useState(false)
  const [orderForm, setOrderForm] = useState<OrderFormState>(emptyOrderForm)
  const [customerForm, setCustomerForm] = useState<CustomerFormState>(emptyCustomerForm)
  const [settings, setSettings] = useState<SettingsState>(initialSettings)
  const [aiPrompt, setAiPrompt] = useState('Recommend a replenishment plan for the top-selling products this week.')
  const [aiResponse, setAiResponse] = useState('AI can prioritize Aurora Lamp, Nova Headset, and Halo Chair for restock.')

  useEffect(() => {
    let isMounted = true

    const loadData = async () => {
      try {
        const [productData, orderData, customerData] = await Promise.all([
          getProducts().catch(() => []),
          getOrders().catch(() => []),
          getCustomers().catch(() => []),
        ])

        if (!isMounted) {
          return
        }

        setProducts(productData.length ? productData : initialProducts)
        setOrders(orderData.length ? orderData : initialOrders)
        setCustomers(customerData.length ? customerData : initialCustomers)
        setStatusMessage('Live data loaded successfully.')
        setError(null)
      } catch (err) {
        if (!isMounted) {
          return
        }

        setProducts(initialProducts)
        setOrders(initialOrders)
        setCustomers(initialCustomers)
        setStatusMessage('Using local demo data while Supabase is unavailable.')
        setError(err instanceof Error ? err.message : 'Unable to load data right now.')
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    loadData()

    return () => {
      isMounted = false
    }
  }, [])

  const metrics = useMemo(() => {
    const totalSales = orders.reduce((sum, order) => sum + getOrderAmount(order), 0)
    const totalProducts = products.length
    const totalCustomers = customers.length
    const lowStockCount = products.filter((product) => product.stock < 10).length

    return {
      totalSales,
      orders: orders.length,
      products: totalProducts,
      customers: totalCustomers,
      lowStockCount,
    }
  }, [customers.length, orders, products])

  const customerMap = useMemo(
    () => new Map(customers.map((customer) => [customer.id, customer.name])),
    [customers],
  )

  const topProducts = useMemo(() => {
  return products
    .filter((product) => product != null)
    .sort((a, b) => (b.stock ?? 0) - (a.stock ?? 0))
    .slice(0, 3)
}, [products])

  const handleSelectView = (view: ViewKey) => {
    setActiveView(view)
    setError(null)
  }

  const closeProductModal = () => {
    setIsProductModalOpen(false)
    setEditingProductId(null)
    setProductForm(emptyProductForm)
  }

  const handleOpenProductModal = () => {
    setEditingProductId(null)
    setProductForm(emptyProductForm)
    setIsProductModalOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProductId(product.id)
    setProductForm({
      title: product.title,
      description: product.description,
      price: String(product.price),
      stock: String(product.stock),
      category: product.category,
    })
    setIsProductModalOpen(true)
  }

  const handleProductSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const payload = {
      title: productForm.title.trim(),
      description: productForm.description.trim(),
      price: Number(productForm.price),
      stock: Number(productForm.stock),
      category: productForm.category.trim(),
    }

    if (!payload.title || !payload.description || Number.isNaN(payload.price) || Number.isNaN(payload.stock) || !payload.category) {
      setError('Please complete every product field before saving.')
      return
    }

    try {
      const savedProduct = editingProductId
        ? await updateProduct(editingProductId, payload)
        : await createProduct(payload)

      setProducts((current) =>
        editingProductId
          ? current.map((product) => (product.id === editingProductId ? savedProduct : product))
          : [savedProduct, ...current],
      )
      setProductForm(emptyProductForm)
      setEditingProductId(null)
      setIsProductModalOpen(false)
      setStatusMessage(editingProductId ? 'Product updated successfully.' : 'Product created successfully.')
      setError(null)
    } catch (err) {
      const fallbackProduct: Product = {
        id: editingProductId ?? `local-${Date.now()}`,
        ...payload,
        created_at: new Date().toISOString(),
      }
      setProducts((current) =>
        editingProductId ? current.map((product) => (product.id === editingProductId ? fallbackProduct : product)) : [fallbackProduct, ...current],
      )
      setIsProductModalOpen(false)
      setStatusMessage('Saved locally because the remote write failed.')
      setError(err instanceof Error ? err.message : 'Unable to save product right now.')
    }
  }

  const handleDeleteProduct = async (id: string) => {
    try {
      await deleteProduct(id)
      setProducts((current) => current.filter((product) => product.id !== id))
      setStatusMessage('Product removed.')
    } catch (err) {
      setProducts((current) => current.filter((product) => product.id !== id))
      setStatusMessage('Product removed from the local view.')
      setError(err instanceof Error ? err.message : 'Unable to remove product right now.')
    }
  }

  const handleOrderSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!orderForm.customer_id || !orderForm.amount) {
      setError('Select a customer and enter an order amount.')
      return
    }

    try {
      const createdOrder = await createOrder({
        customer_id: orderForm.customer_id,
        status: orderForm.status,
        amount: Number(orderForm.amount),
      })
      setOrders((current) => [createdOrder, ...current])
      setOrderForm(emptyOrderForm)
      setStatusMessage('Order created successfully.')
      setError(null)
    } catch (err) {
      const fallbackOrder: Order = {
        id: `local-order-${Date.now()}`,
        customer_id: orderForm.customer_id,
        status: orderForm.status,
        amount: Number(orderForm.amount),
        created_at: new Date().toISOString(),
      }
      setOrders((current) => [fallbackOrder, ...current])
      setOrderForm(emptyOrderForm)
      setStatusMessage('Order saved locally while the remote sync completed later.')
      setError(err instanceof Error ? err.message : 'Unable to create order right now.')
    }
  }

  const handleOrderStatusChange = async (id: string, nextStatus: string) => {
    try {
      await supabase.from('orders').update({ status: nextStatus }).eq('id', id)
      setOrders((current) => current.map((order) => (order.id === id ? { ...order, status: nextStatus } : order)))
      setStatusMessage(`Order marked as ${nextStatus}.`)
    } catch (err) {
      setOrders((current) => current.map((order) => (order.id === id ? { ...order, status: nextStatus } : order)))
      setStatusMessage('Order status updated locally.')
      setError(err instanceof Error ? err.message : 'Unable to update order status.')
    }
  }

  const handleDeleteOrder = (id: string) => {
    setOrders((current) => current.filter((order) => order.id !== id))
    setStatusMessage('Order removed from the active workspace.')
  }

  const handleCustomerSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!customerForm.name.trim() || !customerForm.email.trim()) {
      setError('Please provide a customer name and email.')
      return
    }

    try {
      const { data } = await supabase
        .from('customers')
        .insert({ name: customerForm.name.trim(), email: customerForm.email.trim() })
        .select('*')
        .single()

      const savedCustomer: Customer = data ?? {
        id: `local-customer-${Date.now()}`,
        name: customerForm.name.trim(),
        email: customerForm.email.trim(),
        created_at: new Date().toISOString(),
      }

      setCustomers((current) => [savedCustomer, ...current])
      setCustomerForm(emptyCustomerForm)
      setStatusMessage('Customer added successfully.')
      setError(null)
    } catch (err) {
      const fallbackCustomer: Customer = {
        id: `local-customer-${Date.now()}`,
        name: customerForm.name.trim(),
        email: customerForm.email.trim(),
        created_at: new Date().toISOString(),
      }
      setCustomers((current) => [fallbackCustomer, ...current])
      setStatusMessage('Customer saved locally.')
      setError(err instanceof Error ? err.message : 'Unable to save customer right now.')
    }
  }

  const handleSettingToggle = (key: keyof SettingsState) => {
    setSettings((current) => ({ ...current, [key]: !current[key] }))
  }

  const handleSaveSettings = () => {
    setStatusMessage('Settings saved. AI and automation preferences are ready.')
  }

  const handleGenerateAiInsight = () => {
    const focusProduct = topProducts[0]?.title ?? 'your flagship product'
    setAiResponse(`AI recommends replenishing ${focusProduct} first because it is trending above the target stock level.`)
    setStatusMessage('AI insight generated.')
  }

  const renderDashboard = () => (
    <>
      <section className="hero-panel">
        <div>
          <p className="eyebrow">Operations center</p>
          <h2>Demand is rising across premium accessories.</h2>
          <p>Stock health is strong, conversion improved 18%, and AI recommendations are driving faster fulfillment.</p>
        </div>
        <div className="hero-chip">+18.2% this week</div>
      </section>

      <section className="stats-grid" aria-label="Performance overview">
        <article className="stat-card">
          <div className="stat-top">
            <p>Total Sales</p>
            <span className="badge positive">+12.4%</span>
          </div>
          <div className="stat-value">{formatCurrency(metrics.totalSales)}</div>
          <div className="stat-foot">vs last month</div>
        </article>
        <article className="stat-card">
          <div className="stat-top">
            <p>Orders</p>
            <span className="badge positive">+8.1%</span>
          </div>
          <div className="stat-value">{formatNumber(metrics.orders)}</div>
          <div className="stat-foot">processed today</div>
        </article>
        <article className="stat-card">
          <div className="stat-top">
            <p>Products</p>
            <span className="badge neutral">+3.2%</span>
          </div>
          <div className="stat-value">{formatNumber(metrics.products)}</div>
          <div className="stat-foot">active SKUs</div>
        </article>
        <article className="stat-card">
          <div className="stat-top">
            <p>Customers</p>
            <span className="badge positive">+5.7%</span>
          </div>
          <div className="stat-value">{formatNumber(metrics.customers)}</div>
          <div className="stat-foot">retained users</div>
        </article>
      </section>

      <section className="content-grid">
        <div className="panel">
          <div className="panel-header">
            <div>
              <p className="eyebrow">Live activity</p>
              <h3>Recent orders</h3>
            </div>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 4).map((order) => (
                  <tr key={order.id}>
                    <td>{order.id}</td>
                    <td>{customerMap.get(order.customer_id) ?? 'Unknown customer'}</td>
                    <td>{formatCurrency(getOrderAmount(order))}</td>
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
              <h3>Command center</h3>
            </div>
          </div>
          <div className="insights-list">
            <div className="insight-item">
              <strong>Inventory sync</strong>
              <span>All high-demand products are stocked above target.</span>
            </div>
            <div className="insight-item">
              <strong>Customer sentiment</strong>
              <span>Positive feedback rose 11% after the AI shopping assistant rollout.</span>
            </div>
            <div className="insight-item">
              <strong>Low-stock watch</strong>
              <span>{metrics.lowStockCount} products require a replenishment review.</span>
            </div>
          </div>
        </div>
      </section>
    </>
  )

  const renderProducts = () => (
    <>
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Inventory</p>
            <h3>Products</h3>
          </div>
          <button type="button" className="ghost-btn" onClick={handleOpenProductModal}>
            + Add product
          </button>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.title}</td>
                  <td>{product.category}</td>
                  <td>{formatCurrency(product.price)}</td>
                  <td>{product.stock}</td>
                  <td>
                    <div className="action-group">
                      <button type="button" className="ghost-btn small" onClick={() => handleEditProduct(product)}>
                        Edit
                      </button>
                      <button type="button" className="ghost-btn small" onClick={() => handleDeleteProduct(product.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {isProductModalOpen ? (
        <div className="product-modal-backdrop" onClick={closeProductModal}>
          <div className="product-modal" onClick={(event) => event.stopPropagation()}>
            <div className="product-modal-header">
              <h3>{editingProductId ? 'Edit product' : 'Create product'}</h3>
              <button type="button" className="ghost-btn small" onClick={closeProductModal}>
                Close
              </button>
            </div>
            <form className="product-form" onSubmit={handleProductSubmit}>
              <div className="form-row">
                <label>
                  Title
                  <input value={productForm.title} onChange={(event) => setProductForm((current) => ({ ...current, title: event.target.value }))} />
                </label>
                <label>
                  Category
                  <input value={productForm.category} onChange={(event) => setProductForm((current) => ({ ...current, category: event.target.value }))} />
                </label>
              </div>
              <label>
                Description
                <input value={productForm.description} onChange={(event) => setProductForm((current) => ({ ...current, description: event.target.value }))} />
              </label>
              <div className="form-row">
                <label>
                  Price
                  <input type="number" value={productForm.price} onChange={(event) => setProductForm((current) => ({ ...current, price: event.target.value }))} />
                </label>
                <label>
                  Stock
                  <input type="number" value={productForm.stock} onChange={(event) => setProductForm((current) => ({ ...current, stock: event.target.value }))} />
                </label>
              </div>
              <div className="product-actions">
                <button type="submit" className="ghost-btn">
                  Save product
                </button>
                <button type="button" className="ghost-btn" onClick={closeProductModal}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  )

  const renderOrders = () => (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Workflow</p>
          <h3>Orders</h3>
        </div>
      </div>
      <form className="product-form" onSubmit={handleOrderSubmit}>
        <div className="form-row">
          <label>
            Customer
            <select value={orderForm.customer_id} onChange={(event) => setOrderForm((current) => ({ ...current, customer_id: event.target.value }))}>
              <option value="">Select a customer</option>
              {customers.map((customer) => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                </option>
              ))}
            </select>
          </label>
          <label>
            Status
            <select value={orderForm.status} onChange={(event) => setOrderForm((current) => ({ ...current, status: event.target.value }))}>
              <option value="Pending">Pending</option>
              <option value="Packed">Packed</option>
              <option value="Delivered">Delivered</option>
            </select>
          </label>
        </div>
        <label>
          Amount
          <input type="number" value={orderForm.amount} onChange={(event) => setOrderForm((current) => ({ ...current, amount: event.target.value }))} />
        </label>
        <div className="product-actions">
          <button type="submit" className="ghost-btn">
            Create order
          </button>
        </div>
      </form>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Order</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>{order.id}</td>
                <td>{customerMap.get(order.customer_id) ?? 'Unknown customer'}</td>
                <td>{formatCurrency(getOrderAmount(order))}</td>
                <td>
                  <select value={order.status} onChange={(event) => handleOrderStatusChange(order.id, event.target.value)}>
                    <option value="Pending">Pending</option>
                    <option value="Packed">Packed</option>
                    <option value="Delivered">Delivered</option>
                  </select>
                </td>
                <td>
                  <button type="button" className="ghost-btn small" onClick={() => handleDeleteOrder(order.id)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )

  const renderCustomers = () => (
    <div className="content-grid">
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">CRM</p>
            <h3>Customers</h3>
          </div>
        </div>
        <form className="product-form" onSubmit={handleCustomerSubmit}>
          <label>
            Full name
            <input value={customerForm.name} onChange={(event) => setCustomerForm((current) => ({ ...current, name: event.target.value }))} />
          </label>
          <label>
            Email
            <input value={customerForm.email} onChange={(event) => setCustomerForm((current) => ({ ...current, email: event.target.value }))} />
          </label>
          <div className="product-actions">
            <button type="submit" className="ghost-btn">
              Add customer
            </button>
          </div>
        </form>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Relationships</p>
            <h3>Customer directory</h3>
          </div>
        </div>
        <div className="insights-list">
          {customers.map((customer) => (
            <div key={customer.id} className="insight-item">
              <strong>{customer.name}</strong>
              <span>{customer.email}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )

  const renderAi = () => (
    <div className="content-grid">
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Copilot</p>
            <h3>AI assistant</h3>
          </div>
        </div>
        <label>
          Prompt
          <textarea value={aiPrompt} onChange={(event) => setAiPrompt(event.target.value)} rows={4} />
        </label>
        <div className="product-actions">
          <button type="button" className="ghost-btn" onClick={handleGenerateAiInsight}>
            Generate insight
          </button>
        </div>
        <div className="ai-response">{aiResponse}</div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Recommendations</p>
            <h3>Suggested actions</h3>
          </div>
        </div>
        <div className="insights-list">
          {topProducts.map((product) => (
            <div key={product.id} className="insight-item">
              <strong>{product.title}</strong>
              <span>Stock {product.stock} units • {formatCurrency(product.price)} each</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )

  const renderAnalytics = () => (
    <div className="content-grid">
      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Insights</p>
            <h3>Analytics</h3>
          </div>
        </div>
        <div className="analytics-list">
          <div className="analytics-card">
            <strong>Revenue forecast</strong>
            <span>{formatCurrency(metrics.totalSales + 4800)}</span>
          </div>
          <div className="analytics-card">
            <strong>Repeat rate</strong>
            <span>24%</span>
          </div>
          <div className="analytics-card">
            <strong>Restock readiness</strong>
            <span>{metrics.lowStockCount} products need attention</span>
          </div>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Health</p>
            <h3>Inventory snapshot</h3>
          </div>
        </div>
        <div className="insights-list">
          {products.map((product) => (
            <div key={product.id} className="insight-item">
              <strong>{product.title}</strong>
              <span>{product.stock} in stock • {formatCurrency(product.price)}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  )

  const renderSettings = () => (
    <section className="panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Preferences</p>
          <h3>Settings</h3>
        </div>
      </div>
      <div className="settings-list">
        <label className="setting-row">
          <span>AI assistant enabled</span>
          <input type="checkbox" checked={settings.aiEnabled} onChange={() => handleSettingToggle('aiEnabled')} />
        </label>
        <label className="setting-row">
          <span>Auto reorder</span>
          <input type="checkbox" checked={settings.autoReorder} onChange={() => handleSettingToggle('autoReorder')} />
        </label>
        <label className="setting-row">
          <span>Email alerts</span>
          <input type="checkbox" checked={settings.emailAlerts} onChange={() => handleSettingToggle('emailAlerts')} />
        </label>
        <label className="setting-row">
          <span>Dashboard mode</span>
          <select value={settings.dashboardMode} onChange={(event) => setSettings((current) => ({ ...current, dashboardMode: event.target.value }))}>
            <option value="Daily">Daily</option>
            <option value="Weekly">Weekly</option>
            <option value="Monthly">Monthly</option>
          </select>
        </label>
      </div>
      <div className="product-actions">
        <button type="button" className="ghost-btn" onClick={handleSaveSettings}>
          Save settings
        </button>
      </div>
    </section>
  )

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
          {navItems.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`nav-item ${activeView === item.key ? 'active' : ''}`}
              onClick={() => handleSelectView(item.key)}
            >
              <span className="nav-left">
                <span className="icon">{item.icon}</span>
                <span>{item.label}</span>
              </span>
            </button>
          ))}
        </nav>

        <div className="sidebar-card">
          <p className="card-label">AI Assistant</p>
          <h3>Live insights enabled</h3>
          <p>Automations are monitoring stock, demand, and customer trends.</p>
          <button type="button" className="ghost-btn" onClick={() => handleSelectView('ai')}>
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
            <button type="button" className="ghost-btn" onClick={() => handleSelectView('analytics')}>
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

        {error ? <div className="form-error">{error}</div> : null}
        <div className="status-bar">{isLoading ? 'Loading data…' : statusMessage}</div>

        {activeView === 'dashboard' && renderDashboard()}
        {activeView === 'products' && renderProducts()}
        {activeView === 'orders' && renderOrders()}
        {activeView === 'customers' && renderCustomers()}
        {activeView === 'ai' && renderAi()}
        {activeView === 'analytics' && renderAnalytics()}
        {activeView === 'settings' && renderSettings()}
      </main>
    </div>
  )
}

export default App
