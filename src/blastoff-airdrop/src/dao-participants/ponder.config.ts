import { createConfig } from "ponder";
import { http } from "viem";

import { UPGovernorAbi } from "./abis/UPGovernorAbi";
import { UDTGovernorAbi } from "./abis/UDTGovernorAbi";
import { UDTAbi } from "./abis/UDTAbi";
import { UPAbi } from "./abis/UPAbi";

export default createConfig({
  database: {
    kind: "postgres",
    connectionString: "postgresql://postgres:postgres@127.0.0.1:5432/ponder",
  },
  networks: {
    mainnet: {
      chainId: 1,
      transport: http(process.env.PONDER_RPC_URL_1),
    },
    base: {
      chainId: 8453,
      transport: http(process.env.PONDER_RPC_URL_8453),
    },
  },
  contracts: {
    UDTGovernor: {
      network: "mainnet",
      abi: UDTGovernorAbi,
      address: "0x440d9D4E66d39bb28FB58729Cb4D3ead2A595591",
      startBlock: 17576620,
      endBlock: 21388899,
    },
    UDT: {
      network: "mainnet",
      abi: UDTAbi,
      address: "0x90DE74265a416e1393A450752175AED98fe11517",
      startBlock: 11324720,
      endBlock: 21388899,
    },
    UPGovernor: {
      network: "base",
      abi: UPGovernorAbi,
      address: "0x65bA0624403Fc5Ca2b20479e9F626eD4D78E0aD9",
      startBlock: 18036280,
      endBlock: 23623754,
    },
    UP: {
      network: "base",
      abi: UPAbi,
      address: "0xaC27fa800955849d6D17cC8952Ba9dD6EAA66187",
      startBlock: 18035300,
      endBlock: 23623754,
    },
  },
});
