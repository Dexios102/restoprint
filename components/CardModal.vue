<template>
   <div class="modal" :class="{ 'is-active': isModalOpen }">
      <div class="modal-content">
        <span class="close-btn" @click="isModalOpen = false">&times;</span>
        <h2>Modal Title</h2>
        <pre>{{ ports }}</pre>
      </div>
    </div>
</template>

<script lang="ts" setup>

const isModalOpen = defineModel({required: true, default: false})

const props = defineProps<{
  ports: any[]
}>()

</script>

<style scoped>
/* Styles for the open button */
.open-modal-btn {
  padding: 10px 20px;
  font-size: 16px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}

.open-modal-btn:hover {
  background-color: #0056b3;
}

/* Modal Styles */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: none;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.modal.is-active {
  display: flex;
  opacity: 1;
}

/* Modal Content */
.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  text-align: center;
  width: 300px;
  position: relative;
}

/* Close Button */
.close-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 20px;
  cursor: pointer;
}

.close-btn:hover {
  color: red;
}

</style>