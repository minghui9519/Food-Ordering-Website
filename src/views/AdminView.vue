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
      <div class="admin-card admin-table-card">
        <div class="admin-table-toolbar">
          <h2>Product list</h2>
          <div class="admin-toolbar-actions">
            <button type="button" class="admin-btn admin-btn-primary" @click="openCreateProduct">
              Add product
            </button>
          </div>
          <div class="admin-filters">
            <label>
              Cuisine
              <select v-model="productFilterCuisine" @change="onProductFilterCuisineChange">
                <option value="All">All cuisines</option>
                <option v-for="option in cuisineOptions" :key="option.key" :value="option.label">
                  {{ option.label }}
                </option>
              </select>
            </label>
            <label>
              Food category
              <select v-model="productFilterCategory">
                <option value="All">All categories</option>
                <option v-for="cat in productFilterCategoryOptions" :key="cat" :value="cat">
                  {{ cat }}
                </option>
              </select>
            </label>
            <button
              v-if="productFilterCuisine !== 'All' || productFilterCategory !== 'All'"
              type="button"
              class="admin-btn admin-btn-ghost"
              @click="clearProductFilters"
            >
              Clear filters
            </button>
          </div>
        </div>
        <table class="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Price</th>
              <th>Category</th>
              <th>Cuisine</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!paginatedProducts.length">
              <td colspan="6" class="admin-empty">No products match the selected filters.</td>
            </tr>
            <tr v-for="item in paginatedProducts" :key="item.id">
              <td>{{ item.id }}</td>
              <td>{{ item.name }}</td>
              <td>${{ formatAdminPrice(item.price) }}</td>
              <td>{{ item.category }}</td>
              <td>{{ item.cuisineCategory }}</td>
              <td class="admin-row-actions">
                <button type="button" class="admin-btn admin-btn-ghost" @click="editProduct(item)">Edit</button>
                <button type="button" class="admin-btn admin-btn-danger" @click="removeProduct(item.id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
        <AdminPagination
          label="product"
          :total-items="productTotalItems"
          :current-page="productCurrentPage"
          :total-pages="productTotalPages"
          :page-numbers="productPageNumbers"
          :range-start="productRangeStart"
          :range-end="productRangeEnd"
          @page-change="goToProductPage"
        />
      </div>
    </section>

    <!-- Promotions -->
    <section v-show="activeTab === 'promotions'" class="admin-panel">
      <div class="admin-card admin-table-card">
        <div class="admin-table-toolbar">
          <h2>Promotion list</h2>
          <div class="admin-toolbar-actions">
            <button type="button" class="admin-btn admin-btn-primary" @click="openCreatePromotion">
              Add promotion
            </button>
          </div>
        </div>
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
            <tr v-if="!paginatedPromotions.length">
              <td colspan="4" class="admin-empty">No promotions yet.</td>
            </tr>
            <tr v-for="item in paginatedPromotions" :key="item.id">
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
        <AdminPagination
          label="promotion"
          :total-items="promotionTotalItems"
          :current-page="promotionCurrentPage"
          :total-pages="promotionTotalPages"
          :page-numbers="promotionPageNumbers"
          :range-start="promotionRangeStart"
          :range-end="promotionRangeEnd"
          @page-change="goToPromotionPage"
        />
      </div>
    </section>

    <!-- Blogs -->
    <section v-show="activeTab === 'blogs'" class="admin-panel">
      <div class="admin-card admin-table-card">
        <div class="admin-table-toolbar">
          <h2>Blog list</h2>
          <div class="admin-toolbar-actions">
            <button type="button" class="admin-btn admin-btn-primary" @click="openCreateBlog">
              Add blog post
            </button>
          </div>
        </div>
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
            <tr v-if="!paginatedBlogs.length">
              <td colspan="4" class="admin-empty">No blog posts yet.</td>
            </tr>
            <tr v-for="item in paginatedBlogs" :key="item.id">
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
        <AdminPagination
          label="blog post"
          :total-items="blogTotalItems"
          :current-page="blogCurrentPage"
          :total-pages="blogTotalPages"
          :page-numbers="blogPageNumbers"
          :range-start="blogRangeStart"
          :range-end="blogRangeEnd"
          @page-change="goToBlogPage"
        />
      </div>
    </section>

    <AdminTransactionsPanel v-show="activeTab === 'transactions'" />

    <!-- Users -->
    <section v-show="activeTab === 'users'" class="admin-panel">
      <div class="admin-card admin-table-card">
        <div class="admin-table-toolbar">
          <h2>User list</h2>
          <div class="admin-toolbar-actions">
            <button type="button" class="admin-btn admin-btn-primary" @click="openCreateUser">
              Create user
            </button>
          </div>
        </div>
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
            <tr v-if="!paginatedUsers.length">
              <td colspan="5" class="admin-empty">No users yet.</td>
            </tr>
            <tr v-for="item in paginatedUsers" :key="item.id">
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
        <AdminPagination
          label="user"
          :total-items="userTotalItems"
          :current-page="userCurrentPage"
          :total-pages="userTotalPages"
          :page-numbers="userPageNumbers"
          :range-start="userRangeStart"
          :range-end="userRangeEnd"
          @page-change="goToUserPage"
        />
      </div>
    </section>

    <!-- Create / edit modals -->
    <AdminModal :open="productModalOpen" :title="productModalTitle" @close="closeProductModal">
      <form class="admin-form" @submit.prevent="saveProduct">
        <div class="admin-form-grid">
          <label>Name <input v-model="productModalForm.name" required /></label>
          <label>Price <input v-model.number="productModalForm.price" type="number" step="0.01" min="0" required /></label>
          <label class="span-2">Description <textarea v-model="productModalForm.description" rows="2" required /></label>
          <label>
            Cuisine
            <select v-model="productModalForm.cuisineCategory" required>
              <option disabled value="">Select cuisine</option>
              <option v-for="option in cuisineOptions" :key="option.key" :value="option.label">
                {{ option.label }}
              </option>
            </select>
          </label>
          <label>
            Food category
            <select v-model="productModalForm.category" required>
              <option disabled value="">Select category</option>
              <option v-for="cat in productModalCategoryOptions" :key="cat" :value="cat">
                {{ cat }}
              </option>
            </select>
          </label>
          <label class="span-2">
            Image URL
            <input
              v-model="productModalForm.image"
              type="url"
              inputmode="url"
              autocomplete="off"
              placeholder="https://example.com/photo.jpg"
              required
            />
          </label>
          <div v-if="productImagePreviewUrl" class="image-preview span-2">
            <img
              :src="productImagePreviewUrl"
              alt="Image preview"
              referrerpolicy="no-referrer"
              @error="productImagePreviewFailed = true"
              @load="productImagePreviewFailed = false"
            />
            <p v-if="productImagePreviewFailed" class="image-preview-error">
              Preview could not load. Use a direct https:// link to an image file (jpg, png, webp).
            </p>
          </div>
        </div>
        <div class="admin-form-actions">
          <button class="admin-btn admin-btn-primary" type="submit">
            {{ productModalMode === 'create' ? 'Create' : 'Update' }}
          </button>
          <button class="admin-btn admin-btn-ghost" type="button" @click="closeProductModal">Cancel</button>
        </div>
      </form>
    </AdminModal>

    <AdminModal :open="promotionModalOpen" :title="promotionModalTitle" @close="closePromotionModal">
      <form class="admin-form" @submit.prevent="savePromotion">
        <div class="admin-form-grid">
          <label>Title <input v-model="promotionModalForm.title" required /></label>
          <label>Tagline <input v-model="promotionModalForm.tagline" /></label>
          <label class="span-2">Detail <textarea v-model="promotionModalForm.detail" rows="2" required /></label>
          <label class="span-2">
            Image URL
            <input
              v-model="promotionModalForm.image"
              type="url"
              inputmode="url"
              autocomplete="off"
              placeholder="https://example.com/promo.jpg"
              required
            />
          </label>
          <label class="admin-check">
            <input v-model="promotionModalForm.isActive" type="checkbox" />
            Active on storefront
          </label>
        </div>
        <div class="admin-form-actions">
          <button class="admin-btn admin-btn-primary" type="submit">
            {{ promotionModalMode === 'create' ? 'Create' : 'Update' }}
          </button>
          <button class="admin-btn admin-btn-ghost" type="button" @click="closePromotionModal">Cancel</button>
        </div>
      </form>
    </AdminModal>

    <AdminModal :open="blogModalOpen" :title="blogModalTitle" @close="closeBlogModal">
      <form class="admin-form" @submit.prevent="saveBlog">
        <div class="admin-form-grid">
          <label>Tag <input v-model="blogModalForm.tag" required /></label>
          <label>Date <input v-model="blogModalForm.date" required /></label>
          <label class="span-2">Title <input v-model="blogModalForm.title" required /></label>
          <label class="span-2">Excerpt <textarea v-model="blogModalForm.excerpt" rows="3" required /></label>
          <label class="admin-check">
            <input v-model="blogModalForm.isPublished" type="checkbox" />
            Published on blog page
          </label>
        </div>
        <div class="admin-form-actions">
          <button class="admin-btn admin-btn-primary" type="submit">
            {{ blogModalMode === 'create' ? 'Create' : 'Update' }}
          </button>
          <button class="admin-btn admin-btn-ghost" type="button" @click="closeBlogModal">Cancel</button>
        </div>
      </form>
    </AdminModal>

    <AdminModal :open="userModalOpen" :title="userModalTitle" @close="closeUserModal">
      <form class="admin-form" @submit.prevent="saveUser">
        <div class="admin-form-grid">
          <label>Name <input v-model="userModalForm.name" required /></label>
          <label>Email <input v-model="userModalForm.email" type="email" required /></label>
          <label>
            Password
            <input
              v-model="userModalForm.password"
              type="password"
              :required="userModalMode === 'create'"
              :placeholder="userModalMode === 'create' ? '' : 'Leave blank to keep'"
            />
          </label>
          <label>
            Role
            <select v-model="userModalForm.role">
              <option value="customer">Customer</option>
              <option value="admin">Admin</option>
            </select>
          </label>
          <label>Phone <input v-model="userModalForm.phone" /></label>
          <label>Address <input v-model="userModalForm.address" /></label>
        </div>
        <div class="admin-form-actions">
          <button class="admin-btn admin-btn-primary" type="submit">
            {{ userModalMode === 'create' ? 'Create' : 'Update' }}
          </button>
          <button class="admin-btn admin-btn-ghost" type="button" @click="closeUserModal">Cancel</button>
        </div>
      </form>
    </AdminModal>

    <AdminModal
      :open="userDetailOpen"
      :title="selectedUser ? `User #${selectedUser.id}` : 'User details'"
      @close="closeUserDetail"
    >
      <dl v-if="selectedUser" class="admin-detail">
        <div><dt>Name</dt><dd>{{ selectedUser.name }}</dd></div>
        <div><dt>Email</dt><dd>{{ selectedUser.email }}</dd></div>
        <div><dt>Phone</dt><dd>{{ selectedUser.phone || '—' }}</dd></div>
        <div><dt>Address</dt><dd>{{ selectedUser.address || '—' }}</dd></div>
        <div><dt>Role</dt><dd>{{ selectedUser.role }}</dd></div>
      </dl>
      <div class="admin-form-actions">
        <button class="admin-btn admin-btn-ghost" type="button" @click="closeUserDetail">Close</button>
      </div>
    </AdminModal>
  </div>
