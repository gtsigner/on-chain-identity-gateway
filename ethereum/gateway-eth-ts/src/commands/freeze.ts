import { Command, flags } from "@oclif/command";
import { BigNumber, utils, Wallet } from "ethers";
import { GatewayToken } from "../contracts/GatewayToken";
import { BaseProvider } from '@ethersproject/providers';
import {
		privateKeyFlag,
		gatewayTokenAddressFlag,
		networkFlag,
		gasPriceFeeFlag,
		confirmationsFlag,
} from "../utils/flags";
import { TxBase } from "../utils/tx";
import { mnemonicSigner, privateKeySigner } from "../utils/signer";

export default class FreezeToken extends Command {
	static description = "Freeze existing identity token using TokenID";

	static examples = [
		`$ gateway freeze 10
		`,
	];

	static flags = {
		help: flags.help({ char: "h" }),
		privateKey: privateKeyFlag(),
		gatewayTokenAddress: gatewayTokenAddressFlag(),
		network: networkFlag(),
		gasPriceFee: gasPriceFeeFlag(),
		confirmations: confirmationsFlag(),
	};

	static args = [
		{
			name: "tokenID",
			required: true,
			description: "Token ID number to freeze",
			parse: (input: string) => BigNumber.from(input),
		},
	];

	async run() {
		const { args, flags } = this.parse(FreezeToken);

		const pk = flags.privateKey;
		const provider:BaseProvider = flags.network;
		let signer: Wallet
		const confirmations = flags.confirmations;

		if (utils.isValidMnemonic(pk)) {
			signer = mnemonicSigner(pk, provider)
		} else {
			signer = privateKeySigner(pk, provider)
		}
		
		const tokenID: BigNumber = args.tokenID;
		const gatewayTokenAddress: string = flags.gatewayTokenAddress;

		this.log(`Freezing existing token with TokenID:
			${tokenID.toString()} 
			on GatewayToken ${gatewayTokenAddress} contract`);
		
		const gatewayToken = new GatewayToken(signer, gatewayTokenAddress);

		const gasPrice = await flags.gasPriceFee;
		const gasLimit = await gatewayToken.contract.estimateGas.freeze(tokenID);

		const txParams: TxBase = {
			gasLimit: gasLimit,
			gasPrice: BigNumber.from(utils.parseUnits(String(gasPrice), 'gwei') ),
		};

		let tx: any;

		if (confirmations > 0) {
			tx = await(await gatewayToken.freeze(tokenID, txParams)).wait(confirmations);
		} else {
			tx = await gatewayToken.freeze(tokenID, txParams);
		}

		this.log(
				`Freezed existing token with TokenID: ${tokenID.toString()} TxHash: ${(confirmations > 0) ? tx.transactionHash : tx.hash}`
			);
	}
}