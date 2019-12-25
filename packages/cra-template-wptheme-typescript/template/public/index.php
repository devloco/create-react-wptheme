<?php
  $_reactSrc = realpath(__DIR__) . "/react-src";
  $_publicPath = $_reactSrc . "/public";
  $_postInstallerPath = $_publicPath . "/post_installer.php";

  if (file_exists($_postInstallerPath)) {
    // read the package.json file
    $packagePath = $_reactSrc . "/package.json";
    $json = json_decode(file_get_contents($packagePath), true);

    // set the "homepage" correctly in the JSON
    // this ensures all WebPack produced links will work
    $templatePath = get_template_directory_uri();
    $templatePath = parse_url($templatePath, PHP_URL_PATH);
    $json["homepage"] = $templatePath;
    // set browserLaunchTo to the site's root
    $json["browserLaunchTo"] = site_url();

    // rewrite the package.json file with the new value for "homepage"
    $fp = fopen($packagePath, "w");
    fwrite($fp, json_encode($json, JSON_PRETTY_PRINT));
    fclose($fp);

    // delete the current index.php page (which is this page you are currently reading)
    unlink($_publicPath . "/index.php");
    // rename the "post_installer.php" to make it the new index.php file
    rename($_postInstallerPath, $_publicPath . "/index.php");
  }
?>

Now, back in your command prompt, rerun the "start" script again...

<script>
  setTimeout(function() {
    window.location.replace(window.location);
  }, 3000);
</script>
