<template>
  <div class="map-picker">
    <div class="map-toolbar">
      <button type="button" class="btn btn-secondary btn-sm" :disabled="geocoding" @click="locateFromAddress">
        {{ geocoding ? 'Searching…' : 'Find on map' }}
      </button>
      <button type="button" class="btn btn-secondary btn-sm" :disabled="locating" @click="useCurrentLocation">
        {{ locating ? 'Locating…' : 'Use my location' }}
      </button>
    </div>
    <p v-if="mapHint" class="map-hint muted">{{ mapHint }}</p>
    <div ref="mapEl" class="map-canvas" role="application" aria-label="Delivery location map. Click to set pin." />
    <p class="map-footnote muted">Click the map to adjust your delivery pin.</p>
  </div>
</template>

<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'

const DEFAULT_CENTER = { lat: 3.139, lng: 101.6869 }

const props = defineProps({
  address: { type: String, default: '' },
  lat: { type: Number, default: null },
  lng: { type: Number, default: null }
})

const emit = defineEmits(['update:coordinates', 'reverse-geocode'])

const mapEl = ref(null)
const geocoding = ref(false)
const locating = ref(false)
const mapHint = ref('')

let map = null
let marker = null

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
})

function hasCoords() {
  return Number.isFinite(props.lat) && Number.isFinite(props.lng)
}

function emitCoords(lat, lng) {
  emit('update:coordinates', { lat, lng })
}

function setMarker(lat, lng, pan = true) {
  if (!map) return
  if (!marker) {
    marker = L.marker([lat, lng], { icon: defaultIcon, draggable: true }).addTo(map)
    marker.on('dragend', () => {
      const { lat: mLat, lng: mLng } = marker.getLatLng()
      emitCoords(mLat, mLng)
      reverseGeocode(mLat, mLng)
    })
  } else {
    marker.setLatLng([lat, lng])
  }
  if (pan) map.setView([lat, lng], Math.max(map.getZoom(), 15))
  emitCoords(lat, lng)
}

function onMapClick(event) {
  const { lat, lng } = event.latlng
  setMarker(lat, lng, false)
  reverseGeocode(lat, lng)
}

async function nominatimSearch(query) {
  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('format', 'json')
  url.searchParams.set('limit', '1')
  url.searchParams.set('q', query)
  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' }
  })
  if (!res.ok) throw new Error('Geocoding failed')
  const data = await res.json()
  return data[0] ?? null
}

async function nominatimReverse(lat, lng) {
  const url = new URL('https://nominatim.openstreetmap.org/reverse')
  url.searchParams.set('format', 'json')
  url.searchParams.set('lat', String(lat))
  url.searchParams.set('lon', String(lng))
  const res = await fetch(url.toString(), {
    headers: { Accept: 'application/json' }
  })
  if (!res.ok) throw new Error('Reverse geocoding failed')
  return res.json()
}

async function locateFromAddress() {
  const query = props.address.trim()
  if (!query) {
    mapHint.value = 'Enter an address first, then tap Find on map.'
    return
  }
  geocoding.value = true
  mapHint.value = ''
  try {
    const hit = await nominatimSearch(query)
    if (!hit) {
      mapHint.value = 'Address not found. Try a more specific location or click the map.'
      return
    }
    const lat = Number(hit.lat)
    const lng = Number(hit.lon)
    setMarker(lat, lng)
    if (hit.display_name) emit('reverse-geocode', hit.display_name)
  } catch {
    mapHint.value = 'Could not search the map. Check your connection or click the map to pin.'
  } finally {
    geocoding.value = false
  }
}

async function reverseGeocode(lat, lng) {
  try {
    const data = await nominatimReverse(lat, lng)
    if (data?.display_name) emit('reverse-geocode', data.display_name)
  } catch {
    /* keep typed address */
  }
}

function useCurrentLocation() {
  if (!navigator.geolocation) {
    mapHint.value = 'Location is not available in this browser.'
    return
  }
  locating.value = true
  mapHint.value = ''
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
      setMarker(lat, lng)
      reverseGeocode(lat, lng)
      locating.value = false
    },
    () => {
      mapHint.value = 'Could not access your location. Allow permission or pick on the map.'
      locating.value = false
    },
    { enableHighAccuracy: true, timeout: 12000 }
  )
}

function initMap() {
  const start = hasCoords()
    ? { lat: props.lat, lng: props.lng }
    : DEFAULT_CENTER
  map = L.map(mapEl.value, { scrollWheelZoom: true }).setView([start.lat, start.lng], 13)
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map)
  map.on('click', onMapClick)
  if (hasCoords()) setMarker(props.lat, props.lng, false)
}

watch(
  () => [props.lat, props.lng],
  ([lat, lng]) => {
    if (!map || !Number.isFinite(lat) || !Number.isFinite(lng)) return
    setMarker(lat, lng, false)
  }
)

onMounted(() => {
  initMap()
  setTimeout(() => map?.invalidateSize(), 120)
})

onBeforeUnmount(() => {
  map?.off()
  map?.remove()
  map = null
  marker = null
})
</script>

<style scoped>
.map-picker {
  display: grid;
  gap: 0.55rem;
}

.map-toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.btn-sm {
  padding: 0.45rem 0.85rem;
  font-size: 0.85rem;
}

.map-hint {
  margin: 0;
  font-size: 0.85rem;
  color: #9a3412;
}

.map-canvas {
  width: 100%;
  height: 220px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--line-strong);
  overflow: hidden;
  z-index: 0;
}

.map-footnote {
  margin: 0;
  font-size: 0.8rem;
}
</style>
