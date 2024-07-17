import * as readline from 'readline';
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

export async function add() {
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
        
        let add_amount = parseInt(prompt('Enter the amount of stTON you want to add to the staking: '));

        if (Number(await jst_wallet.getJettonBalance()) < Number(toNano(add_amount))) {
                throw new TypeError('Insufficient number of stTONs for add new stake')
        }

        if (add_amount <= 0) {
                throw new TypeError('Negative number or 0')
        }

        InfoLog(`Send add stake tx`)
        try {
                await jst_wallet.sendAddStake(wallet.sender(keyPair.secretKey), toNano(add_amount), Address.parse(HubAddress))
        } catch (e) {
                throw new Error((e as Error).message)
        }
}