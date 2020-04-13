# Create React WP Theme

Facebook released v3.4.1 of Create-React-App. I'm preparing an update that should be done soon.

Until then you can continue to create new projects using v3.4.0. When the new release is ready, updating is easy!

## Update to 3.4.1 Coming Soon

Apr. 12, 2020
<br />
Facebook released [v3.4.1](https://github.com/facebook/create-react-app/releases/tag/v3.4.1) of `Create-React-App`. I'm preparing an update and should be done soon.

Until then you can continue to create new projects using [v3.4.0](https://github.com/facebook/create-react-app/releases/tag/v3.4.0). When the new release is ready,
[updating is easy](https://github.com/devloco/create-react-wptheme/tree/master#updating-existing-themes)!

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
