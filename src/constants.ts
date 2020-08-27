import * as path from "path";
import Address from "./address";
export const SYSTEM_ADDRESS = Address.newPublicKey(Buffer.alloc(32));
export const TOKEN_CONTRACT_NAME = "Ellipticoin";
export const PRIVATE_KEY = Buffer.from(
  "2a185960faf3ffa84ff8886e8e2e0f8ba0fff4b91adad23108bfef5204390483b114ed4c88b61b46ff544e9120164cb5dc49a71157c212f76995bf1d6aecab0e",
  "hex",
);
export const PUBLIC_KEY = Buffer.from(
  "b114ed4c88b61b46ff544e9120164cb5dc49a71157c212f76995bf1d6aecab0e",
  "hex",
);
export const ELIPITCOIN_SEED_EDGE_SERVERS = [
  "https://davenport.ellipticoin.org",
];
export const DEFAULT_NETWORK_ID = 1793045504;
export const HOME =
  process.env[process.platform === "win32" ? "USERPROFILE" : "HOME"];
export const CONFIG_DIR = `${HOME}/.ec-wallet`;
export const CONFIG_PATH = `${CONFIG_DIR}/config.yaml`;
export const WORDS_FILE_PATH = path.resolve(
  __dirname,
  "..",
  "config",
  "english.txt",
);
