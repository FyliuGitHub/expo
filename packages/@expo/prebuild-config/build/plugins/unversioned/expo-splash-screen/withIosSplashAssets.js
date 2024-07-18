"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.buildContentsJsonImages = buildContentsJsonImages;
exports.withIosSplashAssets = void 0;
function _configPlugins() {
  const data = require("@expo/config-plugins");
  _configPlugins = function () {
    return data;
  };
  return data;
}
function _imageUtils() {
  const data = require("@expo/image-utils");
  _imageUtils = function () {
    return data;
  };
  return data;
}
function _debug() {
  const data = _interopRequireDefault(require("debug"));
  _debug = function () {
    return data;
  };
  return data;
}
function _fsExtra() {
  const data = _interopRequireDefault(require("fs-extra"));
  _fsExtra = function () {
    return data;
  };
  return data;
}
function _path() {
  const data = _interopRequireDefault(require("path"));
  _path = function () {
    return data;
  };
  return data;
}
function _AssetContents() {
  const data = require("../../icons/AssetContents");
  _AssetContents = function () {
    return data;
  };
  return data;
}
function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
const debug = (0, _debug().default)('expo:prebuild-config:expo-splash-screen:ios:assets');
const IMAGE_CACHE_NAME = 'splash-ios';
const IMAGESET_PATH = 'Images.xcassets/SplashScreen.imageset';
const PNG_FILENAME = 'image';
const DARK_PNG_FILENAME = 'dark_image';
const TABLET_PNG_FILENAME = 'tablet_image';
const DARK_TABLET_PNG_FILENAME = 'dark_tablet_image';
const withIosSplashAssets = (config, splash) => {
  if (!splash) {
    return config;
  }
  return (0, _configPlugins().withDangerousMod)(config, ['ios', async config => {
    const iosNamedProjectRoot = _configPlugins().IOSConfig.Paths.getSourceRoot(config.modRequest.projectRoot);
    await configureImageAssets({
      projectRoot: config.modRequest.projectRoot,
      iosNamedProjectRoot,
      image: splash.image,
      darkImage: splash.dark?.image,
      tabletImage: splash.tabletImage,
      darkTabletImage: splash.dark?.tabletImage,
      logoWidth: splash.logoWidth ?? 100
    });
    return config;
  }]);
};

/**
 * Creates imageset containing image for Splash/Launch Screen.
 */
