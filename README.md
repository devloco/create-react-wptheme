# Create React WP Theme

`*UPDATED* to support create-react-app v3.0.1`

-   [Updating Existing Themes](#updating-existing-themes)

The intention of this project is to maintain a set of custom `react-scripts` that will allow you to
create React WordPress themes as easily as `create-react-app` allows other devs to create their apps.

The biggest difference with this project and the original is that **it uses your WordPress server as the
development server instead of the Webpack Dev Server.**

## Usage

To create a WordPress theme using the `create-react-wptheme`, follow these steps.

-   Make sure your WordPress server is up and running.
-   Change dir into your WordPress themes folder (**this is just an example, use your real themes folder**).
    -   Windows: `cd C:\xampp\htdocs\wordpress\wp-content\themes`
    -   Mac or \*nix: `cd /xampp/htdocs/wordpress/wp-content/themes`
-   Use `npx create-react-wptheme` to make a new theme
    -   For example: (**replace "my_react_theme" with whatever you want your theme to be named**):
    -   `npx create-react-wptheme my_react_theme`
        -   If you want to use TypeScript, then the command would be:
        -   `npx create-react-wptheme my_react_theme --typescript`
-   When it finishes it'll tell you to change into your new theme's folder and run the Nodejs watcher (replace "my_react_theme" with the same name you used in the previous step):
    -   `cd my_react_theme/react-src`
    -   `npm run wpstart`
-   That sets up the theme so that it can be seen in the WordPress admin area.
    -   **Go there now and set your WordPress site to use this theme.**
-   View the site in your browser with the new theme.
    -   **You must do this as it does some extra setup via PHP.**
    -   **If you get PHP errors, most likely your web server doesn't have write access to your theme.**
        -   Write access for your web server is only needed during this setup step.
        -   **You can revoke write access after the setup has completed.**
        -   Interested (paranoid?) about what it's doing? Check out the file: `<your theme folder name>/index.php`
    -   When that's done the theme tells you to `Please restart the Nodejs watcher now...`
    -   To do that, go back to your command prompt where you first ran `npm run wpstart` and rerun that same command again.
-   In a few seconds you should see your browser load with the standard create-react-app page, but it's running as a WordPress theme!

## Updating Existing Themes

When new versions of `Create React WP Theme` are released, you can upgrade an existing theme using a single command.

From within your theme's `react-src` folder, run this command at a command prompt:

`npm install @devloco/react-scripts-wptheme@latest`

If your theme uses TypeScript, you'll need to run a second command (`create-react-wptheme` uses the Types from Facebook's React-Scripts):

`npm install react-scripts@latest`

**Important note for Yarn users: be sure to use `yarn add` instead of `npm install` in the above commands.**

## Coding with React

### React Tutorials

If you're looking at a React tutorial on the web, you can use `create-react-wptheme` in place of `create-react-app`.
<br>But you do have to remember that the React app code is one extra folder down inside your theme folder.
<br>Notice that the final folder in this path is `react-src`:

`/xampp/htdocs/wordpress/wp-content/themes/<Your-Create-React-WP-Theme-Folder>/react-src`

So for example, if the tutorial instructs you to edit the `src/App.js` file, then for you, that file would actually be located at (assuming you're already in your new theme's root folder):

`react-src/src/App.js`

### The Public Folder

The authors of the original `create-react-app` say that using the "Public" folder (found at `react-src/public` in your new theme's folder)
is a last ditch "escape hatch" for adding otherwise-hard-to-deal-with files.

But for this project, I've decided to use it for all things that you'd put into a normal WordPress theme (e.g. functions.php, etc.).
So any PHP, hard-coded CSS, and/or hard-coded JS (like other JS libraries that you'd like to reference globally (I don't judge)), can go into
the public folder.

**In addition, any changes made to CSS, JS, and PHP files in the Public folder will cause a rebuild to happen.**
Which is unlike `create-react-app` which ignores most of the files in the Public folder.

I'm not sure if making the Public folder more important is the right decision yet. Maybe I should have created a separate folder for this.
I guess time will tell.

### Dev Configuration

After you've created a new theme, and all the setup is done, you'll find a file named `react-src/user.dev.json` that has some configuration options
that you can mess with if you need to.

### Build Configuration

The `react-src/user.prod.json` configuration file is read when you run `npm run wpbuild`. The only option in there is setting the "homepage"
which controls the relative linking to files in your theme. The "homepage" setting in your main `package.json` file is used during development (and build by default).
During development, this is probably what you want. But if you know your production server will have a different root, then you can set the homepage to be different during
a production build.

For example:

-   Your WordPress dev server is running at http<nolink>://localhost/wordpress
    -   the homepage setting in your main package.json file will probably work just fine.
    -   The homepage line in your main package.json be something like: `"homepage": "/wordpress/wp-content/themes/<your theme's folder name>"`
