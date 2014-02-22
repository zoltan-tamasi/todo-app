require.config({
  paths: {
    jquery: 'bower_components/jquery/src/jquery',
    underscore: 'bower_components/underscore/underscore-min',
    backbone: 'bower_components/backbone/backbone-min',
    knockback: 'bower_components/knockback/knockback',
    knockout: 'bower_components/knockout/knockout'
  }
});

require ([
  'app'
], function(App) {
  return App.initialize();
});