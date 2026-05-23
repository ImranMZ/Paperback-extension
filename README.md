# ComicKZ Extension

A [Paperback](https://paperback.moe) source extension for reading manga, manhwa, and comics from [ComicKZ](https://comickz.co.uk).

## Disclaimer

This project is an **unofficial third-party extension** for Paperback. It is not affiliated with, endorsed by, or connected to ComicKZ or any content publishers.

**No copyrighted content is hosted, stored, or distributed by this extension.** This extension simply provides parsing logic that reads publicly available web pages and API responses from ComicKZ within the Paperback iOS application, in the same way a web browser would.

All manga, images, and content displayed through this extension are hosted by ComicKZ's servers. This extension does not download, cache, or redistribute any copyrighted material.

## Copyright & Takedown

If you are a copyright holder and believe content accessible through this extension infringes your rights:

1. File a takedown request with the content host: **ComicKZ** at `https://comickz.co.uk`
2. Contact me via GitHub Issues to request removal of this extension's repository link

I will promptly remove or disable access to the relevant source upon receiving a valid takedown notice or upon confirmation that the upstream content host has removed the infringing material.

## Installation

1. Install [Paperback](https://apps.apple.com/us/app/paperback-a-komga-client/id1626613373) from the App Store
2. Add the repository URL in Paperback:
   ```
   https://imranmz.github.io/Paperback-extension/main/
   ```
3. Install the **ComicKZ** source

## Features

- Search manga by title
- Browse manga details (description, genres, status, rating)
- Read chapters with image pages
- Homepage sections: Popular Ongoing, Recently Added, Latest Updates
- Content rating filtering (safe / suggestive / erotica)
- Cloudflare bypass support

## Development

```bash
git clone https://github.com/ImranMZ/Paperback-extension.git
cd Paperback-extension
npm install
npm run bundle
```

The bundled output will be in `./bundles/`. Serve it with any HTTP server to test locally.

## License

This project is provided for educational purposes only. Users are responsible for complying with applicable copyright laws in their jurisdiction.
