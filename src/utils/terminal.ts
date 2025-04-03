import { exec } from "child_process";
import readline from "readline";

export const openInBrowser = (url: string) => {
	// Command to open the URL in the default browser based on the platform
	const command = process.platform === 'win32' ? 'start' : process.platform === 'darwin' ? 'open' : 'xdg-open';

	// Execute the command to open the URL
	exec(`${command} ${url}`);
};

export async function promptForInput(prompt: string, expiry_ms = 20000): Promise<string> {
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});

	// Wrap readline.question in a Promise to properly await user input
	const userInput = new Promise<string>((resolve) => {
		rl.question(`${prompt}: `, (input) => {
			// Resolve the promise with the user input
			resolve(input);

			// Close the readline interface
			rl.close();
		});
	});

	// Wait for user input or until the timeout expires
	return await Promise.race([
		userInput,
		new Promise<string>((resolve) => {
			setTimeout(() => resolve(''), expiry_ms);
		})
	]);
}