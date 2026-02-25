import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'Aura Notes',
    short_name: 'Aura Notes',
    description: 'Private Knowledge Vault',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#f2f3f7',
    theme_color: '#2a2b33',
    lang: 'pl-PL',
    categories: ['productivity', 'utilities'],
    icons: [
      {
        src: '/duck_hunt_dog.png',
        sizes: '640x640',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/duck_hunt_dog.png',
        sizes: '640x640',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
