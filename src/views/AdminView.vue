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
              <th>Type</th>
              <th>Deal</th>
              <th>Target</th>
              <th>Active</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!paginatedPromotions.length">
              <td colspan="7" class="admin-empty">No promotions yet.</td>
            </tr>
            <tr v-for="item in paginatedPromotions" :key="item.id">
              <td>{{ item.id }}</td>
              <td>{{ item.title }}</td>
              <td>{{ formatPromoTypeLabel(item.promoType) }}</td>
              <td>{{ formatPromotionDeal(item) }}</td>
              <td>{{ formatPromotionTarget(item) }}</td>
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
              <th>Image</th>
              <th>Title</th>
              <th>Published</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="!paginatedBlogs.length">
              <td colspan="5" class="admin-empty">No blog posts yet.</td>
            </tr>
            <tr v-for="item in paginatedBlogs" :key="item.id">
              <td>{{ item.id }}</td>
              <td class="blog-image-cell">
                <img
                  v-if="blogRowImageUrl(item)"
                  :src="blogRowImageUrl(item)"
                  :alt="item.title"
                  class="blog-table-thumb"
                  referrerpolicy="no-referrer"
                  loading="lazy"
                  decoding="async"
                />
                <span v-else class="muted">—</span>
              </td>
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
          <fieldset class="customization-field span-2">
            <legend>Customization options</legend>
            <p class="customization-hint">
              These options appear on the menu page for this dish. They match the storefront by default.
            </p>
            <div class="customization-tools">
              <div class="customization-add">
                <input
                  v-model="newCustomizationOption"
                  type="text"
                  placeholder="e.g. Extra cheese, No onion"
                  @keydown.enter.prevent="addCustomizationOption"
                />
                <button type="button" class="admin-btn admin-btn-ghost" @click="addCustomizationOption">
                  Add
                </button>
              </div>
              <button
                type="button"
                class="admin-btn admin-btn-ghost"
                :disabled="!productModalForm.cuisineCategory || !productModalForm.category"
                @click="resetCustomizationToDefaults"
              >
                Reset to category defaults
              </button>
            </div>
            <ul v-if="productCustomizationOptions.length" class="customization-list">
              <li
                v-for="(option, index) in productCustomizationOptions"
                :key="`${option}-${index}`"
              >
                <span>{{ option }}</span>
                <button
                  type="button"
                  class="admin-btn admin-btn-ghost"
                  @click="removeCustomizationOption(index)"
                >
                  Remove
                </button>
              </li>
            </ul>
            <p v-else class="customization-hint">
              Select a cuisine and food category to load the default customization options.
            </p>
          </fieldset>
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
          <label class="span-2">
            Promotion type
            <select v-model="promotionModalForm.promoType">
              <option value="percent">Discount (% off)</option>
              <option value="bogo">Buy 1, get 2nd at % off</option>
              <option value="freebie">Buy item, get free add-on</option>
            </select>
          </label>
          <label
            v-if="promotionModalForm.promoType === 'percent' || promotionModalForm.promoType === 'bogo'"
            class="span-2"
          >
            Discount percentage
            <input
              v-model.number="promotionModalForm.discountValue"
              type="number"
              min="1"
              max="100"
              step="1"
              required
            />
          </label>
          <fieldset
            v-if="promotionModalForm.promoType === 'percent' || promotionModalForm.promoType === 'bogo'"
            class="span-2 admin-fieldset"
          >
            <legend>Target food categories</legend>
            <p class="admin-hint">Check "All categories" or pick specific ones below.</p>
            <label class="admin-all-categories">
              <input
                v-model="promotionApplyToAllCategories"
                type="checkbox"
                @change="onPromotionApplyToAllChange"
              />
              <span>All categories</span>
            </label>
            <div class="admin-chip-grid">
              <label
                v-for="cat in allProductCategories"
                :key="cat"
                class="admin-check admin-chip-check"
              >
                <input
                  type="checkbox"
                  :value="cat"
                  v-model="promotionModalForm.targetCategories"
                  @change="onTargetCategoryChange"
                />
                {{ cat }}
              </label>
            </div>
          </fieldset>
          <template v-if="promotionModalForm.promoType === 'freebie'">
            <label class="span-2">
              Buy this product
              <select v-model.number="promotionModalForm.triggerProductId" required>
                <option :value="null" disabled>Select a product</option>
                <option v-for="product in products" :key="product.id" :value="product.id">
                  {{ product.name }} ({{ product.category }})
                </option>
              </select>
            </label>
            <label class="span-2">
              Free item label
              <input
                v-model="promotionModalForm.freeItemLabel"
                placeholder="e.g. drink, fries, dessert"
                required
              />
            </label>
          </template>
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
          <div v-if="promotionImagePreviewUrl" class="image-preview span-2">
            <img
              :src="promotionImagePreviewUrl"
              alt="Promotion image preview"
              referrerpolicy="no-referrer"
              @error="promotionImagePreviewFailed = true"
              @load="promotionImagePreviewFailed = false"
            />
            <p v-if="promotionImagePreviewFailed" class="image-preview-error">
              Preview could not load. Use a direct https:// link to an image file (jpg, png, webp).
            </p>
          </div>
          <label class="admin-check">
            <input v-model="promotionModalForm.isActive" type="checkbox" />
            <span>Active on storefront</span>
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
      <form class="admin-form" novalidate @submit.prevent="saveBlog">
        <div class="admin-form-grid">
          <label>Tag <input v-model="blogModalForm.tag" required /></label>
          <label>Date <input v-model="blogModalForm.date" required /></label>
          <label class="span-2">Title <input v-model="blogModalForm.title" required /></label>
          <label class="span-2">Excerpt <textarea v-model="blogModalForm.excerpt" rows="3" required /></label>
          <label class="span-2">
            Image URL
            <input
              v-model="blogModalForm.image"
              type="text"
              inputmode="url"
              autocomplete="off"
              placeholder="https://example.com/blog-cover.jpg"
            />
          </label>
          <div v-if="blogImagePreviewUrl" class="image-preview span-2">
            <img
              :src="blogImagePreviewUrl"
              alt="Blog image preview"
              referrerpolicy="no-referrer"
              @error="blogImagePreviewFailed = true"
              @load="blogImagePreviewFailed = false"
            />
            <p v-if="blogImagePreviewFailed" class="image-preview-error">
              Preview could not load. Use a direct https:// link to an image file (jpg, png, webp).
            </p>
          </div>
          <label class="span-2">
            Read more link
            <input
              v-model="blogModalForm.readMoreUrl"
              type="text"
              inputmode="url"
              autocomplete="off"
              placeholder="https://example.com/article or /menu"
            />
            <span class="field-hint">Where “Read more” goes on the blog page. Leave empty to default to /menu.</span>
          </label>
          <label class="admin-check">
            <input v-model="blogModalForm.isPublished" type="checkbox" />
            <span>Published on blog page</span>
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
  normalizeLinkUrl,
  normalizeReadMoreLinkForSave,
  readMoreLinkErrorMessage
} from '../utils/linkUrl'
import {
  isValidHttpImageUrl,
  normalizeProductImageUrl,
  productImageUrlErrorMessage
} from '../utils/productImageUrl'
import {
  getCategoryCustomizationDefaults,
  getProductCustomizationOptions
} from '../utils/productCustomization'
import {
  formatPromoDeal,
  promoTargetsAllCategories,
  PROMO_TYPES
} from '../utils/promotionUtils'

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
const newCustomizationOption = ref('')
const productCustomizationOptions = ref([])

