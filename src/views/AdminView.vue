<template>
  <div class="admin-page">
    <header class="admin-page-head">
      <h1>{{ pageTitle }}</h1>
      <p>{{ pageSubtitle }}</p>
    </header>

    <p v-if="message" class="admin-alert" :class="messageType">{{ message }}</p>
    <p v-if="loading" class="admin-loading">Loading…</p>

    <!-- Products -->
    <section v-show="activeTab === 'products'" class="admin-panel">
      <form class="admin-card admin-form" @submit.prevent="saveProduct">
        <h2>{{ productForm.id ? 'Edit product' : 'Add product' }}</h2>
        <div class="admin-form-grid">
          <label>Name <input v-model="productForm.name" required /></label>
          <label>Price <input v-model.number="productForm.price" type="number" step="0.01" min="0" required /></label>
          <label class="span-2">Description <textarea v-model="productForm.description" rows="2" required /></label>
          <label>Category <input v-model="productForm.category" required /></label>
          <label>Cuisine <input v-model="productForm.cuisineCategory" required /></label>
          <label>Footer cuisine <input v-model="productForm.footerCuisine" required /></label>
          <label class="span-2">Image URL <input v-model="productForm.image" required /></label>
        </div>
        <div class="admin-form-actions">
          <button class="admin-btn admin-btn-primary" type="submit">{{ productForm.id ? 'Update' : 'Create' }}</button>
          <button v-if="productForm.id" class="admin-btn admin-btn-ghost" type="button" @click="resetProductForm">
            Cancel
          </button>
        </div>
      </form>
      <div class="admin-card admin-table-card">
        <table class="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Price</th>
              <th>Cuisine</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in products" :key="item.id">
              <td>{{ item.id }}</td>
              <td>{{ item.name }}</td>
              <td>${{ item.price.toFixed(2) }}</td>
              <td>{{ item.cuisineCategory }}</td>
              <td class="admin-row-actions">
                <button type="button" class="admin-btn admin-btn-ghost" @click="editProduct(item)">Edit</button>
                <button type="button" class="admin-btn admin-btn-danger" @click="removeProduct(item.id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Promotions -->
    <section v-show="activeTab === 'promotions'" class="admin-panel">
      <form class="admin-card admin-form" @submit.prevent="savePromotion">
        <h2>{{ promotionForm.id ? 'Edit promotion' : 'Add promotion' }}</h2>
        <div class="admin-form-grid">
          <label>Title <input v-model="promotionForm.title" required /></label>
          <label>Tagline <input v-model="promotionForm.tagline" /></label>
          <label class="span-2">Detail <textarea v-model="promotionForm.detail" rows="2" required /></label>
          <label class="span-2">Image URL <input v-model="promotionForm.image" required /></label>
          <label class="admin-check">
            <input v-model="promotionForm.isActive" type="checkbox" />
            Active on storefront
          </label>
        </div>
        <div class="admin-form-actions">
          <button class="admin-btn admin-btn-primary" type="submit">{{ promotionForm.id ? 'Update' : 'Create' }}</button>
          <button v-if="promotionForm.id" class="admin-btn admin-btn-ghost" type="button" @click="resetPromotionForm">
            Cancel
          </button>
        </div>
      </form>
      <div class="admin-card admin-table-card">
        <table class="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Active</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in promotions" :key="item.id">
              <td>{{ item.id }}</td>
              <td>{{ item.title }}</td>
              <td>{{ item.isActive ? 'Yes' : 'No' }}</td>
              <td class="admin-row-actions">
                <button type="button" class="admin-btn admin-btn-ghost" @click="editPromotion(item)">Edit</button>
                <button type="button" class="admin-btn admin-btn-danger" @click="removePromotion(item.id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Blogs -->
    <section v-show="activeTab === 'blogs'" class="admin-panel">
      <form class="admin-card admin-form" @submit.prevent="saveBlog">
        <h2>{{ blogForm.id ? 'Edit blog post' : 'Add blog post' }}</h2>
        <div class="admin-form-grid">
          <label>Tag <input v-model="blogForm.tag" required /></label>
          <label>Date <input v-model="blogForm.date" required /></label>
          <label class="span-2">Title <input v-model="blogForm.title" required /></label>
          <label class="span-2">Excerpt <textarea v-model="blogForm.excerpt" rows="3" required /></label>
          <label class="admin-check">
            <input v-model="blogForm.isPublished" type="checkbox" />
            Published on blog page
          </label>
        </div>
        <div class="admin-form-actions">
          <button class="admin-btn admin-btn-primary" type="submit">{{ blogForm.id ? 'Update' : 'Create' }}</button>
          <button v-if="blogForm.id" class="admin-btn admin-btn-ghost" type="button" @click="resetBlogForm">Cancel</button>
        </div>
      </form>
      <div class="admin-card admin-table-card">
        <table class="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Published</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in blogs" :key="item.id">
              <td>{{ item.id }}</td>
              <td>{{ item.title }}</td>
              <td>{{ item.isPublished ? 'Yes' : 'No' }}</td>
              <td class="admin-row-actions">
                <button type="button" class="admin-btn admin-btn-ghost" @click="editBlog(item)">Edit</button>
                <button type="button" class="admin-btn admin-btn-danger" @click="removeBlog(item.id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <AdminTransactionsPanel v-show="activeTab === 'transactions'" />

    <!-- Users -->
    <section v-show="activeTab === 'users'" class="admin-panel">
      <form class="admin-card admin-form" @submit.prevent="saveUser">
        <h2>{{ userForm.id ? 'Edit user' : 'Create user' }}</h2>
        <div class="admin-form-grid">
          <label>Name <input v-model="userForm.name" required /></label>
          <label>Email <input v-model="userForm.email" type="email" required /></label>
          <label>
            Password
            <input
              v-model="userForm.password"
              type="password"
              :required="!userForm.id"
              :placeholder="userForm.id ? 'Leave blank to keep' : ''"
            />
          </label>
          <label>
            Role
            <select v-model="userForm.role">
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <label>Phone <input v-model="userForm.phone" /></label>
          <label>Address <input v-model="userForm.address" /></label>
        </div>
        <div class="admin-form-actions">
          <button class="admin-btn admin-btn-primary" type="submit">{{ userForm.id ? 'Update' : 'Create' }}</button>
          <button v-if="userForm.id" class="admin-btn admin-btn-ghost" type="button" @click="resetUserForm">Cancel</button>
        </div>
      </form>
      <div class="admin-card admin-table-card">
        <table class="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in users" :key="item.id">
              <td>{{ item.id }}</td>
              <td>{{ item.name }}</td>
              <td>{{ item.email }}</td>
              <td>{{ item.role }}</td>
              <td class="admin-row-actions">
                <button type="button" class="admin-btn admin-btn-ghost" @click="viewUser(item)">Details</button>
                <button type="button" class="admin-btn admin-btn-ghost" @click="editUser(item)">Edit</button>
                <button type="button" class="admin-btn admin-btn-danger" @click="removeUser(item.id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <section v-if="selectedUser" class="admin-card admin-detail">
        <h3>User #{{ selectedUser.id }}</h3>
        <dl>
          <div><dt>Name</dt><dd>{{ selectedUser.name }}</dd></div>
          <div><dt>Email</dt><dd>{{ selectedUser.email }}</dd></div>
          <div><dt>Phone</dt><dd>{{ selectedUser.phone || '—' }}</dd></div>
          <div><dt>Address</dt><dd>{{ selectedUser.address || '—' }}</dd></div>
          <div><dt>Role</dt><dd>{{ selectedUser.role }}</dd></div>
        </dl>
      </section>
    </section>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, reactive, ref, watch } from 'vue'
