import inertia from '@inertiajs/vite';
import { wayfinder } from '@laravel/vite-plugin-wayfinder';
import babel from '@rolldown/plugin-babel';
import tailwindcss from '@tailwindcss/vite';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import laravel from 'laravel-vite-plugin';
import { bunny } from 'laravel-vite-plugin/fonts';
import { defineConfig, lazyPlugins, type Plugin } from 'vite-plus';

/**
 * Serves the app from a subfolder. Wayfinder bakes root relative URLs into the
 * generated route helpers, so when the app does not sit at the domain root
 * those URLs need the folder in front of them. Set APP_PATH_PREFIX at build
 * time (APP_PATH_PREFIX=helicore npm run build); unset, this does nothing.
 */
function wayfinderBasePath(): Plugin {
    const prefix = (process.env.APP_PATH_PREFIX ?? '').replace(/^\/|\/$/g, '');

    return {
        name: 'helicore:wayfinder-base-path',
        enforce: 'pre',
        transform(code, id) {
            if (
                prefix === '' ||
                !/resources[\\/]js[\\/](actions|routes)[\\/]/.test(id)
            ) {
                return null;
            }

            // Runs before the literals are rewritten by the TS transform.
            return code
                .replaceAll('url: "/', `url: "/${prefix}/`)
                .replaceAll("url: '/", `url: '/${prefix}/`);
        },
    };
}

export default defineConfig({
    plugins: lazyPlugins(() => [
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
            fonts: [
                bunny('Archivo', {
                    weights: [400, 500, 600, 700],
                }),
            ],
        }),
        inertia(),
        react(),
        babel({
            presets: [reactCompilerPreset()],
        }),
        tailwindcss(),
        wayfinder({
            formVariants: true,
        }),
        wayfinderBasePath(),
    ]),
    server: {
        watch: {
            ignored: [
                '**/.agents/**',
                '**/.claude/**',
                '**/.cursor/**',
                '**/.junie/**',
                '**/vendor/**',
            ],
        },
    },
    lint: {
        ignorePatterns: [
            'vendor/**',
            'node_modules/**',
            'public/**',
            'bootstrap/ssr/**',
            'tailwind.config.js',
            'resources/js/actions/**',
            'resources/js/components/ui/*',
            'resources/js/routes/**',
            'resources/js/wayfinder/**',
        ],
        options: {
            denyWarnings: true,
            typeAware: true,
        },
    },
    fmt: {
        printWidth: 80,
        tabWidth: 4,
        singleQuote: true,
        semi: true,
        singleAttributePerLine: false,
        htmlWhitespaceSensitivity: 'css',
        ignorePatterns: [
            '.github/**',
            'composer.json',
            'resources/js/components/ui/*',
            'resources/views/mail/*',
        ],
        sortTailwindcss: {
            functions: ['clsx', 'cn', 'cva'],
            entryPoint: 'resources/css/app.css',
        },
    },
});
