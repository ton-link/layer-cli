import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode, TupleBuilder } from '@ton/core';

export type DelegationManagerConfig = {};

export function DelegationManagerConfigToCell(config: DelegationManagerConfig): Cell {
    return beginCell().endCell();
}

export class DelegationManager implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new DelegationManager(address);
    }

    async fundAcc(provider: ContractProvider, via: Sender) {
        var res = await provider.internal(via, {
            value: "0.5",
            body: beginCell().endCell()
        });
        return res
    }

    async sendActionUndelegate(provider: ContractProvider, via: Sender, validator_manager_address: Address, amount: bigint) {
        let body = beginCell()
            .storeUint(300, 32)
            .storeUint(0, 64)
            .storeAddress(validator_manager_address)
            .storeCoins(amount)
        .endCell()
        var res = await provider.internal(via, {
            value: "0.17",
            body: body
        });
        return res
    }

    async get_delegator_address(provider: ContractProvider) {
        let args = new TupleBuilder();
        const { stack } = await provider.get("get_delegator_address", args.build());
        return stack.readAddress()
    }

    async get_delegation_pool_address(provider: ContractProvider, validator_manager_address: Address) {
        let args = new TupleBuilder();
        args.writeAddress(validator_manager_address)
        const { stack } = await provider.get("get_delegation_pool_address", args.build());
        return stack.readAddress()
    }

    async get_delegation_pool_address_by_id(provider: ContractProvider, id: number) {
        let args = new TupleBuilder();
        args.writeNumber(id)
        const { stack } = await provider.get("get_delegation_pool_address_by_id", args.build());
        return stack.readAddress()
    }
}
