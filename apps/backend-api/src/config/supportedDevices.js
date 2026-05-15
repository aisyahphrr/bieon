const SUPPORTED_MODELS = {
  "SNZB-02DR2": {
    name: "Sonoff Temp & Humid Sensor",
    type: "sensor",
    telemetry_fields: ["temperature", "humidity", "battery"],
    command_fields: [],
    icon: "thermometer"
  },
  "SNZB-02D": {
    name: "Sonoff Temp & Humid Sensor (LCD)",
    type: "sensor",
    telemetry_fields: ["temperature", "humidity", "battery"],
    command_fields: [],
    icon: "thermometer"
  },
  "smart_plug": {
    name: "Smart Plug",
    type: "actuator",
    telemetry_fields: ["on_off", "power", "voltage"],
    command_fields: ["value"],
    icon: "zap"
  },
  "analog_sensor": {
    name: "Analog Water Sensor",
    type: "sensor",
    telemetry_fields: ["ph", "tds", "turbidity", "waterTemp"],
    command_fields: [],
    icon: "droplet"
  },
  "SNZB-03": {
    name: "Sonoff Motion Sensor",
    type: "sensor",
    telemetry_fields: ["occupancy", "battery"],
    command_fields: [],
    icon: "activity"
  },
  "SNZB-04": {
    name: "Sonoff Door/Window Sensor",
    type: "sensor",
    telemetry_fields: ["contact", "battery"],
    command_fields: [],
    icon: "shield"
  }
};

module.exports = { SUPPORTED_MODELS };
