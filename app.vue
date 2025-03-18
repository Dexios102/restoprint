<template>
  <div>
    <div id="printable-content">
      <h2>Invoice</h2>
      <p>Star Clothing Boutique\n123 Star Road\nCity, State 12345</p>
    </div>

    <button @click="showPorts">🖨 {{ loadingPorts ? 'Showing..' : 'Show Available Devices' }}</button>
    <template v-if="ports.length > 0">
      <h5>Available Devices:</h5>
        <div v-for="port in ports" :key="port.portName" style="display: flex; justify-content: space-between; align-items: center;">
          <span>
            <p>{{ port.modelName }}</p>
          </span>
          <button @click="connectToPrinter(port)">{{ port == selectedDevice ? 'Connected' : 'Connect' }}</button>
        </div>
      </template>
    <h5 v-else-if="ports.length == 0 && !loadingPorts && showPortsTriggered">No connected devices available.</h5>


    <template v-if="selectedDevice">
      <h4>Print Now</h4>
      <button @click="handlePrint">Print</button>
    </template>


    <template v-if="connectionResult">
      <h5>Connection Result:</h5>
      <pre>{{ connectionResult }}</pre>
    </template>

    <template v-if="statusResult">
      <h5>Printer Status Result</h5>
      <pre>{{ statusResult }}</pre>
    </template>

    <template v-if="printResult">
      <h5>Print Result</h5>
      <pre>{{ printResult }}</pre>
    </template>
  </div>
</template>

<script setup lang="ts">
// reference https://github.com/auctifera-josed/starprnt
import { StarPRNT } from '@awesome-cordova-plugins/star-prnt';

const ports = ref<Port[]>([])
const showPortsTriggered = ref(false)
const loadingPorts = ref(false)
const selectedDevice = ref<Port | null>(null)
let hasBarcodeReader = true;
let emulation = 'StarPRNT';

const connectionResult = ref()
const printResult = ref()
const statusResult = ref()



const showPorts = async () => {
  try {
    showPortsTriggered.value = true;
    loadingPorts.value = true;
    const starprntObj = await StarPRNT;
    console.log('StarPRNT:', starprntObj);

    // Discover printers available on all ports (Bluetooth, USB, Network)
    ports.value = await StarPRNT.portDiscovery('All') as Port[];
    console.log('Port Discovery:', ports);

    // Check if any printers were found
    if (ports.value.length === 0) {
      alert('No printers found!');
    }    

  } catch (error) {
    console.error('Error connecting to printers or printing:', error);
  } finally {
    loadingPorts.value = false;
  }
};


const connectToPrinter = async (port: Port) => {
  selectedDevice.value = port

  try {
    // Connect to the selected printer
    const connection = await StarPRNT.connect(selectedDevice.value?.portName, emulation, hasBarcodeReader);
    connectionResult.value = connection as any;
  } catch (error) {
    alert("Connection Error: " + error);
  }
}

const handlePrint = async () => {
  // Define the print object
  const printObj = {
    text: "Star Clothing Boutique\n123 Star Road\nCity, State 12345\n\n",
    cutReceipt: true, // This tells the printer to cut the receipt after printing
    openCashDrawer: true // This opens the cash drawer (if supported)
  };

  try {
    statusResult.value = await StarPRNT.getStatus()
    // Send the print job to the connected printer
    printResult.value = await StarPRNT.printRawText(selectedDevice.value!.portName, emulation, printObj)
  } catch (error) {
    alert("Print Error: " + error);
  }

}


</script>