-   But you know that your production server runs WordPress from the root: http<nolink>://mycoolblog.com/
    -   In this case you want to remove the `/wordpress` part, so set the "homepage" line in your `user.prod.json` file to:
        `"homepage": "/wp-content/themes/<your theme's folder name>"`
    -   Then run `npm run wpbuild`
    -   Note that if you then view your theme on your dev server, it will most likely be broken. But will hopefully look
        correct on your production server.

### HTTPS/SSL Support

If you develop using SSL (i.e. HTTPS), then you might want to run the "Browser Refresh Server" under SSL as well. Especially if you use Firefox, see here:
[Firefox Websocket security issue](https://stackoverflow.com/questions/11768221/firefox-websocket-security-issue).

To configure the Browser Refresh Server to use SSL, follow these steps:

-   These instructions use the command prompt.
-   Assuming you've already created a theme using `create-react-wptheme`, change directory into the `react-src` folder in your theme's folder
    -   Be sure to follow **all the instructions** under the **Usage** section at the top of this document.
    -   Windows example: `cd C:\xampp\htdocs\wordpress\wp-content\themes\<your theme's folder name>\react-src`
    -   Mac or \*nix example: `cd /xampp/htdocs/wordpress/wp-content/themes/<your theme's folder name>/react-src`
-   Create a new folder to hold you're development SSL certificate and key.
    -   All OSes: `mkdir ssl`
-   Change directory into the `ssl` folder
    -   All OSes `cd ssl`
-   Then create the SSL certificate and key.
    -   Windows: Install the [Linux Subsystem for Windows 10](https://docs.microsoft.com/en-us/windows/wsl/install-win10), then use the \*nix instructions below.
    -   Mac, see here: https://ksearch.wordpress.com/2017/08/22/generate-and-import-a-self-signed-ssl-certificate-on-mac-osx-sierra/
    -   \*nix, see here (**also works with Linux Subsystem for Windows 10**): https://stackoverflow.com/questions/10175812/how-to-create-a-self-signed-certificate-with-openssl
-   Depending on which process you use to create the certificate and key, the files you created might have different extensions than those mentioned below.
    -   That's OK.
    -   Sometimes both files have a `.pem` extension, or each file has a different extension like `.crt` and `.key`.
    -   **Just be sure you know which file is the certificate and which is the key.**
-   There is a file named `user.dev.json` in the folder named `react-src` in your theme.
    -   Open that file in your favorite text editor.
    -   Change the "wpThemeServer" section to look like this (make sure it is proper JSON):
    -   `"wpThemeServer": { "enable": true, "host": "127.0.0.1", "port": 8090, "sslCert": "ssl/localhost.crt", "sslKey": "ssl/localhost.key", "watchFile": "../index.php" },`
    -   **NOTE** the `sslCert` and `sslKey` items. **Make sure the values point to your SSL certificate and key files.**
    -   The paths to those files can be **full paths** or **relative paths** from the `react-src` folder (as shown above).
    -   I like to set the `host` to `127.0.0.1` instead of "localhost". The numeric address gets special treatment at the OS level as being mostly safe.
-   Back in your command prompt, change dir back to the `react-src` folder.
    -   All OSes: `cd ..`
-   Start Node/Webpack JS watcher as you normally would:
    -   All OSes: `npm run start`
    -   Your theme should open in a new browser tab
-   If you need to add an SSL exception to your browser for your new certificate, there is a page running over HTTPS at the "host" and "port" you set in `user.dev.json` above.
    -   For example, if you're using host `127.0.0.1` and port `8090` as shown above, then open your browser to:
        -   https<nolink>://127.0.0.1:8090/
    -   From there you'll get the standard browser warning about self-signed certificates and get the option to add an exception.
    -   Once you've finished adding an exception to your browser, you'll need to refresh the tab with your development theme to force a reconnect to the Browser Refresh Server.

## Goals

-   Remove WebPackDevServer and use your WordPress dev server instead.
    -   Also, do not proxy the WordPress server.
    -   Thus removing CORS as a concern.
-   Maintain feature parity(ish) with `create-react-app`
-   Touch the original `react-scripts` as little as possible.
    -   Add new files where possible.
    -   This will make merges easier.
    -   However, something worse than merge conflicts is confusing users.
        -   If completely munging one of the original files will lower the number of support issues... do it!
            -   Example: renaming all the original `create-react-app` scripts by prefixing them with "cra" (e.g. crastart, craeject, etc.)
                will stop ensure users don't accidentally start the Webpack Dev Server, but still allows them to.

## Acknowledgements

I'm grateful to the authors of existing related projects for their ideas and collaboration:

-   [create-react-app](https://github.com/facebook/create-react-app)

    The original.

-   [filewatcher-webpack-plugin](https://www.npmjs.com/package/filewatcher-webpack-plugin)

    I used this as an example for writing my own plugin for watching changes to the create-react-app "public" folder.

## License

Create React WP Theme is open source software [licensed as MIT](https://github.com/devloco/create-react-wptheme/blob/master/LICENSE).
