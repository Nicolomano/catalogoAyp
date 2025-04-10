import {Command} from 'commander'

const program = new Command()

program
    .option('-d','Variable para debug', false)
    .option('-p <port>','Puerto para el server', 8080)
    .option('--mode <mode>', 'Modo de trabajo del server', 'production')
program.parse()

console.log('Option', program.opts());
console.log('Option - Mode: ', program.opts().mode);
console.log('Option - Port: ', program.opts().p);

export default program