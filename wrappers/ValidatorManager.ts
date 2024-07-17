import {
    Address,
    beginCell,
    Cell,
    Contract,
    contractAddress,
    ContractProvider,
    Sender,
    SendMode,
    TupleBuilder,
} from '@ton/core';

export type ValidatorManagerConfig = {};

export function ValidatorManagerConfigToCell(config: ValidatorManagerConfig): Cell {
    return beginCell().endCell();
}

export class ValidatorManager implements Contract {
    constructor(
        readonly address: Address,
        readonly init?: { code: Cell; data: Cell },
    ) {}

    static createFromAddress(address: Address) {
        return new ValidatorManager(address);
    }

    static createFromConfig(config: ValidatorManagerConfig, code: Cell, workchain = 0) {
        const data = ValidatorManagerConfigToCell(config);
        const init = { code, data };
        return new ValidatorManager(contractAddress(workchain, init), init);
    }

    async sendDeploy(provider: ContractProvider, via: Sender, value: bigint) {
        await provider.internal(via, {
            value: '1',
            bounce: false,
            body: beginCell().endCell(),
        });
    }

    async sendActionForwardVote(provider: ContractProvider, via: Sender, body: Cell) {
        var res = await provider.internal(via, {
            value: '0.1',
            body: body,
        });
        return res;
    }

    async sendActionCollect(provider: ContractProvider, via: Sender, srv_addres: Address) {
        var res = await provider.internal(via, {
            value: '0.1',
            body: beginCell().storeUint(740, 32).storeUint(0, 64).storeAddress(srv_addres).endCell(),
        });
        return res;
    }

    async sendActionRemoveStake(provider: ContractProvider, via: Sender, amount: bigint) {
        var res = await provider.internal(via, {
            value: '0.1',
            body: beginCell().storeUint(300, 32).storeUint(0, 64).storeCoins(amount).endCell(),
        });
        return res;
    }

    async get_info_validator(provider: ContractProvider) {
        let args = new TupleBuilder();
        const { stack } = await provider.get('get_info_validator', args.build());
        let admin_address = stack.readAddress();
        let hub_address = stack.readAddress();
        let start_time = stack.readNumber();
        let stake_amount = stack.readBigNumber();
        let percent = stack.readNumber();
        let delegation_amount = stack.readBigNumber();
        let rewards_amount = stack.readBigNumber();
        stack.readCellOpt()
        stack.readCellOpt()
        stack.readCellOpt()
        let pool_amounts = stack.readNumber()

        return {
            admin_address,
            hub_address,
            start_time,
            stake_amount,
            percent,
            delegation_amount,
            rewards_amount,
            pool_amounts
        };
    }

    async get_srv_validation(provider: ContractProvider, srv_address: Address) {
        let args = new TupleBuilder();
        args.writeAddress(srv_address);
        const { stack } = await provider.get('check_srv_validation', args.build());
        return stack.readNumber() == -1 ? true : false;
    }

    async get_delegation_pool_address(provider: ContractProvider) {
        let args = new TupleBuilder();
        const { stack } = await provider.get('get_delegation_pool_address', args.build());
        return stack.readAddress();
    }

    async get_validator_info_link(provider: ContractProvider) {
        let args = new TupleBuilder();
        const { stack } = await provider.get('get_validator_info_link', args.build());
        return (stack.readCell().beginParse().loadStringTail());
    }

    async get_delegation_pool_address_by_id(provider: ContractProvider, id: number) {
        let args = new TupleBuilder();
        args.writeNumber(id);
        const { stack } = await provider.get('get_delegation_pool_address_by_id', args.build());
        return stack.readAddress()
    }
}
