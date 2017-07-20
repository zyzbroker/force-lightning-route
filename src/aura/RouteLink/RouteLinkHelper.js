({
  click: function(cmp, evt) {
    evt.preventDefault();
    var action = cmp.getEvent('__route_link_clicked');
    action.setParams({
      'context': {
        'url': cmp.get('v.url'),
        'parameters': cmp.get('v.parameters')
      }
    });
    action.fire();
  }
})
