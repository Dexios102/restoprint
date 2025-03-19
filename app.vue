<template>
  <div>
    <div id="printable-content">
      <h2>Invoice</h2>
      <p>Star Clothing Boutique\n123 Star Road\nCity, State 12345</p>
    </div>

    <button @click="showPorts">
      🖨 {{ loadingPorts ? "Showing.." : "Show Available Devices" }}
    </button>
    <template v-if="ports.length > 0">
      <h5>Available Devices:</h5>
      <div
        v-for="port in ports"
        :key="port.portName"
        style="
          display: flex;
          justify-content: space-between;
          align-items: center;
        "
      >
        <span>
          <p>{{ port.modelName }}</p>
        </span>
        <button @click="connectToPrinter(port)">
          {{ port == selectedDevice ? "Selected" : "Select" }}
        </button>
      </div>
    </template>
    <h5 v-else-if="ports.length == 0 && !loadingPorts && showPortsTriggered">
      No connected devices available.
    </h5>

    <template v-if="selectedDevice">
      <h4>Print Now</h4>
      <button @click="handlePrint">Print</button>
    </template>

    <template v-if="checkPrinterStatusResult">
      <h5>Check Printer Status Result:</h5>
      <pre>{{ checkPrinterStatusResult }}</pre>
    </template>

    <template v-if="connectionResult">
      <h5>Connection Result:</h5>
      <pre>{{ connectionResult }}</pre>
    </template>

    <template v-if="statusResult">
      <h5>Printer Get Status Result</h5>
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
import { StarPRNT } from "@awesome-cordova-plugins/star-prnt";
import * as Sentry from "@sentry/nuxt";

const ports = ref<Port[]>([]);
const showPortsTriggered = ref(false);
const loadingPorts = ref(false);
const selectedDevice = ref<Port | null>(null);
let hasBarcodeReader = true;
let emulation = StarPRNT.Emulation.StarLine;

const connectionResult = ref();
const printResult = ref();
const checkPrinterStatusResult = ref();
const statusResult = ref();

const parseString = (data: any) => {
  try {
    return JSON.stringify(data);
  } catch (error) {
    return data;
  }
};

const showPorts = async () => {
  try {
    showPortsTriggered.value = true;
    loadingPorts.value = true;
    const starprntObj = StarPRNT;
    console.log("StarPRNT:", starprntObj);

    // Sentry.captureMessage("StarPRNT", parseString(starprntObj));

    // Discover printers available on all ports (Bluetooth, USB, Network)
    ports.value = (await StarPRNT.portDiscovery("All")) as Port[];
    console.log("Port Discovery:", ports);
    Sentry.captureMessage("StarPRNT ports", parseString(ports));

    // Check if any printers were found
    if (ports.value.length === 0) {
      Sentry.captureMessage("No printers found!");
    }
  } catch (error) {
    Sentry.captureMessage("Error StarPRNT.portDiscovery:", parseString(error));
  } finally {
    loadingPorts.value = false;
  }
};

const connectToPrinter = async (port: Port) => {
  selectedDevice.value = port;

  try {
    checkPrinterStatusResult.value = await StarPRNT.checkStatus(
      selectedDevice.value!.portName,
      emulation
    );
    Sentry.captureMessage("StarPRNT.checkStatus:", parseString(checkPrinterStatusResult.value));
  } catch (error) {
    console.log("Error StarPRNT.checkStatus:", error);
    Sentry.captureMessage("Error StarPRNT.checkStatus:", parseString(error));
  }
};

const handlePrint = async () => {
  printResult.value = null;
  statusResult.value = null;
  connectionResult.value = null;

  if (!selectedDevice.value?.portName) {
    alert("Printer Selected Error: No PortName");
    Sentry.captureMessage("Error no port name when 'Print Now' is clicked");
    return;
  }

  // Define the print object
  const printObj = {
    text: "Star Clothing Boutique\n123 Star Road\nCity, State 12345\n\n",
    cutReceipt: true, // This tells the printer to cut the receipt after printing
    openCashDrawer: false, // This opens the cash drawer (if supported)
  };

  try {
    // Connect to the selected printer
    const connection = StarPRNT.connect(
      selectedDevice.value!.portName,
      emulation,
      hasBarcodeReader
    );
    connectionResult.value = connection as any;
    Sentry.captureMessage("StarPRNT.connect:", parseString(connection));
  } catch (error) {
    alert("Error StarPRNT.connect: " + error);
    Sentry.captureMessage("Error StarPRNT.connect:", parseString(error));
  }

  try {
    statusResult.value = StarPRNT.getStatus();
    // Send the print job to the connected printer
    printResult.value = await StarPRNT.printRawText(
      selectedDevice.value!.portName,
      emulation,
      printObj
    );
  } catch (error) {
    alert("Error StarPRNT.printRawText: " + error);
    Sentry.captureMessage("Error StarPRNT.printRawText:", parseString(error));
  }
};
</script>
