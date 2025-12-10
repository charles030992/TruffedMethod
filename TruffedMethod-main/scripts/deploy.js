const hre = require("hardhat");

async function main() {
  // 1. Obtenemos la factory del contrato
  const TruffedMethod = await hre.ethers.getContractFactory("TruffedMethod");

  // 2. Desplegamos (esto crea la tx)
  const truffed = await TruffedMethod.deploy();

  // 3. Esperamos a que se mine el deploy (v6)
  await truffed.waitForDeployment();

  // 4. Obtenemos la dirección desplegada
  const address = await truffed.getAddress(); // o truffed.target

  console.log("TruffedMethod deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

