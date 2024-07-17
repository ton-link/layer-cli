import { Command } from 'commander';
import { createNewKey } from '../validator/keys/create';
import { showKey } from '../validator/keys/show';
import { register } from '../validator/action/register';
import { info } from '../validator/action/info';
import { remove } from '../validator/action/remove';
import { add } from '../validator/action/add';

const program = new Command();

async function main() {
        program
                .name("layer-cli")
                .description('Tonlink Layer CLI')
                .version('0.0.1')
                .usage("[global options] command")
                .showHelpAfterError('(add --help for additional information)');

        let validator = program.command('validator')
        
        let val_keys = validator.command('keys').description('Manage the keys used in Tonlink Layer')
        val_keys.command('create').description('Generate new TON keys for validator').action(() => {createNewKey()})
        val_keys.command('show').description('Show the keys created by create command').action(() => {showKey()})
        
        validator.command('register').description('Register the validator in Tonlink Layer').action(() => {register()})
        validator.command('info').description('Displaying information about an already registered validator').action(() => {info()})
        validator.command('remove').description('Remove stake').action(() => {remove()})
        validator.command('add').description('Add stake').action(() => {add()})

        // TODO
        let val_reward = validator.command('rewards')
        val_reward.command('collect').description('Collect rewards from Tonlink SRVs')

        program.parse();
}

main()