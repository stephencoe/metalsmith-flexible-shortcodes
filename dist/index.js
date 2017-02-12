"use strict";
var ShortcodeParser = require('meta-shortcodes'),
    each = require('lodash.forEach'),
    merge = require('lodash.merge'),
    plugin;
plugin = function(opts) {
  opts.parserOpts = opts.parserOpts || null;
  var parser = new ShortcodeParser(opts.parserOpts);
  var generated = false,
      generateShortcodes = (function(data) {
        if (!generated) {
          each(opts.shortcodes, (function(fn, name) {
            parser.add(name, (function(opts, content) {
              return fn(content, opts, data);
            }));
          }));
          generated = true;
        }
      });
  return (function(files, metalsmith, done) {
    each(files, (function(file, path) {
      if (!file.shortcodes) {
        return;
      }
      var cnt = file.contents.toString(),
          data = merge({}, file, metalsmith.metadata());
      generateShortcodes(data);
      if (opts.clean) {
        cnt = cnt.replace(/(<p>)(\[.*?\])(<\/p>)/gi, (function(all, p, code) {
          return code;
        }));
      }
      file.contents = new Buffer(parser.parse(cnt));
    }));
    done();
  });
};
module.exports = plugin;
