"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getInfoPlistPathFromPbxproj = getInfoPlistPathFromPbxproj;
function _Xcodeproj() {
  const data = require("./Xcodeproj");
  _Xcodeproj = function () {
    return data;
  };
  return data;
}
function _Target() {
  const data = require("../Target");
  _Target = function () {
    return data;
  };
  return data;
}
/**
 * Find the Info.plist path linked to a specific build configuration.
 *
 * @param projectRoot
 * @param param1
 * @returns
 */
function getInfoPlistPathFromPbxproj(projectRootOrProject, {
  targetName,
  buildConfiguration = 'Release'
} = {}) {
  const project = (0, _Xcodeproj().resolvePathOrProject)(projectRootOrProject);
  if (!project) {
    return null;
  }
  const xcBuildConfiguration = (0, _Target().getXCBuildConfigurationFromPbxproj)(project, {
    targetName,
    buildConfiguration
  });
  if (!xcBuildConfiguration) {
    return null;
  }
  // The `INFOPLIST_FILE` is relative to the project folder, ex: app/Info.plist.
  return sanitizeInfoPlistBuildProperty(xcBuildConfiguration.buildSettings.INFOPLIST_FILE);
}
function sanitizeInfoPlistBuildProperty(infoPlist) {
  return infoPlist?.replace(/"/g, '').replace('$(SRCROOT)', '') ?? null;
}
//# sourceMappingURL=getInfoPlistPath.js.map