import { adminProducts, adminPromotions, adminBlogs, adminUsers } from '../api/admin'
import { useCatalogStore } from '../stores/catalog'
import AdminTransactionsPanel from '../components/admin/AdminTransactionsPanel.vue'

const catalog = useCatalogStore()
const activeTab = inject('adminTab', ref('products'))

const pageTitle = computed(() => {
  const titles = {
    products: 'Products',
    promotions: 'Promotions',
    blogs: 'Blog posts',
    users: 'Users',
    transactions: 'Transactions'
  }
  return titles[activeTab.value] || 'Dashboard'
})

const pageSubtitle = computed(() =>
  activeTab.value === 'transactions'
    ? 'View customer orders and every line-item detail.'
    : 'Changes apply immediately on the public storefront.'
)

const loading = ref(false)
const message = ref('')
const messageType = ref('success')

const products = ref([])
const promotions = ref([])
const blogs = ref([])
const users = ref([])
const selectedUser = ref(null)

const productForm = reactive(emptyProduct())
const promotionForm = reactive(emptyPromotion())
const blogForm = reactive(emptyBlog())
const userForm = reactive(emptyUser())

function emptyProduct() {
  return {
    id: null,
    name: '',
    description: '',
    price: 0,
    category: '',
    cuisineCategory: '',
    footerCuisine: '',
    image: ''
  }
}

