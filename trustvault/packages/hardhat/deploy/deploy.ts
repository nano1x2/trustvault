import { HardhatRuntimeEnvironment } from "hardhat/types";
import { DeployFunction } from "hardhat-deploy/types";
import { deployWithAA } from "../utils/deployWithAA";

export const CONTRACT_NAME = "EscrowFactory";

const deployEscrowFactory: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  const factory = await hre.ethers.getContractFactory(CONTRACT_NAME);

  const escrowFactoryAddress = await deployWithAA(factory, CONTRACT_NAME, hre, []);
  const escrowFactory = await hre.ethers.getContractAt(CONTRACT_NAME, escrowFactoryAddress);

  console.log("✅ EscrowFactory deployed to:", escrowFactoryAddress);
};

export default deployEscrowFactory;

deployEscrowFactory.tags = ["EscrowFactory"];
