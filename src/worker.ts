import { startBuild } from "./scripts";

self.onmessage = function(e) {
    const data = e.data;
  
    const result = simulateTimeConsumingTask(data);
  
    postMessage(result);
  };
  
  function simulateTimeConsumingTask(data: any) {
    // Simulate a time-consuming task here
    const result = data; // Replace with actual computation
    return result;
  }