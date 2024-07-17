import { WalletContractV4 } from '@ton/ton';
import { KeyPair, mnemonicToPrivateKey, mnemonicNew } from 'ton-crypto';
import { InfoLog } from '../../cli/utils/info';
import { JSONToFile } from '../../utils/json';


export async function createNewKey() {

        const mnemonic = await mnemonicNew();

        let keyPair = await mnemonicToPrivateKey(mnemonic)
        let wallet = WalletContractV4.create({
                workchain: 0,
                publicKey: keyPair.publicKey,
        });

        InfoLog('Generate new V4 wallet')
        InfoLog('Save key.json')
        console.log("\n")
        console.log(`Seed phrase: ${mnemonic.join(' ')}`)
        console.log(`Secret Key (Hex): ${keyPair.secretKey.toString('hex')}`)
        console.log(`Public Key (Hex): ${keyPair.publicKey.toString('hex')}`)
        console.log("\n")
        let filename = './key'

        JSONToFile({
                seed: mnemonic.join(' '),
                wallet: "V4",
        }, filename)

        console.log(`Key location: ${filename}.json`)
        console.log(`TON Address: ${wallet?.address}`)
}