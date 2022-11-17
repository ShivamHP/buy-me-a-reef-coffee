import React, { useState } from "react";
import { web3Accounts, web3Enable } from "@polkadot/extension-dapp";
import { Provider, Signer } from "@reef-defi/evm-provider";
import { WsProvider } from "@polkadot/rpc-provider";
import { Contract } from "ethers";
import BuyMeACoffee from "./contracts/buyMeACoffee.json";
import Uik from "@reef-defi/ui-kit";
import fromExponential from 'from-exponential';

const factoryAbi = BuyMeACoffee.abi;
const factoryContractAddress = BuyMeACoffee.address;

const URL = "wss://rpc-testnet.reefscan.com/ws";

function App() {
	const [msgVal, setMsgVal] = useState("");
	const [nameVal, setNameVal] = useState("");
	const [signer, setSigner] = useState();
	const [isWalletConnected, setWalletConnected] = useState(false);

	const [isLoading, setIsLoading] = useState();
	const [isWithdrawLoading, setIsWithdrawLoading] = useState();

	const checkExtension = async () => {
		let allInjected = await web3Enable("Reef");

		if (allInjected.length === 0) {
			return false;
		}

		let injected;
		if (allInjected[0] && allInjected[0].signer) {
			injected = allInjected[0].signer;
		}

		const evmProvider = new Provider({
			provider: new WsProvider(URL),
		});

		evmProvider.api.on("ready", async () => {
			const allAccounts = await web3Accounts();

			allAccounts[0] &&
				allAccounts[0].address &&
				setWalletConnected(true);

			console.log(allAccounts);

			const wallet = new Signer(
				evmProvider,
				allAccounts[0].address,
				injected
			);

			// Claim default account
			if (!(await wallet.isClaimed())) {
				console.log(
					"No claimed EVM account found -> claimed default EVM account: ",
					await wallet.getAddress()
				);
				await wallet.claimDefaultAccount();
			}

			setSigner(wallet);
		});
	};

	const checkSigner = async () => {
		if (!signer) {
			await checkExtension();
		}
		return true;
	};

	const buyMeACoffee = async () => {
		console.log("Haa bhai kar rahaa hu");
		setIsLoading(true)
		try {
			await checkSigner();
			const mera_contract = new Contract(
				factoryContractAddress,
				factoryAbi,
				signer
			);
			const _toSend = fromExponential(parseInt(parseInt(6900)/100)*10**18);
			const result = await mera_contract.buyCoffee(
				nameVal ?? "",
				msgVal ?? "",
				{
					value: _toSend
				}
			)
			Uik.dropConfetti()
			Uik.notify.success("You just bought me a coffee! Thank you")
		} catch(e) {
			Uik.notify.danger("An error occured! Please try again.")
		}
		getMemos()
		setIsLoading(false)
	}

	const getMemos = async () => {
		console.log("Haa bhai memos nikaal rahaa hu");
		try{
			await checkSigner();
			const mera_contract = new Contract(
				factoryContractAddress,
				factoryAbi,
				signer
			);
			const result = await mera_contract.getMemos();
			console.log(result);
		} catch(e) {
			Uik.notify.danger("Unable to fetch memos");
		}
	}

	const withDrawFunds = async () => {
		console.log("Haa bhai de rhaa hu ruk jaa");
		setIsWithdrawLoading(true);
		try{
			await checkSigner();
			const mera_contract = new Contract(
				factoryContractAddress,
				factoryAbi,
				signer
			);
			const result = await mera_contract.withdrawTips();
			Uik.dropMoney();
			Uik.notify.success("Crypto given to owner!");
		} catch(e) {
			Uik.notify.danger("Unable to give owner the cryptos");
		}
		setIsWithdrawLoading(false);
	}

	// const getGreeting = async () => {
	// 	await checkSigner();
	// 	const factoryContract = new Contract(
	// 		factoryContractAddress,
	// 		factoryAbi,
	// 		signer
	// 	);
	// 	const result = await factoryContract.greet();
	// 	setMsg(result);
	// };

	// const setGreeting = async () => {
	// 	await checkSigner();
	// 	const factoryContract = new Contract(
	// 		factoryContractAddress,
	// 		factoryAbi,
	// 		signer
	// 	);
	// 	await factoryContract.setGreeting(msgVal);
	// 	setMsgVal("");
	// 	getGreeting();
	// };

	return (
		<Uik.Container className="main">
			<Uik.Container vertical>
				<Uik.Container>
					<Uik.Text text="Buy Me a " type="headline" />
					<Uik.ReefLogo /> <Uik.Text text="Coffee" type="headline" />
				</Uik.Container>
				{isWalletConnected ? (
					<Uik.Container vertical className="container">
						<Uik.Divider text="Enter your details" />
						<Uik.Card >
							<Uik.Input
								onInput={e => {
									setNameVal(e.target.value)
								}}
								value={nameVal}
								placeholder="Enter your name"
							/>
							<br />
							<Uik.Input
								onInput={e => setMsgVal(e.target.value)}
								value={msgVal}
								placeholder="Drop a message!"
							/>
							{/* <Uik.Button
									// onKeyPress={e => {
									// 	e.key === "Enter" && setGreeting();
									// }}
									onClick={setGreeting}
									text="Enter your name"
									className="container-button"
								/> */}
						</Uik.Card>
						{/* <>
							<Uik.Button text='Buy coffee!' fill onClick={buyMeACoffee}/>
						</> */}
						<>
							{
								isLoading? (
									<Uik.Loading/>
								) : (
									<Uik.Button text='Buy coffee!' fill onClick={buyMeACoffee}/>
								)
							}
							{
								isWithdrawLoading? (
									<Uik.Loading/>
								) : (
									<Uik.Button text='Withdraw funds (to be called by owner only)' neomorph onClick={withDrawFunds}/>
								)
							}
						</>
					</Uik.Container>
				) : (
					<>
						<Uik.Container vertical className="container">

							<Uik.Text
								text={
									<>
										Click the{" "}
										<Uik.Tag>Connect Wallet</Uik.Tag> button
										to get started 🚀
									</>
								}
								type="light"
							/>
						</Uik.Container>
						<br />
						<Uik.Button
							text="Connect Wallet"
							onClick={checkExtension}
						/>
					</>
				)}
			</Uik.Container>
		</Uik.Container>
	);
}

export default App;
