import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Laundry 3 Putra',
        short_name: 'Laundry Ibu',
        description: 'Aplikasi Manajemen Laundry Ibu',
        start_url: '/',
        display: 'standalone',
        background_color: '#fff1f2', // pink-50
        theme_color: '#ec4899', // pink-500
        icons: [
            {
                src: '/icon',
                sizes: 'any',
                type: 'image/png',
            },
        ],
    }
}
