
import fs from 'fs'
import { InfoLog } from '../../cli/utils/info';
import { InitWallet } from '../../utils/wallet';
import { JettonMinter } from "../../wrappers/JettonMinter"
import { JettonWallet } from "../../wrappers/JettonWallet"
import { Hub } from "../../wrappers/Hub"
import { ValidatorManager } from "../../wrappers/ValidatorManager"
import { HubAddress, StakedTonMinter } from '../../utils/const';
import { Address, toNano } from '@ton/core';
const prompt = require('prompt-sync')()

export async function remove() {
        InfoLog(`Use key.json file`)
        let keyJson = JSON.parse(fs.readFileSync('key.json', 'utf-8'))
        let seed: string = keyJson.seed
        let mnemonic = seed.split(" ")

        let [client, keyPair, wallet] = await InitWallet(mnemonic, keyJson.wallet, 'testnet')
        InfoLog(`TON Address: ${wallet?.address}`)
        InfoLog(`TON Balance: ${Number(await wallet.getBalance()) / 10**9}`)

        let minter = client.open(JettonMinter.createFromAddress(Address.parse(StakedTonMinter)))
        let jst_wallet = client.open(
                JettonWallet.createFromAddress(
                        await minter.getWalletAddress(wallet?.address)
                )
        )

        let hub_contract = client.open(Hub.createFromAddress(Address.parse(HubAddress)))
        let vm_contract = client.open(ValidatorManager.createFromAddress(await hub_contract.get_validation_manager_by_validator(wallet?.address)))
        let val_info = await vm_contract.get_info_validator()

        InfoLog(`stTON wallet address: ${jst_wallet.address}`)
        InfoLog(`stTON wallet balance: ${Number(await jst_wallet.getJettonBalance())}`)

        InfoLog(`ValidatorManager address: ${vm_contract.address.toString()}`)

        let remove_amount = parseInt(prompt('Enter the number of stTONs you want to remove from the staking: '));

        if (Number(val_info.stake_amount) / 10**9 < remove_amount) {
                throw new TypeError('Amount to withdraw is greater than balance')
        }

        if ((Number(val_info.stake_amount) / 10**9) - remove_amount < Number(val_info.delegation_amount) / 10**9) {
                throw new TypeError('You cant withdraw more than the users delegated amount')
        }

        if (remove_amount <= 0) {
                throw new TypeError('Negative number or 0')
        }

        InfoLog(`Send remove stake tx`)
        try {
                await vm_contract.sendActionRemoveStake(wallet.sender(keyPair.secretKey), toNano(remove_amount))
        } catch (e) {
                throw new Error((e as Error).message)
        }
}