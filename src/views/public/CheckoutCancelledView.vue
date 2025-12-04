<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

onMounted(() => {
  const returnPath = localStorage.getItem('checkoutReturnPath')
  localStorage.removeItem('checkoutReturnPath')

  if (returnPath) {
    router.replace(returnPath)
  } else {
    router.replace('/meine-buchungen')
  }
})
</script>
