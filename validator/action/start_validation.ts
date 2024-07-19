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

export async function start_validator() {
        InfoLog(`Use key.json file`)
        let keyJson = JSON.parse(fs.readFileSync('key.json', 'utf-8'))
        let seed: string = keyJson.seed
        let mnemonic = seed.split(" ")

        let [client, keyPair, wallet] = await InitWallet(mnemonic, keyJson.wallet, 'testnet')
        InfoLog(`TON Address: ${wallet?.address}`)
        InfoLog(`TON Balance: ${Number(await wallet.getBalance()) / 10**9}`)

        let hub_contract = client.open(Hub.createFromAddress(Address.parse(HubAddress)))
        let vm_contract = client.open(ValidatorManager.createFromAddress(await hub_contract.get_validation_manager_by_validator(wallet?.address)))

        InfoLog(`ValidatorManager address: ${vm_contract.address.toString()}`)
        
        let srv_adderss = prompt('Enter SRV address: ');

        InfoLog(`Send start validation  tx`)
        try {
                await hub_contract.sendActionStartValidationSRV(wallet.sender(keyPair.secretKey), Address.parse(srv_adderss))
        } catch (e) {
                throw new Error((e as Error).message)
        }
}