const productImagePreviewUrl = computed(() => adminImagePreviewUrl(productModalForm.image))
const promotionImagePreviewFailed = ref(false)
const promotionImagePreviewUrl = computed(() => adminImagePreviewUrl(promotionModalForm.image))
const blogImagePreviewFailed = ref(false)
const blogImagePreviewUrl = computed(() => adminImagePreviewUrl(blogModalForm.image))
const promotionModalForm = reactive(emptyPromotion())
const promotionApplyToAllCategories = ref(true)
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

watch(
  () => [productModalForm.cuisineCategory, productModalForm.category],
  () => {
    if (!productModalOpen.value || productModalMode.value !== 'create') return
    syncProductModalCustomization()
  }
)

function adminImagePreviewUrl(value) {
  const url = normalizeProductImageUrl(value)
  return isValidHttpImageUrl(url) ? url : ''
}

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

function addCustomizationOption() {
  const value = newCustomizationOption.value.trim()
  if (!value) return
  if (productCustomizationOptions.value.includes(value)) {
    notify('That option is already listed.', 'error')
    return
  }
  productCustomizationOptions.value = [...productCustomizationOptions.value, value]
  newCustomizationOption.value = ''
}

function removeCustomizationOption(index) {
  productCustomizationOptions.value = productCustomizationOptions.value.filter((_, i) => i !== index)
}

