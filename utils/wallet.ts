import { KeyPair, mnemonicToPrivateKey } from 'ton-crypto';
import { getHttpEndpoint } from "@orbs-network/ton-access";
import { OpenedContract, TonClient, WalletContractV3R2, WalletContractV4 } from '@ton/ton';

export async function InitWallet(mnemonic: string[], type: string, network: string): Promise<[TonClient, KeyPair, OpenedContract<WalletContractV4 | WalletContractV3R2>]> {
        let endpoint;
        switch (network) {
                case 'testnet':
                        endpoint = await getHttpEndpoint({
                                network: 'testnet',
                        });
                        break;
                case 'mainnet':
                        endpoint = await getHttpEndpoint({});
                        break;
        
                default:
                        endpoint = await getHttpEndpoint({
                                network: 'testnet',
                        });
                        break;
        }
        const client = new TonClient({ endpoint });
        let keyPair = await mnemonicToPrivateKey(mnemonic)
        let wallet
        switch(type) {
                case "V4":
                        wallet = WalletContractV4.create({
                                workchain: 0,
                                publicKey: keyPair.publicKey,
                        });
                case "V3R2":
                        wallet = WalletContractV3R2.create({
                                workchain: 0,
                                publicKey: keyPair.publicKey,
                        });
                default:
                        wallet = WalletContractV4.create({
                                workchain: 0,
                                publicKey: keyPair.publicKey,
                        });
        }

        return [client, keyPair, client.open(wallet)]
}