function emptyPromotion() {
  return { id: null, title: '', detail: '', tagline: 'Limited time', image: '', isActive: true }
}

function emptyBlog() {
  return { id: null, tag: '', date: '', title: '', excerpt: '', isPublished: true }
}

function emptyUser() {
  return { id: null, name: '', email: '', password: '', phone: '', address: '', role: 'customer' }
}

function notify(text, type = 'success') {
  message.value = text
  messageType.value = type
}

async function loadTabData() {
  if (activeTab.value === 'transactions') return
  loading.value = true
  try {
    if (activeTab.value === 'products') {
      const { data } = await adminProducts.list()
      products.value = data
    } else if (activeTab.value === 'promotions') {
      const { data } = await adminPromotions.list()
      promotions.value = data
    } else if (activeTab.value === 'blogs') {
      const { data } = await adminBlogs.list()
      blogs.value = data
    } else if (activeTab.value === 'users') {
      const { data } = await adminUsers.list()
      users.value = data
    }
  } catch (err) {
    notify(err.response?.data?.message || 'Failed to load data', 'error')
  } finally {
    loading.value = false
  }
}

watch(activeTab, () => {
  selectedUser.value = null
  loadTabData()
})

async function refreshCatalog() {
  await catalog.fetchAll(true)
}

function resetProductForm() {
  Object.assign(productForm, emptyProduct())
}

function editProduct(item) {
  Object.assign(productForm, { ...item })
}

async function saveProduct() {
  try {
    if (productForm.id) {
      await adminProducts.update(productForm.id, { ...productForm })
      notify('Product updated')
    } else {
      await adminProducts.create({ ...productForm })
      notify('Product created')
    }
    resetProductForm()
    await loadTabData()
    await refreshCatalog()
  } catch (err) {
    notify(err.response?.data?.message || 'Save failed', 'error')
  }
}

async function removeProduct(id) {
  if (!confirm('Delete this product?')) return
  try {
    await adminProducts.remove(id)
    notify('Product deleted')
    await loadTabData()
    await refreshCatalog()
  } catch (err) {
    notify(err.response?.data?.message || 'Delete failed', 'error')
  }
}

function resetPromotionForm() {
  Object.assign(promotionForm, emptyPromotion())
}

function editPromotion(item) {
  Object.assign(promotionForm, { ...item })
}

async function savePromotion() {
  try {
    if (promotionForm.id) {
      await adminPromotions.update(promotionForm.id, { ...promotionForm })
      notify('Promotion updated')
    } else {
      await adminPromotions.create({ ...promotionForm })
      notify('Promotion created')
    }
    resetPromotionForm()
    await loadTabData()
    await refreshCatalog()
  } catch (err) {
    notify(err.response?.data?.message || 'Save failed', 'error')
  }
}

async function removePromotion(id) {
  if (!confirm('Delete this promotion?')) return
  try {
    await adminPromotions.remove(id)
    notify('Promotion deleted')
    await loadTabData()
    await refreshCatalog()
  } catch (err) {
    notify(err.response?.data?.message || 'Delete failed', 'error')
  }
}

function resetBlogForm() {
  Object.assign(blogForm, emptyBlog())
}

function editBlog(item) {
  Object.assign(blogForm, { ...item })
}

async function saveBlog() {
  try {
    if (blogForm.id) {
      await adminBlogs.update(blogForm.id, { ...blogForm })
      notify('Blog post updated')
    } else {
      await adminBlogs.create({ ...blogForm })
      notify('Blog post created')
    }
    resetBlogForm()
    await loadTabData()
    await refreshCatalog()
  } catch (err) {
    notify(err.response?.data?.message || 'Save failed', 'error')
  }
}

