/** @type {Partial<import('typedoc').TypeDocOptions>} */
const config = {
        out: './docs/lib',
        entryPoints: ["./src/index.ts"],
        plugin: ['typedoc-plugin-markdown', 'typedoc-vitepress-theme'],
        docsRoot: './docs/vitepress',
        excludeExternals: true,
        excludePrivate: true,
        excludeProtected: true,
        hideGenerator: true,
        tsconfig: './tsconfig.json',
        readme: 'README.md',
        skipErrorChecking: false,
        cleanOutputDir: true,
        logLevel: 'Info',
        disableSources: true,
        "sidebar": {
                "autoConfiguration": true,
                "format": "vitepress",
                "pretty": false,
                "collapsed": true
        }
    }
;
export default config;
