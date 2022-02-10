const crypto = require("crypto");
const fs = require("fs");

const getSecretKey = () => {
  if (fs.existsSync("./.secret")) {
    const data = fs.readFileSync("./.secret", "utf-8");
    return data;
  } else {
    console.log("Secret key not found, generating new secret...");
    const buffer = crypto.randomBytes(48);
    const key = buffer.toString("hex");
    fs.writeFileSync("./.secret", key);
    return key;
  }
};

module.exports = getSecretKey;
