const { ethers, upgrades } = require('hardhat');
require("dotenv").config();

const admin = process.env.ADMIN_ADDRESS;

async function main() {
    const IdentityRegistry = await ethers.getContractFactory("IdentityRegistry");
    const iRegistry = await upgrades.deployProxy(
        IdentityRegistry,
        [admin],
        { initializer: "initialize" }
    )

    await iRegistry.waitForDeployment();
    console.log(`IdentityRegistry Address:- ${await iRegistry.getAddress()} `);

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});