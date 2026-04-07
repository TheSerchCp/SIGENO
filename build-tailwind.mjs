import postcss from "postcss";
import tailwindPlugin from "@tailwindcss/postcss";
import fs from "fs";
import tailwindConfig from "./tailwind.config.js";

const inputPath = "./assets/css/input.css";
const outputPath = "./assets/css/tailwind.css";

async function build() {
  try {
    const input = fs.readFileSync(inputPath, "utf8");
    const result = await postcss([tailwindPlugin(tailwindConfig)]).process(input, { from: inputPath });
    fs.writeFileSync(outputPath, result.css);
    console.log(`✓ CSS compiled successfully to ${outputPath}`);
  } catch (error) {
    console.error("Error compiling CSS:", error.message);
    process.exit(1);
  }
}

build();