async function removeBlog(id) {
  if (!confirm('Delete this blog post?')) return
  try {
    await adminBlogs.remove(id)
    notify('Blog post deleted')
    await loadTabData()
    await refreshCatalog()
  } catch (err) {
    notify(err.response?.data?.message || 'Delete failed', 'error')
  }
}

function resetUserForm() {
  Object.assign(userForm, emptyUser())
}

function editUser(item) {
  Object.assign(userForm, { ...item, password: '' })
  selectedUser.value = item
}

async function viewUser(item) {
  try {
    const { data } = await adminUsers.get(item.id)
    selectedUser.value = data
  } catch (err) {
    notify(err.response?.data?.message || 'Failed to load user', 'error')
  }
}

async function saveUser() {
  try {
    const payload = {
      name: userForm.name,
      email: userForm.email,
      phone: userForm.phone,
      address: userForm.address,
      role: userForm.role
    }
    if (userForm.password) payload.password = userForm.password
    if (userForm.id) {
      await adminUsers.update(userForm.id, payload)
      notify('User updated')
    } else {
      if (!userForm.password) {
        notify('Password is required for new users', 'error')
        return
      }
      await adminUsers.create(payload)
      notify('User created')
    }
    resetUserForm()
    await loadTabData()
  } catch (err) {
    notify(err.response?.data?.message || 'Save failed', 'error')
  }
}

async function removeUser(id) {
  if (!confirm('Delete this user?')) return
  try {
    await adminUsers.remove(id)
    notify('User deleted')
    selectedUser.value = null
    await loadTabData()
  } catch (err) {
    notify(err.response?.data?.message || 'Delete failed', 'error')
  }
}

onMounted(() => {
  loadTabData()
})
</script>

<style scoped>
.admin-page {
  display: grid;
  gap: 1rem;
}

.admin-page-head h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #f8fafc;
}

.admin-page-head p {
  margin: 0.25rem 0 0;
  font-size: 0.9rem;
  color: #64748b;
}

.admin-alert {
  margin: 0;
  padding: 0.6rem 0.85rem;
  border-radius: 8px;
  font-size: 0.88rem;
}

.admin-alert.success {
  background: #14532d;
  color: #bbf7d0;
}

.admin-alert.error {
  background: #450a0a;
  color: #fecaca;
}

.admin-loading {
  margin: 0;
  color: #94a3b8;
  font-size: 0.9rem;
}

.admin-panel {
  display: grid;
  gap: 1rem;
}

.admin-card {
  background: #0f172a;
  border: 1px solid #1e293b;
  border-radius: 12px;
  padding: 1.15rem;
}

.admin-card h2,
.admin-card h3 {
  margin: 0 0 1rem;
  font-size: 1.05rem;
  color: #f1f5f9;
}

.admin-form-grid {
  display: grid;
  gap: 0.75rem;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.admin-form-grid .span-2 {
  grid-column: span 2;
}

.admin-form label {
  display: grid;
  gap: 0.35rem;
  font-size: 0.8rem;
  color: #94a3b8;
}

.admin-form input,
.admin-form textarea,
.admin-form select {
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 0.55rem 0.65rem;
  background: #0b1220;
  color: #f8fafc;
  font-size: 0.9rem;
}

.admin-check {
  display: flex !important;
  align-items: center;
  gap: 0.5rem;
  color: #cbd5e1 !important;
  grid-column: span 2;
}

.admin-form-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.admin-table-card {
  padding: 0;
  overflow: hidden;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
}

.admin-table th {
  text-align: left;
  padding: 0.65rem 0.85rem;
  background: #1e293b;
  color: #94a3b8;
  font-weight: 600;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.admin-table td {
  padding: 0.65rem 0.85rem;
  border-top: 1px solid #1e293b;
  color: #e2e8f0;
}

.admin-row-actions {
  display: flex;
  gap: 0.35rem;
  flex-wrap: wrap;
}

.admin-detail dl {
  display: grid;
  gap: 0.65rem;
  margin: 0;
}

.admin-detail dt {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #64748b;
}

.admin-detail dd {
  margin: 0.15rem 0 0;
  color: #f1f5f9;
}

@media (max-width: 768px) {
  .admin-form-grid {
    grid-template-columns: 1fr;
  }

  .admin-form-grid .span-2,
  .admin-check {
    grid-column: span 1;
  }
}
</style>