function resetCustomizationToDefaults() {
  if (!productModalForm.cuisineCategory || !productModalForm.category) return
  productCustomizationOptions.value = getCategoryCustomizationDefaults(
    productModalForm.cuisineCategory,
    productModalForm.category
  )
}

function syncProductModalCustomization() {
  if (!productModalOpen.value || !productModalForm.cuisineCategory || !productModalForm.category) {
    return
  }
  productCustomizationOptions.value = getCategoryCustomizationDefaults(
    productModalForm.cuisineCategory,
    productModalForm.category
  )
}

function emptyPromotion() {
  return {
    id: null,
    title: '',
    detail: '',
    tagline: 'Limited time',
    image: '',
    promoType: PROMO_TYPES.PERCENT,
    discountValue: 10,
    targetCategories: [],
    triggerProductId: null,
    freeItemLabel: '',
    isActive: true
  }
}

function onPromotionApplyToAllChange() {
  if (promotionApplyToAllCategories.value) {
    promotionModalForm.targetCategories = []
  }
}

function onTargetCategoryChange() {
  if (promotionModalForm.targetCategories.length > 0) {
    promotionApplyToAllCategories.value = false
  } else {
    promotionApplyToAllCategories.value = true
  }
}

function formatPromoTypeLabel(type) {
  if (type === PROMO_TYPES.BOGO) return 'Buy 1 get % off'
  if (type === PROMO_TYPES.FREEBIE) return 'Free add-on'
  return 'Discount'
}

function formatPromotionDeal(item) {
  const trigger = products.value.find((product) => product.id === item.triggerProductId)
  return formatPromoDeal(item, trigger?.name)
}

function formatPromotionTarget(item) {
  if (item.promoType === PROMO_TYPES.FREEBIE) {
    const trigger = products.value.find((product) => product.id === item.triggerProductId)
    return trigger ? trigger.name : '—'
  }
  if (promoTargetsAllCategories(item)) return 'All categories'
  return (item.targetCategories ?? []).join(', ') || 'All categories'
}

function emptyBlog() {
  return {
    id: null,
    tag: '',
    date: '',
    title: '',
    excerpt: '',
    image: '',
    readMoreUrl: '',
    isPublished: true
  }
}

function blogRowImageUrl(item) {
  return adminImagePreviewUrl(item?.image)
}

function buildBlogPayload(form) {
  return {
    tag: form.tag,
    date: form.date,
    title: form.title,
    excerpt: form.excerpt,
    image: form.image,
    readMoreUrl: form.readMoreUrl,
    isPublished: form.isPublished
  }
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
      const [promoRes, productRes] = await Promise.all([adminPromotions.list(), adminProducts.list()])
      promotions.value = promoRes.data
      products.value = (productRes.data ?? []).filter((item) => item?.id != null)
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
  newCustomizationOption.value = ''
  productCustomizationOptions.value = []
  Object.assign(productModalForm, emptyProduct())
}

function openCreateProduct() {
  Object.assign(productModalForm, emptyProduct())
  productCustomizationOptions.value = []
  productModalMode.value = 'create'
  productModalOpen.value = true
}