</template>

<script setup>
import { computed, inject, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import { adminProducts, adminPromotions, adminBlogs, adminUsers } from '../api/admin'
import AdminModal from '../components/admin/AdminModal.vue'
import AdminPagination from '../components/admin/AdminPagination.vue'
import AdminTransactionsPanel from '../components/admin/AdminTransactionsPanel.vue'
import { formatAdminPrice, useAdminPagination } from '../composables/useAdminPagination'
import {
  allProductCategories,
  cuisineOptions,
  isValidCatalogProduct,
  productCategoriesForCuisine,
  resolveFooterCuisine
} from '../data/foodCatalog'
import { useCatalogStore } from '../stores/catalog'
import {
  isValidHttpImageUrl,
  normalizeProductImageUrl,
  productImageUrlErrorMessage
} from '../utils/productImageUrl'

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
const productFilterCuisine = ref('All')
const productFilterCategory = ref('All')
const promotions = ref([])
const blogs = ref([])
const users = ref([])
const selectedUser = ref(null)

const productModalOpen = ref(false)
const productModalMode = ref('create')
const promotionModalOpen = ref(false)
const promotionModalMode = ref('create')
const blogModalOpen = ref(false)
const blogModalMode = ref('create')
const userModalOpen = ref(false)
const userModalMode = ref('create')
const userDetailOpen = ref(false)

const productModalForm = reactive(emptyProduct())
const productImagePreviewFailed = ref(false)

const productImagePreviewUrl = computed(() => {
  const url = normalizeProductImageUrl(productModalForm.image)
  return isValidHttpImageUrl(url) ? url : ''
})
const promotionModalForm = reactive(emptyPromotion())
const blogModalForm = reactive(emptyBlog())
const userModalForm = reactive(emptyUser())

const productModalTitle = computed(() =>
  productModalMode.value === 'create' ? 'Add product' : 'Edit product'
)
const promotionModalTitle = computed(() =>
  promotionModalMode.value === 'create' ? 'Add promotion' : 'Edit promotion'
)
const blogModalTitle = computed(() =>
  blogModalMode.value === 'create' ? 'Add blog post' : 'Edit blog post'
)
const userModalTitle = computed(() =>
  userModalMode.value === 'create' ? 'Create user' : 'Edit user'
)

const productModalCategoryOptions = computed(() => {
  const options = [...allProductCategories]
  if (productModalForm.category && !options.includes(productModalForm.category)) {
    options.push(productModalForm.category)
  }
  return options.sort()
})

const productFilterCategoryOptions = computed(() => {
  if (productFilterCuisine.value === 'All') {
    return allProductCategories
  }
  return productCategoriesForCuisine(productFilterCuisine.value)
})

const filteredProducts = computed(() =>
  products.value.filter((item) => {
    if (productFilterCuisine.value !== 'All' && item.cuisineCategory !== productFilterCuisine.value) {
      return false
    }
    if (productFilterCategory.value !== 'All' && item.category !== productFilterCategory.value) {
      return false
    }
    return true
  })
)

const {
  paginatedItems: paginatedProducts,
  totalItems: productTotalItems,
  currentPage: productCurrentPage,
  totalPages: productTotalPages,
  pageNumbers: productPageNumbers,
  rangeStart: productRangeStart,
  rangeEnd: productRangeEnd,
  goToPage: goToProductPage,
  resetPage: resetProductPage
} = useAdminPagination(filteredProducts)

const {
  paginatedItems: paginatedPromotions,
  totalItems: promotionTotalItems,
  currentPage: promotionCurrentPage,
  totalPages: promotionTotalPages,
  pageNumbers: promotionPageNumbers,
  rangeStart: promotionRangeStart,
  rangeEnd: promotionRangeEnd,
  goToPage: goToPromotionPage,
  resetPage: resetPromotionPage
} = useAdminPagination(promotions)

const {
  paginatedItems: paginatedBlogs,
  totalItems: blogTotalItems,
  currentPage: blogCurrentPage,
  totalPages: blogTotalPages,
  pageNumbers: blogPageNumbers,
  rangeStart: blogRangeStart,
  rangeEnd: blogRangeEnd,
  goToPage: goToBlogPage,
  resetPage: resetBlogPage
} = useAdminPagination(blogs)

const {
  paginatedItems: paginatedUsers,
  totalItems: userTotalItems,
  currentPage: userCurrentPage,
  totalPages: userTotalPages,
  pageNumbers: userPageNumbers,
  rangeStart: userRangeStart,
  rangeEnd: userRangeEnd,
  goToPage: goToUserPage,
  resetPage: resetUserPage
} = useAdminPagination(users)

function onProductFilterCuisineChange() {
  if (
    productFilterCategory.value !== 'All' &&
    !productFilterCategoryOptions.value.includes(productFilterCategory.value)
  ) {
    productFilterCategory.value = 'All'
  }
  resetProductPage()
}

function clearProductFilters() {
  productFilterCuisine.value = 'All'
  productFilterCategory.value = 'All'
  resetProductPage()
}

watch([productFilterCuisine, productFilterCategory], () => {
  resetProductPage()
})

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
      products.value = (data ?? []).filter((item) => item?.id != null)
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

watch(
  activeTab,
  () => {
    closeAllModals()
    loadTabData()
  },
  { flush: 'pre' }
)

function closeAllModals() {
  closeProductModal()
  closePromotionModal()
  closeBlogModal()
  closeUserModal()
  closeUserDetail()
}

async function refreshCatalog() {
  await catalog.fetchAll(true)
}

function closeProductModal() {
  productModalOpen.value = false
  productImagePreviewFailed.value = false
  Object.assign(productModalForm, emptyProduct())
}

function openCreateProduct() {
  Object.assign(productModalForm, emptyProduct())
  productModalMode.value = 'create'
  productModalOpen.value = true
}

function editProduct(item) {
  Object.assign(productModalForm, { ...item })
  productModalMode.value = 'edit'
  productModalOpen.value = true
}

function buildProductPayload(form) {
  const footerCuisine = resolveFooterCuisine(form.cuisineCategory)
  const image = normalizeProductImageUrl(form.image)
  return { ...form, footerCuisine, image }
}

async function saveProduct() {
  const imageError = productImageUrlErrorMessage(productModalForm.image)
  if (imageError) {
    notify(imageError, 'error')
    return
  }
  const payload = buildProductPayload(productModalForm)
  if (!isValidCatalogProduct(payload)) {
    notify('Choose a valid cuisine and food category from the lists.', 'error')
    return
  }
  try {
    if (productModalMode.value === 'create') {
      const { id: _id, ...createPayload } = payload
      await adminProducts.create(createPayload)
      notify('Product created')
    } else {
      await adminProducts.update(productModalForm.id, payload)
      notify('Product updated')
    }
    closeProductModal()
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

function closePromotionModal() {
  promotionModalOpen.value = false
  Object.assign(promotionModalForm, emptyPromotion())
}

function openCreatePromotion() {
  Object.assign(promotionModalForm, emptyPromotion())
  promotionModalMode.value = 'create'
  promotionModalOpen.value = true
}

function editPromotion(item) {
  Object.assign(promotionModalForm, { ...item })
  promotionModalMode.value = 'edit'
  promotionModalOpen.value = true
}

async function savePromotion() {
  const imageError = productImageUrlErrorMessage(promotionModalForm.image)
  if (imageError) {
    notify(imageError, 'error')
    return
  }
  promotionModalForm.image = normalizeProductImageUrl(promotionModalForm.image)
  try {
    if (promotionModalMode.value === 'create') {
      const { id: _id, ...payload } = promotionModalForm
      await adminPromotions.create(payload)
      notify('Promotion created')
    } else {
      await adminPromotions.update(promotionModalForm.id, { ...promotionModalForm })
      notify('Promotion updated')
    }
    closePromotionModal()
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

function closeBlogModal() {
  blogModalOpen.value = false
  Object.assign(blogModalForm, emptyBlog())
}

function openCreateBlog() {
  Object.assign(blogModalForm, emptyBlog())
  blogModalMode.value = 'create'
  blogModalOpen.value = true
}

function editBlog(item) {
  Object.assign(blogModalForm, { ...item })
  blogModalMode.value = 'edit'
  blogModalOpen.value = true
}

async function saveBlog() {
  try {
    if (blogModalMode.value === 'create') {
      const { id: _id, ...payload } = blogModalForm
      await adminBlogs.create(payload)
      notify('Blog post created')
    } else {
      await adminBlogs.update(blogModalForm.id, { ...blogModalForm })
      notify('Blog post updated')
    }
    closeBlogModal()
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

function closeUserModal() {
  userModalOpen.value = false
  Object.assign(userModalForm, emptyUser())
}

function closeUserDetail() {
  userDetailOpen.value = false
  selectedUser.value = null
}

function openCreateUser() {
  Object.assign(userModalForm, emptyUser())
  userModalMode.value = 'create'
  userModalOpen.value = true
}

function editUser(item) {
  Object.assign(userModalForm, { ...item, password: '' })
  userModalMode.value = 'edit'
  userModalOpen.value = true
}

async function viewUser(item) {
  try {
    const { data } = await adminUsers.get(item.id)
    selectedUser.value = data
    userDetailOpen.value = true
  } catch (err) {
    notify(err.response?.data?.message || 'Failed to load user', 'error')
  }
}

async function saveUser() {
  try {
    const payload = {
      name: userModalForm.name,
      email: userModalForm.email,
      phone: userModalForm.phone,
      address: userModalForm.address,
      role: userModalForm.role
    }
    if (userModalMode.value === 'create') {
      if (!userModalForm.password) {
        notify('Password is required for new users', 'error')
        return
      }
      payload.password = userModalForm.password
      await adminUsers.create(payload)
      notify('User created')
    } else {
      if (userModalForm.password) payload.password = userModalForm.password
      await adminUsers.update(userModalForm.id, payload)
      notify('User updated')
    }
    closeUserModal()
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
    closeUserDetail()
    closeUserModal()
    await loadTabData()
  } catch (err) {
    notify(err.response?.data?.message || 'Delete failed', 'error')
  }
}

onMounted(() => {
  loadTabData()
})

onUnmounted(() => {
  closeAllModals()
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

.admin-table-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.15rem 0;
}

.admin-table-toolbar h2 {
  margin: 0;
}

.admin-toolbar-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.admin-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  gap: 0.75rem;
}

.admin-filters label {
  display: grid;
  gap: 0.35rem;
  font-size: 0.8rem;
  color: #94a3b8;
}

.admin-filters select {
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 0.55rem 0.65rem;
  background: #0b1220;
  color: #f8fafc;
  font-size: 0.9rem;
  min-width: 10rem;
}

.admin-empty {
  text-align: center;
  color: #94a3b8;
  padding: 1.25rem !important;
}

.image-preview {
  display: grid;
  gap: 0.5rem;
}

.image-preview img {
  width: 100%;
  max-width: 280px;
  aspect-ratio: 1;
  object-fit: cover;
  border-radius: 10px;
  border: 1px solid #334155;
}

.image-preview-error {
  margin: 0;
  font-size: 0.82rem;
  color: #fca5a5;
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

  .admin-table-toolbar {
    flex-direction: column;
    align-items: stretch;
  }

  .admin-filters {
    flex-direction: column;
    align-items: stretch;
  }

  .admin-filters select {
    width: 100%;
  }
}
</style>
