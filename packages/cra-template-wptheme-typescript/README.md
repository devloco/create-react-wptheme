# cra-template-wptheme-typescript

This is the official TypeScript template for [Create React WPTheme](https://github.com/devloco/create-react-wptheme).

To use this template, add `--typescript` when creating a new wp theme.

For example:

```sh
npx create-react-wptheme my-theme --typescript
```

# Create React WP Theme

See the latest [README](https://github.com/devloco/create-react-wptheme) on Github.


## Goals

-   Remove WebPackDevServer and use your WordPress dev server instead.
    -   Also, do not proxy the WordPress server.
    -   Thus removing CORS as a concern.
-   Maintain feature parity(ish) with `create-react-app`
-   Touch the original `react-scripts` as little as possible.
    -   Add new files where possible.
    -   This will make merges easier.

## Acknowledgements

I'm grateful to the authors of existing related projects for their ideas and collaboration:

-   [create-react-app](https://github.com/facebook/create-react-app)

    The original.

-   [filewatcher-webpack-plugin](https://www.npmjs.com/package/filewatcher-webpack-plugin)

    I used this as an example for writing my own plugin for watching changes to the create-react-app "public" folder.

## License

Create React WP Theme is open source software [licensed as MIT](https://github.com/devloco/create-react-wptheme/blob/master/LICENSE).
