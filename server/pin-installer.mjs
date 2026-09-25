// Publica en el link fijo un instalador local, con su propia etiqueta de versión.
// Uso (dentro del contenedor anomalydevs-api):
//   node server/pin-installer.mjs "/tmp/Terminal de Cobranza Setup 3.1.6.exe" 3.1.6
// El link vuelve a seguir al feed en cuanto este publique un build distinto.
import { mirrorFromEnv } from './downloads.mjs';

const [installerPath, version] = process.argv.slice(2);
if (!installerPath || !version) {
  console.error('Uso: node server/pin-installer.mjs <ruta-del-instalador.exe> <versión X.Y.Z>');
  process.exit(2);
}

const result = await mirrorFromEnv().pin({ installerPath, version });
if (!result.ok) {
  console.error(`No se publicó: ${result.reason}`);
  process.exit(1);
}
console.log(`Publicada la versión ${result.version} en el link fijo.`);
