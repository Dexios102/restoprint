<template>
  <div>
    <div id="printable-content">
      <h2>Invoice V1.1</h2>
      <p>Star Clothing Boutique\n123 Star Road\nCity, State 12345</p>
    </div>

    <button @click="showPorts">
      🖨 {{ loadingPorts ? "Showing.." : "Show Available Devices" }}
    </button>
    <template v-if="ports.length > 0">
      <h5>Available Devices:</h5>
      <div v-for="port in ports" :key="port.portName" style="
          display: flex;
          justify-content: space-between;
          align-items: center;
        ">
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

const ports = ref<Port[] | []>([]);
const showPortsTriggered = ref(false);
const loadingPorts = ref(false);
const selectedDevice = ref<Port | null>(null);
let hasBarcodeReader = true;
let emulation = StarPRNT.Emulation.StarLine;

const connectionResult = ref();
const printResult = ref();
const checkPrinterStatusResult = ref();
const statusResult = ref();
const rasterObjResult = ref();

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
    ports.value = (await StarPRNT.portDiscovery("All") as Port[]);
    console.log("Port Discovery New:", ports.value);
    Sentry.captureMessage("StarPRNT ports", parseString(ports.value));

    // Check if any printers were found
    if (ports.value.length === 0) {
      Sentry.captureMessage("No printers found!");
    }
  } catch (error) {
    console.log('Error StarPRNT.portDiscovery:', error);
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

  let newEmulation = selectedDevice.value!.portName.includes("USB:TSP100")
    ? StarPRNT.Emulation.StarGraphic
    : StarPRNT.Emulation.StarLine;


  let printObj = {
    text: "Star Clothing Boutique\n123 Star Road\nCity, State 12345\n\n",
    cutReceipt: true, // optional - Defaults to true
    openCashDrawer: false // optional -Defaults to true
  }

  let rasterObj = {
    text: "        Star Clothing Boutique\n" +
      "             123 Star Road\n" +
      "           City, State 12345\n" +
      "\n" +
      "Date:MM/DD/YYYY          Time:HH:MM PM\n" +
      "--------------------------------------\n" +
      "SALE\n" +
      "SKU            Description       Total\n" +
      "300678566      PLAIN T-SHIRT     10.99\n" +
      "300692003      BLACK DENIM       29.99\n" +
      "300651148      BLUE DENIM        29.99\n" +
      "300642980      STRIPED DRESS     49.99\n" +
      "30063847       BLACK BOOTS       35.99\n" +
      "\n" +
      "Subtotal                        156.95\n" +
      "Tax                               0.00\n" +
      "--------------------------------------\n" +
      "Total                          $156.95\n" +
      "--------------------------------------\n" +
      "\n" +
      "Charge\n" +
      "156.95\n" +
      "Visa XXXX-XXXX-XXXX-0123\n" +
      "Refunds and Exchanges\n" +
      "Within 30 days with receipt\n" +
      "And tags attached\n",
    fontSize: 25,       //Defaults to 25
    paperWidth: 576,    // options: 384 = 2", 576 = 3", 832 = 4"
    cutReceipt: true, // Defaults to true
    openCashDrawer: false // Defaults to true
  };

  try {
    // Connect to the selected printer
    const connection = StarPRNT.connect(
      selectedDevice.value!.portName,
      newEmulation,
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
      newEmulation,
      printObj
    );
  } catch (error) {
    alert("Error StarPRNT.printRawText: " + error);
    Sentry.captureMessage("Error StarPRNT.printRawText:", parseString(error));
  }

  try {
    rasterObjResult.value = await StarPRNT.printRasterReceipt(
      selectedDevice.value!.portName,
      newEmulation,
      rasterObj
    );
  } catch (error) {
    alert("Error StarPRNT.printRasterReceipt: " + error);
    Sentry.captureMessage("Error StarPRNT.printRasterReceipt:", parseString(error));
  }
};
</script>