function editProduct(item) {
  Object.assign(productModalForm, { ...item })
  productCustomizationOptions.value = [...getProductCustomizationOptions(item)]
  productModalMode.value = 'edit'
  productModalOpen.value = true
}

function buildProductPayload(form) {
  const footerCuisine = resolveFooterCuisine(form.cuisineCategory)
  const image = normalizeProductImageUrl(form.image)
  let customizationOptions = productCustomizationOptions.value
    .map((item) => String(item).trim())
    .filter(Boolean)
  if (!customizationOptions.length && form.cuisineCategory && form.category) {
    customizationOptions = getCategoryCustomizationDefaults(form.cuisineCategory, form.category)
  }
  return {
    name: form.name,
    description: form.description,
    price: form.price,
    category: form.category,
    cuisineCategory: form.cuisineCategory,
    footerCuisine,
    image,
    customizationOptions
  }
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
  promotionApplyToAllCategories.value = true
  promotionImagePreviewFailed.value = false
  Object.assign(promotionModalForm, emptyPromotion())
}

function openCreatePromotion() {
  Object.assign(promotionModalForm, emptyPromotion())
  promotionApplyToAllCategories.value = true
  promotionModalMode.value = 'create'
  promotionModalOpen.value = true
}

function editPromotion(item) {
  const promoType = item.promoType || PROMO_TYPES.PERCENT
  let discountValue = Number(item.discountValue) || 0
  if (
    (promoType === PROMO_TYPES.PERCENT || promoType === PROMO_TYPES.BOGO) &&
    discountValue <= 0
  ) {
    discountValue = 10
  }
  Object.assign(promotionModalForm, {
    ...item,
    promoType,
    discountValue,
    targetCategories: [...(item.targetCategories ?? [])],
    triggerProductId: item.triggerProductId ?? null,
    freeItemLabel: item.freeItemLabel ?? ''
  })
  promotionApplyToAllCategories.value = !(item.targetCategories ?? []).length
  promotionModalMode.value = 'edit'
  promotionModalOpen.value = true
}

function buildPromotionPayload(form) {
  return {
    title: form.title,
    detail: form.detail,
    tagline: form.tagline,
    image: form.image,
    promoType: form.promoType,
    discountValue: form.discountValue,
    targetCategories: [...(form.targetCategories ?? [])],
    triggerProductId: form.triggerProductId,
    freeItemLabel: form.freeItemLabel,
    isActive: form.isActive
  }
}