exports.withIosSplashAssets = withIosSplashAssets;
async function configureImageAssets({
  projectRoot,
  iosNamedProjectRoot,
  image,
  darkImage,
  tabletImage,
  darkTabletImage,
  logoWidth
}) {
  const imageSetPath = _path().default.resolve(iosNamedProjectRoot, IMAGESET_PATH);

  // ensure old SplashScreen imageSet is removed
  await _fsExtra().default.remove(imageSetPath);
  if (!image) {
    return;
  }
  await writeContentsJsonFileAsync({
    assetPath: imageSetPath,
    image: PNG_FILENAME,
    darkImage: darkImage ? DARK_PNG_FILENAME : null,
    tabletImage: tabletImage ? TABLET_PNG_FILENAME : null,
    darkTabletImage: darkTabletImage ? DARK_TABLET_PNG_FILENAME : null
  });
  await copyImageFiles({
    projectRoot,
    iosNamedProjectRoot,
    image,
    darkImage,
    tabletImage,
    darkTabletImage,
    logoWidth
  });
}
async function copyImageFiles({
  projectRoot,
  iosNamedProjectRoot,
  image,
  darkImage,
  tabletImage,
  darkTabletImage,
  logoWidth
}) {
  const logo = await _jimpCompact().default.read(image);
  await Promise.all([{
    ratio: 1,
    suffix: ''
  }, {
    ratio: 2,
    suffix: '@2x'
  }, {
    ratio: 3,
    suffix: '@3x'
  }].map(({
    ratio,
    suffix
  }) => {
    const filePath = path().resolve(iosNamedProjectRoot, IMAGESET_PATH, `${PNG_FILENAME}${suffix}.png`);
    const size = logoWidth * ratio;
    const height = Math.ceil(size * (logo.bitmap.height / logo.bitmap.width));
    return logo.clone().resize(size, height).writeAsync(filePath);
  }));
  await generateImagesAssetsAsync({
    async generateImageAsset(item, fileName) {
      // Using this method will cache the images in `.expo` based on the properties used to generate them.
      // this method also supports remote URLs and using the global sharp instance.
      const {
        source
      } = await (0, _imageUtils().generateImageAsync)({
        projectRoot,
        cacheType: IMAGE_CACHE_NAME
      }, {
        src: item
      });
      // Write image buffer to the file system.
      // const assetPath = join(iosNamedProjectRoot, IMAGESET_PATH, filename);
      await _fsExtra().default.writeFile(_path().default.resolve(iosNamedProjectRoot, IMAGESET_PATH, fileName), source);
    },
    anyItem: image,
    darkItem: darkImage,
    tabletItem: tabletImage,
    darkTabletItem: darkTabletImage
  });
}
async function generateImagesAssetsAsync({
  generateImageAsset,
  anyItem,
  darkItem,
  tabletItem,
  darkTabletItem
}) {
  const items = [[anyItem, PNG_FILENAME], [darkItem, DARK_PNG_FILENAME], [tabletItem, TABLET_PNG_FILENAME], [darkTabletItem, DARK_TABLET_PNG_FILENAME]].filter(([item]) => !!item);
  await Promise.all(items.map(([item, fileName]) => generateImageAsset(item, fileName)));
}
<<<<<<< HEAD
async function createSplashScreenBackgroundImageAsync({
  iosNamedProjectRoot,
  splash
}) {
  const color = splash.backgroundColor;
  const darkColor = splash.dark?.backgroundColor;
  const tabletColor = splash.tabletBackgroundColor;
  const darkTabletColor = splash.dark?.tabletBackgroundColor;
  const imagesetPath = _path().default.join(iosNamedProjectRoot, BACKGROUND_IMAGESET_PATH);
  // Ensure the Images.xcassets/... path exists
  await _fsExtra().default.remove(imagesetPath);
  await _fsExtra().default.ensureDir(imagesetPath);
  await createBackgroundImagesAsync({
    iosNamedProjectRoot,
    color,
    darkColor: darkColor ? darkColor : null,
    tabletColor: tabletColor ? tabletColor : null,
    darkTabletColor: darkTabletColor ? darkTabletColor : null
  });
  await writeContentsJsonFileAsync({
    assetPath: _path().default.resolve(iosNamedProjectRoot, BACKGROUND_IMAGESET_PATH),
    image: PNG_FILENAME,
    darkImage: darkColor ? DARK_PNG_FILENAME : null,
    tabletImage: tabletColor ? TABLET_PNG_FILENAME : null,
    darkTabletImage: darkTabletColor ? DARK_TABLET_PNG_FILENAME : null
  });
}
||||||| parent of a1ac4fc818 (Adjust iOS part of plugin)
async function createSplashScreenBackgroundImageAsync({
  iosNamedProjectRoot,
  splash
}) {
  const color = splash.backgroundColor;
  const darkColor = splash.dark?.backgroundColor;
  const tabletColor = splash.tabletBackgroundColor;
  const darkTabletColor = splash.dark?.tabletBackgroundColor;
  const imagesetPath = path().join(iosNamedProjectRoot, BACKGROUND_IMAGESET_PATH);
  // Ensure the Images.xcassets/... path exists
  await _fsExtra().default.remove(imagesetPath);
  await _fsExtra().default.ensureDir(imagesetPath);
  await createBackgroundImagesAsync({
    iosNamedProjectRoot,
    color,
    darkColor: darkColor ? darkColor : null,
    tabletColor: tabletColor ? tabletColor : null,
    darkTabletColor: darkTabletColor ? darkTabletColor : null
  });
  await writeContentsJsonFileAsync({
    assetPath: path().resolve(iosNamedProjectRoot, BACKGROUND_IMAGESET_PATH),
    image: PNG_FILENAME,
    darkImage: darkColor ? DARK_PNG_FILENAME : null,
    tabletImage: tabletColor ? TABLET_PNG_FILENAME : null,
    darkTabletImage: darkTabletColor ? DARK_TABLET_PNG_FILENAME : null
  });
}
=======
>>>>>>> a1ac4fc818 (Adjust iOS part of plugin)
const darkAppearances = [{
  appearance: 'luminosity',
  value: 'dark'
}];
function buildContentsJsonImages({
  image,
  darkImage,
  tabletImage,
  darkTabletImage
}) {
  return [
  // Phone light
  (0, _AssetContents().createContentsJsonItem)({
    idiom: 'universal',
    filename: `${image}.png`,
    scale: '1x'
  }), (0, _AssetContents().createContentsJsonItem)({
    idiom: 'universal',
    filename: `${image}@2x.png`,
    scale: '2x'
  }), (0, _AssetContents().createContentsJsonItem)({
    idiom: 'universal',
    filename: `${image}@3x.png`,
    scale: '3x'
  }),
  // Phone dark
  darkImage && (0, _AssetContents().createContentsJsonItem)({
    idiom: 'universal',
    appearances: darkAppearances,
    filename: darkImage,
    scale: '1x'
  }), darkImage && (0, _AssetContents().createContentsJsonItem)({
    idiom: 'universal',
    appearances: darkAppearances,
    scale: '2x'
  }), darkImage && (0, _AssetContents().createContentsJsonItem)({
    idiom: 'universal',
    appearances: darkAppearances,
    scale: '3x'
  }),
  // Tablet light
  tabletImage && (0, _AssetContents().createContentsJsonItem)({
    idiom: 'ipad',
    filename: tabletImage,
    scale: '1x'
  }), tabletImage && (0, _AssetContents().createContentsJsonItem)({
    idiom: 'ipad',
    scale: '2x'
  }),
  // Phone dark
  darkTabletImage && (0, _AssetContents().createContentsJsonItem)({
    idiom: 'ipad',
    appearances: darkAppearances,
    filename: darkTabletImage ?? undefined,
    scale: '1x'
  }), darkTabletImage && (0, _AssetContents().createContentsJsonItem)({
    idiom: 'ipad',
    appearances: darkAppearances,
    scale: '2x'
  })].filter(Boolean);
}
async function writeContentsJsonFileAsync({
  assetPath,
  image,
  darkImage,
  tabletImage,
  darkTabletImage
}) {
  const images = buildContentsJsonImages({
    image,
    darkImage,
    tabletImage,
    darkTabletImage
  });
  debug(`create contents.json:`, assetPath);
  debug(`use images:`, images);
  await (0, _AssetContents().writeContentsJsonAsync)(assetPath, {
    images
  });
}
//# sourceMappingURL=withIosSplashAssets.js.map