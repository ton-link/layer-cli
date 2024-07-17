import fs from 'fs'
import { InfoLog } from '../../cli/utils/info';
import { InitWallet } from '../../utils/wallet';
import { JettonMinter } from "../../wrappers/JettonMinter"
import { JettonWallet } from "../../wrappers/JettonWallet"
import { StakedTonMinter } from '../../utils/const';
import { Address } from '@ton/core';

export async function showKey() {
        let keyJson = JSON.parse(fs.readFileSync('key.json', 'utf-8'))
        let seed: string = keyJson.seed
        let mnemonic = seed.split(" ")

        let [client, keyPair, wallet] = await InitWallet(mnemonic, keyJson.wallet, 'testnet')

        let minter = client.open(JettonMinter.createFromAddress(Address.parse(StakedTonMinter)))
        let jst_wallet = client.open(
                JettonWallet.createFromAddress(
                        await minter.getWalletAddress(wallet?.address)
                )
        )

        InfoLog(`Use key.json file`)
        console.log("\n")
        console.log(`Seed phrase: ${mnemonic.join(' ')}`)
        console.log(`Secret Key (Hex): ${keyPair.secretKey.toString('hex')}`)
        console.log(`Public Key (Hex): ${keyPair.publicKey.toString('hex')}`)
        console.log("\n")
        console.log(`TON Address: ${wallet?.address}`)
        console.log(`TON Wallet Seqno: ${Number(await wallet.getSeqno())}`)
        console.log(`TON Balance: ${Number(await wallet.getBalance()) / 10**9}`)
        console.log("\n")
        console.log(`stTON wallet address: ${jst_wallet.address}`)
        console.log(`stTON wallet balance: ${Number(await jst_wallet.getJettonBalance())}`)

}