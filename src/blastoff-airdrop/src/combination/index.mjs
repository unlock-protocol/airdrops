import fs from 'fs'

import { ethers } from 'ethers'
import delegation from './delegation.js'
import discord from './discord.js'
import integrations from './integrations.js'
import paidUsage from './paid-usage.js'
import freeUsers from './free-users.js'

const weights = {
  delegation: 1,
  discord: 3,
  integrations: 100,
  paidUsage: 5,
  freeUsers: 1,
}

const output = {
}

let total = 0

const setPoint = (address, value, weight) => {
  const formatted = ethers.getAddress(address)
  if (!output[formatted]) {
    output[formatted] = 0
  }
  output[formatted] += value * weight
  if (output[formatted] > 100) {
    output[formatted] = 100
  }
}

Object.keys(delegation).forEach((address) => {
  setPoint(address, delegation[address], weights.delegation)
})

Object.keys(discord).forEach((address) => {
  setPoint(address, discord[address], weights.discord)
})

Object.keys(integrations).forEach((address) => {
  setPoint(address, integrations[address], weights.integrations)
})

Object.keys(paidUsage).forEach((address) => {
  setPoint(address, paidUsage[address], weights.paidUsage)
})

Object.keys(freeUsers).forEach((address) => {
  setPoint(address, freeUsers[address], weights.freeUsers)
})



const asArray = Object.keys(output).map((key) => [key, output[key]]).sort((a, b) => b[1] - a[1])

for (let i = 0; i < asArray.length; i++) {
  total += asArray[i][1]
}

// Convert JSON object to string
const jsonString = JSON.stringify(asArray);

// Write JSON string to a file
fs.writeFile('data.json', jsonString, (err) => {
  if (err) {
    console.error('Error writing file:', err);
  } else {
    console.log('JSON data written to file successfully.');
  }
});

