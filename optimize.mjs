import { NodeIO } from "@gltf-transform/core";
import { ALL_EXTENSIONS } from "@gltf-transform/extensions";
import { dedup, prune } from "@gltf-transform/functions";
import { MeshoptDecoder } from "meshoptimizer";

await MeshoptDecoder.ready;

const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({ "meshopt.decoder": MeshoptDecoder });

const file = process.argv[2];
console.log("Optimizing:", file);

const doc = await io.read(file);
await doc.transform(dedup(), prune());
await io.write(file, doc);
console.log("Done:", file);
