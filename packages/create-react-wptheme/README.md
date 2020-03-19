# Create React WP Theme

## Still Up to Date

Mar. 19, 2020
<br />
It's been a while, so I thought I'd just let everyone know that [v3.4.0](https://github.com/facebook/create-react-app/releases/tag/v3.4.0) of `Create-React-App` is still the latest. I'll keep my eye on it and update this project whenever Facebook releases a new version.

---

## Getting Started

[Michael Soriano](https://github.com/michaelsoriano) is writing a tutorial for creating a theme using React. He uses `create-react-wptheme` for the initial setup. He provides a lot more detail than this `readme` and the screen shots are really helpful.

Check it out:
<br>
[Let's build a WordPress theme with React: Part 1 (Setup)](http://michaelsoriano.com/wordpress-theme-react-part-1-setup/)

---

See the full [README](https://github.com/devloco/create-react-wptheme) on Github.

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
