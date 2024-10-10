import { parse } from 'csv';
import { promises as fs } from 'fs'; // 'fs/promises' not available in node 12
import { ethers } from 'ethers'


const SWAP_ADDRESS = "0x12be7322070cfa75e2f001c6b3d6ac8c2efef5ea"
const UP_ADDRESS = "0xac27fa800955849d6d17cc8952ba9dd6eaa66187"

const baseProvider = new ethers.JsonRpcProvider('https://rpc.unlock-protocol.com/8453')

const ERC20_ABI = ['function balanceOf(address) view returns (uint256)']

const excludedRecipients = ["0xF5C28ce24Acf47849988f147d5C75787c0103534"]

// in %
const BONUSES = {
  1: 0,
  2: 0.1,
  3: 0.15,
  4: 0.3,
  5: 0.50,
  6: 1,
  7: 1.50,
  8: 2.50,
  9: 3.50,
  10: 5,
}

const swappers = {}
// Process all records
const processRecords = async (records) => {
  for (let record of records) {
    await processTransaction(record)
  }
}

const output = {
  rewardToken: UP_ADDRESS,
  rewards: {}
}


// Process a single transaction
const processTransaction = async (transaction) => {
  if (transaction['From'] !== SWAP_ADDRESS) {
    return
  }
  const recipient = ethers.getAddress(transaction['To'])
  if (excludedRecipients.includes(recipient)) {
    console.log("> Excluded recipient", recipient)
    return
  }
  let amount = ethers.parseUnits(transaction['Quantity'].replaceAll(',', ''))
  const swapTime = Number(transaction['UnixTimestamp'])
  const balanceOnBase = await (new ethers.Contract(UP_ADDRESS, ERC20_ABI, baseProvider)).balanceOf(recipient)

  const availableBalance = balanceOnBase - (swappers[recipient] || 0n)

  if (availableBalance < amount) {
    console.log(`> ${recipient} Balance on Base is insufficient! ${ethers.formatUnits(availableBalance)} vs ${ethers.formatUnits(amount)}`)
    amount = availableBalance
  }
  // Compute how many weeks they held the tokens!
  const now = Math.floor(Date.now() / 1000)
  const weeks = Math.min(10, Math.floor((now - swapTime) / 604800))
  const bonus = (amount * BigInt((BONUSES[weeks] || 0) * 100)) / BigInt(10000)
  console.log(`> ${recipient} held ${ethers.formatUnits(amount)} UP for ${weeks} weeks. Bonus: ${ethers.formatUnits(bonus)}`)
  swappers[recipient] = (swappers[recipient] || 0n) + amount
  if (!output.rewards[recipient]) {
    output.rewards[recipient] = {}
  }
  output.rewards[recipient][`Swap of ${ethers.formatUnits(amount)} UP on ${new Date(swapTime * 1000)}`] = bonus
}

// Run
const run = async () => {
  const file = process.argv[2]
  const content = await fs.readFile(file, 'utf8');
  await parse(content, {
    columns: true,  // Automatically generate object keys from the headers
    trim: true      // Trim spaces from values
  }, async (err, records) => {
    if (err) {
      return console.error(err);
    }
    await processRecords(records)
    const content = await fs.writeFile('airdrop.json', JSON.stringify(output, (_, v) => typeof v === 'bigint' ? v.toString() : v, 2));


  });

}

run().then(() => { }).catch(console.error)