<template>
  <div>
    <div id="printable-content">
      <h2>Invoice</h2>
      <p>Date: {{ new Date().toLocaleDateString() }}</p>
      <p>Item: Sample Product</p>
      <p>Price: $100</p>
    </div>

    <button @click="printContent">🖨 Print</button>
    <pre>{{ ports }}</pre>
  </div>
  <CardModal v-model="showPortsModal" :ports="ports"  />
</template>

<script setup lang="ts">
// reference https://github.com/auctifera-josed/starprnt
import { StarPRNT } from '@awesome-cordova-plugins/star-prnt';

const ports = ref<any>([])
const showPortsModal = ref(false)


const printContent = async () => {
  showPortsModal.value = true;
  try {

    let hasBarcodeReader = true;

    const starprntObj = await StarPRNT;
    console.log('StarPRNT:', starprntObj);

    let emulation = starprntObj.Emulation.StarPRNT;
    

    // Discover printers available on all ports (Bluetooth, USB, Network)
    ports.value = await StarPRNT.portDiscovery('All');
    console.log('Port Discovery:', ports);

    // Check if any printers were found
    if (ports.value.length === 0) {
      alert('No printers found!');
      return;
    } else {
      showPortsModal.value = true;
    }

    // Automatically choose the first available printer (you can modify this if needed)
    const selectedPrinter = ports.value[0] as any;
    console.log('Connecting to printer:', selectedPrinter);

    // Connect to the selected printer
    const connection = await StarPRNT.connect(selectedPrinter?.portName, emulation, hasBarcodeReader);
    console.log('connection result', connection);

    // Define the print object
    const printObj = {
      text: "Star Clothing Boutique\n123 Star Road\nCity, State 12345\n\n",
      cutReceipt: true, // This tells the printer to cut the receipt after printing
      openCashDrawer: true // This opens the cash drawer (if supported)
    };

    // Send the print job to the connected printer
    await StarPRNT.printRawText(selectedPrinter?.portName, emulation, printObj)
    console.log('Printing done!');

  } catch (error) {
    console.error('Error connecting to printers or printing:', error);
  }
};


</script>
