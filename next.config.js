/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

/** @type {import("next").NextConfig} */
const config = {
	distDir: process.env.NODE_ENV === "production" ? ".next-dist" : ".next-dev",
	typescript: {
		ignoreBuildErrors: true,
	},
};

export default config;
