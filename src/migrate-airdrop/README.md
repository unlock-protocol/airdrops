# Migrate airdrop

For this first airdrop, The Unlock Foundation wants to reward UDT holders who have migrated to UP AND then held on to their UP.

## How data is computed

We use Basescan to get [all transfers of UP _from_ the swapping contract](https://basescan.org/token/0xac27fa800955849d6d17cc8952ba9dd6eaa66187?a=0x12be7322070cfa75e2f001c6b3d6ac8c2efef5ea).

- For each transfer _from_ the swap contract
- check the balance current balance of the recipient.
- If balance on base >= then transfer amount, keep track of date, apply bonus based on time to the amount transfered.

Note: since there was no transaction that swapped back UP for UDT, we don't need to check the balance on mainnet.
