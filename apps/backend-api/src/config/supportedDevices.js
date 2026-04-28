const SUPPORTED_MODELS = {
  "SNZB-02DR2": {
    name: "Sonoff Temp & Humid Sensor",
    type: "sensor",
    params: ["temperature", "humidity"],
    icon: "thermometer"
  },
  "SNZB-02D": {
    name: "Sonoff Temp & Humid Sensor (LCD)",
    type: "sensor",
    params: ["temperature", "humidity"],
    icon: "thermometer"
  },
  "SNZB-02": {
    name: "Sonoff Temperature & Humidity Sensor",
    type: "sensor",
    params: ["temperature", "humidity"],
    icon: "thermometer"
  },
  "SNZB-03": {
    name: "Sonoff Motion Sensor",
    type: "sensor",
    params: ["occupancy"],
    icon: "activity"
  },
  "SNZB-04": {
    name: "Sonoff Door/Window Sensor",
    type: "sensor",
    params: ["contact"],
    icon: "shield"
  }
};

module.exports = { SUPPORTED_MODELS };
