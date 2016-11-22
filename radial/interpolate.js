(function(root) {
  'use strict';

  /**
   * interpolateRGB
   * @desc Interpolate RGB colors.
   * @param {number[]} rgb1 - rgb array
   * @param {number[]} rgb2 - rgb array
   * @param {number} target - target value between units 0 - 1
   * @return interpolated rgb color array
   */
  function interpolateRGB(rgb1, rgb2, t) {
    rgb1 = interpolateRGB._clipRGB(rgb1);
    rgb2 = interpolateRGB._clipRGB(rgb2);

    var r_1 = rgb1[0];
    var g_1 = rgb1[1];
    var b_1 = rgb1[2];
    var a_1 = rgb1[3];

    var r_2 = rgb2[0];
    var g_2 = rgb2[1];
    var b_2 = rgb2[2];
    var a_2 = rgb2[3];

    var interpolate = function(t) {
      t = interpolateRGB._clipT(t);

      var r_3 = r_1 + t * (r_2 - r_1);
      var g_3 = g_1 + t * (g_2 - g_1);
      var b_3 = b_1 + t * (b_2 - b_1);
      var result = [r_3, g_3, b_3];

      if (rgb1.length === 4 && rgb2.length === 4) {
        var a_3 = a_1 + t * (a_2 - a_1);
        result.push(a_3);
      }

      return result;
    };

    if (arguments.length === 2) {
      return interpolate;
    } else {
      return interpolate(t);
    }
  }

  /**
   * clipRGB
   * @desc Clips rgb values to stay within constraints 0-255
   * @param {number[]} rgb - rgb array
   * @return clipped values
   */
  interpolateRGB._clipRGB = function(rgb) {
    if (!(Array.isArray(rgb) && rgb.length >= 3)) {
      rgb = [0,0,0];
    }

    for (var i = 0; i < rgb.length; i++) {
      if (i < 3) {
        if (rgb[i] < 0) {
          rgb[i] = 0;
        } else if (rgb[i] > 255) {
          rgb[i] = 255;
        }
      } else if (i === 3) {
        if (rgb[i] < 0) {
          rgb[i] = 0;
        } else if (rgb[i] > 1) {
          rgb[i] = 1;
        }
      }
    }

    return rgb;
  };

  /**
   * clipT
   * @desc Clips target value to stay within constraints 0-1
   * @param {number} target - target value
   * @return clipped value
   */
  interpolateRGB._clipT = function(t) {
    if (typeof t !== 'number') {
      t = 0;
    }

    if (t > 1) {
      t = 1;
    } else if (t < 0) {
      t = 0;
    }

    return t;
  };

  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = interpolateRGB;
    }
    exports.interpolateRGB = interpolateRGB;
  } else if (typeof define === 'function' && define.amd) {
    define([], function() {
      return interpolateRGB;
    });
  } else {
    root.interpolateRGB = interpolateRGB;
  }

})(this);
