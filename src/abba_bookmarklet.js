'use strict';
(function() {
  var _container = null;
  // var _baseUrl = 'http://localhost:8080/';
  var _baseUrl = 'https://rawgit.com/vbachevhx/abba-bookmarklet/master/src/';
  var _cookiePrefix = 'abbaVariant_';
  var _tests = [];
  var _templates = {
    list: '' +
      '<div class="abba-popup">' +
        '<div class="abba-title">ABBA Switcher</div>' +
        '<ul class="abba-list">{{items}}</ul>' +
      '</div>',

    item: '' +
      '<li class="abba-item">' +
        '<input class="abba-toggle" type="radio" id="{{toggleId}}" name="abba-toggle" />' +
        '<label class="abba-name" for="{{toggleId}}">{{name}}</label>' +
        '<div class="abba-contents">{{variants}}</div>' +
      '</li>',

    variant: '' +
      '<input type="radio" class="abba-variant-radio" id="{{variantId}}" name="{{name}}" value="{{value}}" {{selected}} />' +
      '<label class="abba-variant" for={{variantId}}>' +
        '{{value}}' +
        '<span class="abba-weight">{{weight}}</span>' +
      '</label>',

    noTests: '' +
      '<li class="abba-item">' +
        '<label class="abba-name">No ABBA tests on this page.</label>' +
      '</li>'
  };

  function getTests() {
    var tests = [];
    if (!window.hx || !hx.abba) return tests;
    for (var key in hx.abba._tests) {
      var test = hx.abba._tests[key];
      tests.push({
        name: key,
        variants: test._cachedAbba.variants.map(function(variant) {
          return {
            value: variant.name,
            weight: variant.weight,
            chosen: test._cachedAbba.chosen.name == variant.name,
            control: Boolean(variant.control)
          };
        })
      });
    }
    return tests;
  }

  function setCookie(name, value) {
    document.cookie = _cookiePrefix + encodeURIComponent(name) + '=' + encodeURIComponent(value);
  }

  function create() {
    _tests = getTests();
    createContainer();
    loadCSS();
  	_container.addEventListener('click', handleClick);
  }

  function destroy() {
    document.body.removeChild(_container);
  }

  function createContainer() {
    _container = document.createElement('div');
    _container.classList.add('abba-wrapper');
    _container.innerHTML = getContents();
    document.body.appendChild(_container);
  }

  function loadCSS() {
  	var styleTag = document.createElement('link');
  	styleTag.setAttribute('rel', 'stylesheet');
  	styleTag.setAttribute('href', _baseUrl + 'abba_bookmarklet.css');
  	_container.appendChild(styleTag);
  }

  function getContents() {
    var itemsMarkup = itemsMarkup = _templates.noTests;
    if (_tests.length) {
      itemsMarkup = _tests.reduce(function(markup, test, index) {
        var variantsMarkup = test.variants.reduce(function(vMarkup, variant, vIndex) {
          return vMarkup + parseTemplate(_templates.variant, {
            variantId: 'abbaItem' + index + 'v' + vIndex,
            name: test.name,
            value: variant.value,
            weight: '' + variant.weight + '%',
            selected: variant.chosen ? 'checked' : ''
          });
        }, '');

        return markup + parseTemplate(_templates.item, {
          toggleId: 'abbaItem' + index,
          name: test.name,
          variants: variantsMarkup
        });
      }, '');
    }
    return parseTemplate(_templates.list, { items: itemsMarkup });
  }

  function parseTemplate(template, values) {
    for (var key in values) {
      var rx = new RegExp('{{' + key + '}}', 'g');
      template = template.replace(rx, values[key]);
    }
    return template;
  }

  function handleClick(event) {
  	if (event.target === event.currentTarget) {
      // click on the container element (gray overlay)
  		destroy();
  	} else if (event.target.classList.contains('abba-variant')) {
      handleButtonClick(event.target);
    }
  }

  function handleButtonClick(button) {
    var input = document.getElementById(button.getAttribute('for'));
    setCookie(input.name, input.value);
  }

  create();
})();
