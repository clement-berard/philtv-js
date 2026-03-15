/** @type {Partial<import('typedoc').TypeDocOptions>} */
const config = {
    out: './docs/lib',

    // 1. On re-pointe uniquement sur l'index !
    entryPoints: ["./src/index.ts"],

    // 2. On dit à TypeDoc de cacher tout ce qui a le tag @internal (tes constructeurs)
    excludeInternal: true,

    readme: 'none',
    hideBreadcrumbs: true,
    hidePageHeader: true,
    parametersFormat: 'table',
    propertiesFormat: 'table',
    flattenOutputFiles: true,

    navigation: {
        includeGroups: false
    },

    plugin: ['typedoc-plugin-markdown', 'typedoc-vitepress-theme'],
    docsRoot: './docs/vitepress',
    excludeExternals: true,
    excludePrivate: true,
    excludeProtected: true,
    hideGenerator: true,
    tsconfig: './tsconfig.json',
    skipErrorChecking: false,
    cleanOutputDir: true,
    logLevel: 'Info',
    disableSources: true,
    sidebar: {
        autoConfiguration: true,
        format: "vitepress",
        pretty: false,
        collapsed: false
    }
};

export default config;
