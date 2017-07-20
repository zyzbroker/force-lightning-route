({
  _HASH_PREFIX: 'nav',

  init: function(cmp, evt) {
    console.log('---- init routeView:' + cmp.get('v.path') + '----');
    var data = this._getHashData();
    if (!data) {
      return;
    }
    this._handleState(cmp, data);
  },

  _handleState: function(cmp, data) {
    var component, viewPath = (data.viewPath || '').split('/'),
      cmpPath = (data.cmpPath || '').split('/'),
      parameters = data.parameters || {},
      myPath = cmp.get('v.path');

    for (var i = 0; i < viewPath.length; i++) {
      if (viewPath[i] === myPath) {
        component = cmpPath[i];
        if (!this._shouldLoadComponent(cmp, component, parameters)) {
          console.log('----component:' + component + ' already loaded----');
          return;
        }
        cmp.set('v.component', component);
        cmp.set('v.parameters', parameters);
        this._newComponent(cmp, component, parameters);
        break;
      }
    }
  },

  route: function(cmp, evt) {
    console.log('----subscribe to route app event----' + cmp.get('v.path'));
    var data = this._getHashData();
    if (!data) {
      return;
    }
    this._handleState(cmp, data);
  },

  _newComponent: function(cmp, componentName, parameters) {
    $A.createComponent(componentName, parameters, function(child, status, error) {
      switch (status) {
        case 'SUCCESS':
          cmp.set('v.body', child);
          break;
        case 'INCOMPLETE':
          console.log('No response from server or client is offline.');
          break;
        case 'ERROR':
          console.log('Error:' + error);
      }
    });
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

  _shouldLoadComponent: function(cmp, componentName, parameters) {
    var currentComponent = cmp.get('v.component'),
      currentProps = cmp.get("v.parameters") || {};
    if (currentComponent !== componentName) {
      return 1;
    }
    return this._matchObject(currentProps)(parameters) ? 0 : 1;
  },

  _matchObject: function(source) {
    return function(target) {
      var keys = Object.keys(source);
      return keys.length === 0 || !keys.some(function(k) {
        return source[k] != target[k];
      });
    }
  },

  _encode: function(data) {
    return window.btoa(unescape(encodeURIComponent(data)));
  },

  _decode: function(data) {
      return decodeURIComponent(escape(window.atob(data)));
    }
    ////// end of code /////
})