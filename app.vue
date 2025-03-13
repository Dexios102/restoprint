<template>
  <div>
    <div id="printable-content">
      <h2>Invoice</h2>
      <p>Date: {{ new Date().toLocaleDateString() }}</p>
      <p>Item: Sample Product</p>
      <p>Price: $100</p>
    </div>

    <button @click="printContent">🖨 Print</button>
  </div>
</template>

<script setup lang="ts">
import { Print } from 'capacitor-print'

async function printContent() {
  const printableElement = document.getElementById('printable-content')

  if (!printableElement) {
    alert('No content to print')
    return
  }

  const content = printableElement.innerHTML

  await Print.print({
    content,
  })
}
</script>

<!-- <template>
  <div>
    <div id="printable-content">
      <h2>Invoice</h2>
      <p>Date: {{ new Date().toLocaleDateString() }}</p>
      <p>Item: Sample Product</p>
      <p>Price: $100</p>
    </div>

    <button @click="printContent">🖨 Print</button>
  </div>
</template>

<script setup lang="ts">
import printJS from "print-js";

function printContent() {
  printJS({
    printable: "printable-content",
    type: "html",
    style: "body { font-family: Arial, sans-serif; padding: 20px; }",
    scanStyles: false,
  });
}
</script> -->



