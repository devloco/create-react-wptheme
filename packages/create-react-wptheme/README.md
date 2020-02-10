# Create React WP Theme

## Updated!

Be sure to check out the new features (and bug fixes!) that Facebook added to [v3.3.1](https://github.com/facebook/create-react-app/releases/tag/v3.3.1) of `Create-React-App`.

## Good to Know!

[Create-React-App](https://create-react-app.dev/) is **more than** just **React.** `Create-React-App` is a stack of well tested and battle-hardened tools, guaranteed to be configured correctly to work together to make your job easier.

**No need for weird CORS setups** or server proxies. **Why in the world** would you want to **maintain two servers** anyway? No need for that, just use `Create-React-WPTheme` instead. The biggest difference between `Create-React-WPTheme` and `Create-React-App` is that this project here **uses your WordPress server as the development server instead of the Webpack Dev Server.**

## Don't Forget!

If you used an earlier version of `create-react-wptheme` to create a theme, you can easily update it as well. See the [Updating Existing Themes](#updating-existing-themes) section of the README below.

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
