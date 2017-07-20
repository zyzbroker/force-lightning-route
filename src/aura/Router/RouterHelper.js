({
  _INDEX_URL: 'index',
  _HASH_PREFIX: 'nav',

  init: function(cmp, evt) {
    this._initRoutes(cmp);
    this._doInitRoute(cmp);
  },

  _initRoutes: function(cmp) {
    var routes = [];

    function getRouteRule(def) {
      var url = def.get('v.url'),
        rel1 = def.get('v.routeViewRelation'),
        rel2 = def.get('v.componentRelation'),
        directTo = def.get('v.directTo') || '';

      if (!url || (!directTo && (!rel1 || !rel2))) {
        return 0;
      }

      var route = {
        url: url,
        viewPath: rel1,
        cmpPath: rel2
      };
      if (!!directTo) {
        route['directTo'] = directTo;
      }
      return route;
    }

    cmp.get('v.body')
      .forEach(function(def) {
        if (def.isInstanceOf('c:RouteDefinition')) {
          var rule = getRouteRule(def);
          if (!!rule) {
            routes.push(rule);
          }
        }
      });

    cmp.set('v.routes', routes);
    console.log('----init router ----');
    console.log(routes);
  },

  _getRouteView: function(cmp) {
    var rViews = cmp.get('v.body').filter(function(e) {
      return e.isInstanceOf('c:RouteView');
    });
    return (!rViews || rViews.length === 0) ? 0 : rViews[0];
  },

  _doInitRoute: function(cmp) {
    var data = this._getHashData();
    if (!data) {
      this._handleIndexRoute(cmp);
    } else {
      this._handleHashedRoute(cmp, data);
    }
  },

  _handleIndexRoute: function(cmp) {
    console.log('----route to index ----');
    var data, route = this._getIndexRoute(cmp);
    if (!route) {
      return;
    }
    data = this._cloneObject(route);
    this._replaceState(data);
    this._handleHashedRoute();
  },

  _cloneObject: function(src) {
    var t = {};
    Object.keys(src).forEach(function(k) {
      t[k] = src[k];
    });
    return t;
  },

  _getIndexRoute: function(cmp) {
    var self = this,
      routes = cmp.get('v.routes') || [];
    var indexes = routes.filter(function(r) {
      return r.url === self._INDEX_URL;
    });
    if (indexes.length === 0) {
      return 0;
    }
    if (!!indexes[0].directTo) {
      indexes = routes.filter(function(r) {
        return r.url === indexes[0].directTo;
      });
      if (indexes.length === 0) {
        return 0
      }
    }
    return indexes[0];
  },

  _handleHashedRoute: function() {
    console.log('-----route to hashed route-----');
    var appEvt = $A.get('e.c:RouteRequestAppEvent');
    appEvt.fire();
  },



  routeLinkClick: function(cmp, evt) {
    evt.stopPropagation();
    var context = evt.getParam('context');
    var route = this._findRoute(cmp)(context.url);
    if (!route) {
      this._showToast('Router Dialog', 'The system failed to route the request. The route (' + context.url + ') is not defined.');
      return;
    }
    var data = this._cloneObject(route);
    data.parameters = context.parameters;
    this._pushState(data);
    this._handleHashedRoute();
  },

  _findRoute: function(cmp) {
    return function(url) {
      if (!url) {
        return 0;
      }
      var routes = cmp.get('v.routes').filter(function(r) {
        return r.url === url;
      });
      return routes.length > 0 ? routes[0] : 0;
    }
  },

  _replaceState: function(data) {
    var url = this._genHashUrl(data);
    history.replaceState(null, null, url);
  },

  _genHashUrl: function(data) {
    var path = location.pathname,
      search = location.search || '',
      hash = this._hash(location.hash || '')(data);
    return [path, search, hash].join('');
  },

  _pushState: function(data) {
    var url = this._genHashUrl(data);
    history.pushState(null, null, url);
  },

  _getHashData: function() {
    var data,
      self = this,
      hash = location.hash || '',
      prefix = this._HASH_PREFIX + '=';

    if (hash.indexOf(prefix) === -1) {
      return 0;
    }
    return JSON.parse(self._decode(hash.substr(hash.indexOf(prefix) + prefix.length)));
  },

  _hash: function(hash) {
    var self = this;
    var prefix = this._HASH_PREFIX;
    var symbol = hash.indexOf('?') !== -1 ? '&' : '?';
    var hs = hash.indexOf(prefix) > 0 ? hash.substr(0, hash.indexOf(prefix) - 1) : hash;
    return function(other) {
      other = self._encode(JSON.stringify(other));
      return [hs, prefix + '=' + other].join(symbol);
    }
  },

  _showToast: function(title, msg, msgType) {
    var toast = $A.get("e.force:showToast");
    toast.setParams({
      "title": title,
      "message": msg,
      'type': msgType
    });

    toast.fire();
  },
  _encode: function(data) {
    return window.btoa(unescape(encodeURIComponent(data)));
  },
  _decode: function(data) {
      return decodeURIComponent(escape(window.atob(data)));
    }
    ///// end of code /////
})