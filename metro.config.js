const { getDefaultConfig } = require("expo/metro-config");
const config = getDefaultConfig(__dirname);

config.resolver.alias = {
  "@": __dirname + "/src",
};

module.exports = config;
