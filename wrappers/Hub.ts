import { Address, beginCell, Cell, Contract, contractAddress, ContractProvider, Sender, SendMode, toNano, TupleBuilder } from '@ton/core';

export type HubConfig = {
    jetton_stake: Address
    admin: Address
    jetton_tonlink: Address
    dm_code: Cell
    vm_code: Cell
    dp_code: Cell
    max_delegators_amount?: number
};

export function HubConfigToCell(config: HubConfig): Cell {
    return beginCell()
        .storeRef(beginCell()
            .storeDict(null)
            .storeDict(null)
        .endCell())
        .storeRef(beginCell()
            .storeRef(config.vm_code)
            .storeRef(config.dm_code)
            .storeRef(config.dp_code)
        .endCell())
        .storeAddress(config.jetton_stake)
        .storeAddress(config.admin)
        .storeAddress(config.jetton_tonlink)
        .storeRef(beginCell()
            .storeUint(150000, 64)
            .storeCoins(toNano("0.01"))
            .storeUint(config.max_delegators_amount == undefined ? 500 : config.max_delegators_amount, 64)
        .endCell())
    .endCell();
}

export class Hub implements Contract {
    constructor(readonly address: Address, readonly init?: { code: Cell; data: Cell }) {}

    static createFromAddress(address: Address) {
        return new Hub(address);
    }

    static createFromConfig(config: HubConfig, code: Cell, workchain = 0) {
        const data = HubConfigToCell(config);
        const init = { code, data };
        return new Hub(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value,
            sendMode: SendMode.PAY_GAS_SEPARATELY,
            body: beginCell().endCell(),
        });
    }

    async sendActionChangeJettonWalletStake(provider: ContractProvider, via: Sender, new_jw: Address) {
        let body = beginCell()
            .storeUint(400, 32)
            .storeUint(0, 64)
            .storeAddress(new_jw)
            .endCell()
        var res = await provider.internal(via, {
            value: "0.05",
            body: body
        });
        return res
    }

    async sendActionChangeJettonWalletTonlink(provider: ContractProvider, via: Sender, new_jw: Address) {
        let body = beginCell()
            .storeUint(430, 32)
            .storeUint(0, 64)
            .storeAddress(new_jw)
            .endCell()
        var res = await provider.internal(via, {
            value: "0.05",
            body: body
        });
        return res
    }

    async sendActionRegistrationSRV(provider: ContractProvider, via: Sender, srv_address: Address) {
        let body = beginCell()
            .storeUint(410, 32)
            .storeUint(0, 64)
            .storeAddress(srv_address)
            .endCell()
        var res = await provider.internal(via, {
            value: "0.05",
            body: body
        });
        return res
    }

    async sendActionStartValidationSRV(provider: ContractProvider, via: Sender, srv_address: Address) {
        let body = beginCell()
            .storeUint(300, 32)
            .storeUint(0, 64)
            .storeAddress(srv_address)
            .endCell()
        var res = await provider.internal(via, {
            value: "0.15",
            body: body
        });
        return res
    }

    async sendActionStopValidationSRV(provider: ContractProvider, via: Sender, srv_address: Address) {
        let body = beginCell()
            .storeUint(310, 32)
            .storeUint(0, 64)
            .storeAddress(srv_address)
            .endCell()
        var res = await provider.internal(via, {
            value: "0.15",
            body: body
        });
        return res
    }

    async sendActionDeployDelegationManager(provider: ContractProvider, via: Sender) {
        var res = await provider.internal(via, {
            value: "0.3",
            body: beginCell()
                .storeUint(500, 32)
                .storeUint(0, 64)
            .endCell()
        });
        return res
    }

    async get_validation_manager_by_validator(provider: ContractProvider, validator: Address) {
        let args = new TupleBuilder();
        args.writeAddress(validator);
        const { stack } = await provider.get("get_validation_manager_by_validator", args.build());
        return stack.readAddress();
    }

    async get_srv_validation(provider: ContractProvider, srv_address: Address) {
        let args = new TupleBuilder();
        args.writeAddress(srv_address);
        const { stack } = await provider.get("check_srv_validation", args.build());
        return (stack.readNumber() == -1 ? true : false);
    }

    async get_delegation_manager_address(provider: ContractProvider, address: Address) {
        let args = new TupleBuilder();
        args.writeAddress(address);
        const { stack } = await provider.get("get_delegation_manager_address", args.build());
        return stack.readAddress()
    }

    async get_delegation_pool_address_by_manager(provider: ContractProvider, address: Address) {
        let args = new TupleBuilder();
        args.writeAddress(address);
        const { stack } = await provider.get("ger_delegation_pool_address", args.build());
        return stack.readAddress()
    }
}
