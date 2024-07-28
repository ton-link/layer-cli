import fs from 'fs'
import { InfoLog } from '../../cli/utils/info';
import { InitWallet } from '../../utils/wallet';
import { JettonMinter } from "../../wrappers/JettonMinter"
import { JettonWallet } from "../../wrappers/JettonWallet"
import { Hub } from "../../wrappers/Hub"
import { ValidatorManager } from "../../wrappers/ValidatorManager"
import { HubAddress, StakedTonMinter } from '../../utils/const';
import { Address, toNano } from '@ton/core';

export async function info() {
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

        InfoLog(`stTON wallet address: ${jst_wallet.address}`)
        InfoLog(`stTON wallet balance: ${Number(await jst_wallet.getJettonBalance()) / 10**9}`)

        InfoLog(`ValidatorManager address: ${vm_contract.address.toString()}`)
        InfoLog('ValidatorManager info: ')
        let info = await vm_contract.get_info_validator()
        console.log({
                admin_address: info.admin_address.toString(),
                hub_address: info.hub_address.toString(),
                stake_amount: Number(info.stake_amount) / 10**9 + " stTON",
                percent: info.percent + "%",
                delegation_amount: Number(info.delegation_amount) / 10**9  + " stTON",
                rewards_amount: Number(info.rewards_amount) / 10**9  + " TL",
                pool_amounts: info.pool_amounts
        })
        InfoLog('Validator info: ')
        let val_link = await vm_contract.get_validator_info_link();
        let val_link_json = await (await fetch(val_link)).json()
        console.log(val_link_json)
}