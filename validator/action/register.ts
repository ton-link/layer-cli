import fs from 'fs'
import { InfoLog } from '../../cli/utils/info';
import { InitWallet } from '../../utils/wallet';
import { JettonMinter } from "../../wrappers/JettonMinter"
import { JettonWallet } from "../../wrappers/JettonWallet"
import { Hub } from "../../wrappers/Hub"
import { ValidatorManager } from "../../wrappers/ValidatorManager"
import { HubAddress, StakedTonMinter } from '../../utils/const';
import { Address, toNano } from '@ton/core';

export async function register() {
        InfoLog(`Use key.json file`)
        let keyJson = JSON.parse(fs.readFileSync('key.json', 'utf-8'))
        let seed: string = keyJson.seed
        let mnemonic = seed.split(" ")

        InfoLog(`Use validator.json file`)
        let validatorJson = JSON.parse(fs.readFileSync('validator.json', 'utf-8'))
        let link: string = validatorJson.link
        let stake_amount: number = validatorJson.stake_amount
        let percent: number = validatorJson.percent
        
        let [client, keyPair, wallet] = await InitWallet(mnemonic, keyJson.wallet, 'testnet')
        InfoLog(`TON Address: ${wallet?.address}`)
        InfoLog(`TON Balance: ${Number(await wallet.getBalance())}`)

        let minter = client.open(JettonMinter.createFromAddress(Address.parse(StakedTonMinter)))
        let jst_wallet = client.open(
                JettonWallet.createFromAddress(
                        await minter.getWalletAddress(wallet?.address)
                )
        )

        let hub_contract = client.open(Hub.createFromAddress(Address.parse(HubAddress)))

        InfoLog(`stTON wallet address: ${jst_wallet.address}`)
        InfoLog(`stTON wallet balance: ${Number(await jst_wallet.getJettonBalance())}`)

        try {
                let vm_contract = client.open(ValidatorManager.createFromAddress(await hub_contract.get_validation_manager_by_validator(wallet?.address)))
                await vm_contract.get_info_validator()
                throw new TypeError('Already registered') 
        } catch (e) {}

        if (Number(await wallet.getSeqno()) < 1) {
                throw new TypeError('Need an initialised wallet')
        }

        if (Number(await wallet.getBalance()) < Number(toNano('0.15'))) {
                throw new TypeError('Need a minimum of 0.15 TON for validator registration')
        }

        if (Number(await jst_wallet.getJettonBalance()) < Number(toNano(10000))) {
                throw new TypeError('Insufficient number of stTONs for validator registration')
        }

        if (Number(await jst_wallet.getJettonBalance()) < Number(toNano(stake_amount))) {
                throw new TypeError('There is not enough stTON for a given stake_amount')
        }

        if (link == "") {
                throw new TypeError('The link must not be empty')
        }

        InfoLog(`Send create validator tx`)
        try {
                await jst_wallet.sendCreateValidator(wallet.sender(keyPair.secretKey), toNano(stake_amount), Address.parse(HubAddress), link, percent)
        } catch (e) {
                throw new Error((e as Error).message)
        }
}