async function savePromotion() {
  const imageError = productImageUrlErrorMessage(promotionModalForm.image)
  if (imageError) {
    notify(imageError, 'error')
    return
  }
  promotionModalForm.image = normalizeProductImageUrl(promotionModalForm.image)
  const payload = buildPromotionPayload(promotionModalForm)
  try {
    if (promotionModalMode.value === 'create') {
      await adminPromotions.create(payload)
      notify('Promotion created')
    } else {
      await adminPromotions.update(promotionModalForm.id, payload)
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
  blogImagePreviewFailed.value = false
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
  const imageUrl = normalizeProductImageUrl(blogModalForm.image)
  if (imageUrl) {
    const imageError = productImageUrlErrorMessage(imageUrl)
    if (imageError) {
      notify(imageError, 'error')
      return
    }
  }
  blogModalForm.image = imageUrl

  const linkUrl = normalizeReadMoreLinkForSave(blogModalForm.readMoreUrl)
  if (linkUrl) {
    const linkError = readMoreLinkErrorMessage(blogModalForm.readMoreUrl)
    if (linkError) {
      notify(linkError, 'error')
      return
    }
  }
  blogModalForm.readMoreUrl = linkUrl

  const payload = buildBlogPayload(blogModalForm)

  try {
    if (blogModalMode.value === 'create') {
      await adminBlogs.create(payload)
      notify('Blog post created')
    } else {
      await adminBlogs.update(blogModalForm.id, payload)
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

.field-hint {
  font-size: 0.75rem;
  font-weight: 400;
  color: #64748b;
  line-height: 1.4;
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

.admin-form input[type='checkbox'] {
  width: 1.05rem;
  height: 1.05rem;
  padding: 0;
  margin: 0;
  accent-color: #3b82f6;
  cursor: pointer;
  flex-shrink: 0;
  border: 1px solid #64748b;
  border-radius: 4px;
  background: #0b1220;
}

.admin-check {
  display: inline-flex !important;
  align-items: center;
  gap: 0.55rem;
  color: #e2e8f0 !important;
  grid-column: span 2;
  width: fit-content;
  cursor: pointer;
  user-select: none;
  font-size: 0.9rem !important;
}

.admin-check span {
  line-height: 1.4;
}

.admin-form-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 1rem;
  flex-wrap: wrap;
}

.admin-table-card {
  padding: 0;
  overflow-x: auto;
  overflow-y: visible;
}

.admin-table-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem 1.15rem;
}

.admin-table-toolbar h2 {
  margin: 0;
  line-height: 1.4;
}

.admin-toolbar-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.admin-filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.75rem;
}

.admin-filters label {
  display: grid;
  gap: 0.35rem;
  font-size: 0.8rem;
  line-height: 1.4;
  color: #94a3b8;
}

.admin-filters select {
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 0.5rem 0.65rem;
  background: #0b1220;
  color: #f8fafc;
  font-size: 0.9rem;
  line-height: 1.5;
  min-height: 2.375rem;
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

.blog-image-cell {
  width: 4.5rem;
}

.blog-table-thumb {
  width: 3rem;
  height: 3rem;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #334155;
  display: block;
}

.customization-field {
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 0.85rem;
  display: grid;
  gap: 0.65rem;
}

.admin-fieldset {
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 0.85rem;
  display: grid;
  gap: 0.65rem;
}

.admin-fieldset legend {
  padding: 0 0.35rem;
  color: #cbd5e1;
  font-size: 0.88rem;
  font-weight: 600;
}

.admin-hint {
  margin: 0;
  font-size: 0.82rem;
  color: #94a3b8;
}

.admin-all-categories {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #cbd5e1;
  width: fit-content;
  cursor: pointer;
  user-select: none;
}

.admin-all-categories span {
  font-size: 0.9rem;
  font-weight: 600;
}

.admin-all-categories input[type='checkbox'] {
  width: 1.05rem;
  height: 1.05rem;
}

.admin-chip-check input[type='checkbox'] {
  width: 0.95rem;
  height: 0.95rem;
}

.admin-chip-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.admin-chip-check {
  grid-column: auto;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  border: 1px solid #334155;
  border-radius: 999px;
  padding: 0.35rem 0.65rem;
  font-size: 0.82rem;
  cursor: pointer;
  user-select: none;
}

.customization-field legend {
  padding: 0 0.35rem;
  color: #cbd5e1;
  font-size: 0.88rem;
  font-weight: 600;
}

.customization-hint {
  margin: 0;
  font-size: 0.82rem;
  color: #94a3b8;
}

.customization-tools {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.5rem;
}

.customization-add {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.5rem;
  flex: 1 1 16rem;
}

.customization-add input {
  border: 1px solid #334155;
  border-radius: 8px;
  padding: 0.5rem 0.65rem;
  background: #0b1220;
  color: #f8fafc;
}

.customization-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.45rem;
}

.customization-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.45rem 0.65rem;
  border: 1px solid #334155;
  border-radius: 8px;
  background: #0f172a;
}

.customization-list span {
  color: #e2e8f0;
  font-size: 0.88rem;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 0.88rem;
}

.admin-table th {
  text-align: left;
  padding: 0.75rem 0.85rem;
  background: #1e293b;
  color: #94a3b8;
  font-weight: 600;
  font-size: 0.75rem;
  line-height: 1.5;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  vertical-align: middle;
  white-space: nowrap;
}

.admin-table td {
  padding: 0.75rem 0.85rem;
  border-top: 1px solid #1e293b;
  color: #e2e8f0;
  line-height: 1.5;
  vertical-align: middle;
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
