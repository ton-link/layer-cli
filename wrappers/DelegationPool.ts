import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode, TupleBuilder } from '@ton/core';

export type DelegationPoolConfig = {};

export function DelegationPoolConfigToCell(config: DelegationPoolConfig): Cell {
    return beginCell().endCell();
}

export class DelegationPool implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new DelegationPool(address);
    }

    async get_validator_manager_address(provider: ContractProvider) {
        let args = new TupleBuilder();
        const { stack } = await provider.get("get_validator_manager_address", args.build());
        return stack.readAddress()
    }

    async get_delegate_amount(provider: ContractProvider, delegator_manager_address: Address) {
        let args = new TupleBuilder();
        args.writeAddress(delegator_manager_address)
        const { stack } = await provider.get("get_delegate_amount", args.build());
        return stack.readBigNumber()
    }
}
