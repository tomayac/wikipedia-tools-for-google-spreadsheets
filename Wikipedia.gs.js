/**
 * @license
 * Copyright 2016 Thomas Steiner (@tomayac). All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

var HEADERS = {headers: {'Cache-Control': 'max-age=0'}};
var DEFAULT_LANGUAGE = 'en';

/**
 * Returns Wikipedia synonyms (redirects) for a Wikipedia article.
 *
 * @param {string} article The Wikipedia article in the format "language:Article_Title" ("de:Berlin") to get synonyms for.
 * @param {string=} opt_namespaces Only include pages in these namespaces (optional).
 * @return {Array<string>} The list of synonyms.
 * @customfunction
 */
function WIKISYNONYMS(article, opt_namespaces) {
  'use strict';
  if (!article) {
    return '';
  }
  var results = [];
  try {
    var language;
    var title;
    if (article.indexOf(':') !== -1) {
      language = article.split(/:(.+)?/)[0];
      title = article.split(/:(.+)?/)[1];
    } else {
      language = DEFAULT_LANGUAGE;
      title = article;
    }
    if (!title) {
      return '';
    }
    var url = 'https://' + language + '.wikipedia.org/w/api.php' +
        '?action=query' +
        '&blnamespace=' + (opt_namespaces ?
            encodeURIComponent(opt_namespaces) : '0') +
        '&list=backlinks' +
        '&blfilterredir=redirects' +
        '&bllimit=max' +
        '&format=xml' +
        '&bltitle=' + encodeURIComponent(title.replace(/\s/g, '_'));
    var xml = UrlFetchApp.fetch(url, HEADERS).getContentText();
    var document = XmlService.parse(xml);
    var entries = document.getRootElement().getChild('query')
        .getChild('backlinks').getChildren('bl');
    for (var i = 0; i < entries.length; i++) {
      var text = entries[i].getAttribute('title').getValue();
      results[i] = text;
    }
  } catch (e) {
    // no-op
  }
  return results.length > 0 ? results : '';
}

/**
 * Returns Wikipedia articles around a Wikipedia article or around a point.
 *
 * @param {string} articleOrPoint The Wikipedia article in the format "language:Article_Title" ("de:Berlin") or the point in the format "language:Latitude,Longitude" ("en:37.786971,-122.399677") to get articles around for.
 * @param {number} radius The search radius in meters.
 * @param {boolean=} opt_includeDistance Whether to include the distance in the output, defaults to false (optional).
 * @param {string=} opt_namespaces Only include pages in these namespaces (optional).
 * @return {Array<string>} The list of articles around the given article or point.
 * @customfunction
 */
function WIKIARTICLESAROUND(articleOrPoint, radius, opt_includeDistance,
    opt_namespaces) {
  'use strict';
  if (!articleOrPoint) {
    return '';
  }
  var results = [];
  try {
    var language;
    var rest;
    var title;
    var latitude;
    var longitude;
    if (articleOrPoint.indexOf(':') !== -1) {
      language = articleOrPoint.split(/:(.+)?/)[0];
      rest = articleOrPoint.split(/:(.+)?/)[1];
      title = false;
      latitude = false;
      longitude = false;
      if (/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/.test(rest)) {
        latitude = rest.split(',')[0];
        longitude = rest.split(',')[1];
      } else {
        title = rest;
      }
    } else {
      language = DEFAULT_LANGUAGE;
      rest = articleOrPoint;
      title = false;
      latitude = false;
      longitude = false;
      if (/^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/.test(rest)) {
        latitude = rest.split(',')[0];
        longitude = rest.split(',')[1];
      } else {
        title = rest;
      }
    }
    if ((!title) && !(latitude && longitude)) {
      return;
    }
    var url = 'https://' + language + '.wikipedia.org/w/api.php';
    if (title) {
      url += '?action=query' +
          '&list=geosearch' +
          '&format=xml' +
          '&gslimit=max' +
          '&gsradius=' + radius +
          '&gspage=' + encodeURIComponent(title.replace(/\s/g, '_'));
    } else {
      url += '?action=query' +
          '&list=geosearch' +
          '&format=xml&gslimit=max' +
          '&gsradius=' + radius +
          '&gscoord=' + latitude + '%7C' + longitude;
    }
    url += '&gsnamespace=' + (opt_namespaces ?
        encodeURIComponent(opt_namespaces) : '0');
    var xml = UrlFetchApp.fetch(url, HEADERS).getContentText();
    var document = XmlService.parse(xml);
    var entries = document.getRootElement().getChild('query')
        .getChild('geosearch').getChildren('gs');
    for (var i = 0; i < entries.length; i++) {
      var title = entries[i].getAttribute('title').getValue();
      var lat = entries[i].getAttribute('lat').getValue();
      var lon = entries[i].getAttribute('lon').getValue();
      if (opt_includeDistance) {
        var dist = entries[i].getAttribute('dist').getValue();
        results[i] = [title, lat, lon, dist];
      } else {
        results[i] = [title, lat, lon];
      }
    }
  } catch (e) {
    // no-op
  }
  return results.length > 0 ? results : '';
}

/**
 * Returns Wikipedia translations (language links) for a Wikipedia article.
 *
 * @param {string} article The Wikipedia article in the format "language:Article_Title" ("de:Berlin") to get translations for.
 * @param {Array<string>=} opt_targetLanguages The list of languages to limit the results to (optional).
 * @param {boolean=} opt_returnAsObject Whether to return the results as an object, defaults to false (optional).
 * @param {boolean=} opt_skipHeader Whether to skip the header, defaults to false (optional).
 * @return {Array<string>} The list of translations.
 * @customfunction
 */
function WIKITRANSLATE(article, opt_targetLanguages, opt_returnAsObject,
    opt_skipHeader) {
  'use strict';
  if (!article) {
    return '';
  }
  var results = {};
  opt_targetLanguages = opt_targetLanguages || [];
  opt_targetLanguages = Array.isArray(opt_targetLanguages) ?
      opt_targetLanguages : [opt_targetLanguages];
  var temp = {};
  opt_targetLanguages.forEach(function(lang) {
    temp[lang] = true;
  });
  opt_targetLanguages = Object.keys(temp);
  try {
    var language;
    var title;
    if (article.indexOf(':') !== -1) {
      language = article.split(/:(.+)?/)[0];
      title = article.split(/:(.+)?/)[1];
    } else {
      language = DEFAULT_LANGUAGE;
      title = article;
    }
    if (!title) {
      return '';
    }
    opt_targetLanguages.forEach(function(targetLanguage) {
      if (targetLanguage) {
        results[targetLanguage] = title.replace(/_/g, ' ');
      }
    });
    var url = 'https://' + language + '.wikipedia.org/w/api.php' +
        '?action=query' +
        '&prop=langlinks' +
        '&format=xml' +
        '&lllimit=max' +
        '&titles=' + encodeURIComponent(title.replace(/\s/g, '_'));
    var xml = UrlFetchApp.fetch(url, HEADERS).getContentText();
    var document = XmlService.parse(xml);
    var entries = document.getRootElement().getChild('query').getChild('pages')
        .getChild('page').getChild('langlinks').getChildren('ll');
    var targetLanguagesSet = opt_targetLanguages.length > 0;
    for (var i = 0; i < entries.length; i++) {
      var text = entries[i].getText();
      var lang = entries[i].getAttribute('lang').getValue();
      if ((targetLanguagesSet) && (opt_targetLanguages.indexOf(lang) === -1)) {
        continue;
      }
      results[lang] = text;
    }
    title = title.replace(/_/g, ' ');
    results[language] = title;
  } catch (e) {
    // no-op
  }
  if (opt_returnAsObject) {
    return results;
  }
  var arrayResults = [];
  for (var lang in results) {
    if (opt_skipHeader) {
      arrayResults.push(results[lang]);
    } else {
      arrayResults.push([lang, results[lang]]);
    }
  }
  return arrayResults.length > 0 ? arrayResults : '';
}

/**
 * Returns Wikipedia translations (language links) and synonyms (redirects) for a Wikipedia article.
 *
 * @param {string} article The Wikipedia article in the format "language:Article_Title" ("de:Berlin") to get translations and synonyms for.
 * @param {Array<string>=} opt_targetLanguages The list of languages to limit the results to (optional).
 * @param {boolean=} opt_returnAsObject Whether to return the results as an object, defaults to false (optional).
 * @return {Array<string>} The list of translations and synonyms.
 * @customfunction
 */
function WIKIEXPAND(article, opt_targetLanguages, opt_returnAsObject) {
  'use strict';
  if (!article) {
    return '';
  }
  var results = opt_returnAsObject ? {} : [];
  try {
    var language;
    var title;
    if (article.indexOf(':') !== -1) {
      language = article.split(/:(.+)?/)[0];
      title = article.split(/:(.+)?/)[1];
    } else {
      language = DEFAULT_LANGUAGE;
      title = article;
    }
    if (!title) {
      return '';
    }
    opt_targetLanguages = opt_targetLanguages || [];
    opt_targetLanguages = Array.isArray(opt_targetLanguages) ?
        opt_targetLanguages : [opt_targetLanguages];
    var temp = {};
    opt_targetLanguages.forEach(function(lang) {
      temp[lang] = true;
    });
    opt_targetLanguages = Object.keys(temp);
    var translations = WIKITRANSLATE(article, opt_targetLanguages, true);
    var i = 0;
    for (var lang in translations) {
      var synonyms = WIKISYNONYMS(lang + ':' + translations[lang]);
      if (opt_returnAsObject) {
        results[lang] = [translations[lang]].concat(synonyms);
      } else {
        results[i] = [lang].concat(([translations[lang]].concat(synonyms)));
      }
      i++;
    }
  } catch (e) {
    // no-op
  }
  return opt_returnAsObject ? results : results;
}

/**
 * Returns the Wikimedia Commons link for a file.
 *
 * @param {string} fileName The Wikimedia Commons file name in the format "language:File_Name" ("en:Flag of Berlin.svg") to get the link for.
 * @return {string} The link of the Wikimedia Commons file.
 * @customfunction
 */
function WIKICOMMONSLINK(fileName) {
  'use strict';
  if (!fileName) {
    return '';
  }
  var results = [];
  try {
    var language;
    var title;
    if (fileName.indexOf(':') !== -1) {
      language = fileName.split(/:(.+)?/)[0];
      title = fileName.split(/:(.+)?/)[1];
    } else {
      language = DEFAULT_LANGUAGE;
      title = fileName;
    }
    if (!title) {
      return '';
    }
    var url = 'https://' + language + '.wikipedia.org/w/api.php' +
        '?action=query' +
        '&prop=imageinfo' +
        '&iiprop=url' +
        '&format=xml' +
        '&titles=File:' + encodeURIComponent(title.replace(/\s/g, '_'));
    var xml = UrlFetchApp.fetch(url, HEADERS).getContentText();
    var document = XmlService.parse(xml);
    var entry = document.getRootElement().getChild('query').getChild('pages')
        .getChild('page').getChild('imageinfo').getChild('ii');
    var fileUrl = entry.getAttribute('url').getValue();
    results[0] = fileUrl;
  } catch (e) {
    // no-op
  }
  return results.length > 0 ? results : '';
}

/**
 * Returns Wikipedia category members for a Wikipedia category.
 *
 * @param {string} category The Wikipedia category in the format "language:Category_Title" ("en:Category:Visitor_attractions_in_Berlin") to get members for.
 * @param {string=} opt_namespaces Only include pages in these namespaces (optional).
 * @return {Array<string>} The list of category members.
 * @customfunction
 */
function WIKICATEGORYMEMBERS(category, opt_namespaces) {
  'use strict';
  if (!category) {
    return '';
  }
  var results = [];
  try {
    var language;
    var title;
    if (category.indexOf(':') !== -1) {
      language = category.split(/:(.+)?/)[0];
      title = category.split(/:(.+)?/)[1];
    } else {
      language = DEFAULT_LANGUAGE;
      title = category;
    }
    if (!title) {
      return '';
    }
    var url = 'https://' + language + '.wikipedia.org/w/api.php' +
        '?action=query' +
        '&list=categorymembers' +
        '&cmlimit=max' +
        '&cmprop=title' +
        '&cmtype=subcat%7Cpage' +
        '&format=xml' +
        '&cmnamespace=' + (opt_namespaces ?
            encodeURIComponent(opt_namespaces) : '0') +
        '&cmtitle=' + encodeURIComponent(title.replace(/\s/g, '_'));
    var xml = UrlFetchApp.fetch(url, HEADERS).getContentText();
    var document = XmlService.parse(xml);
    var entries = document.getRootElement().getChild('query')
        .getChild('categorymembers').getChildren('cm');
    for (var i = 0; i < entries.length; i++) {
      var text = entries[i].getAttribute('title').getValue();
      results[i] = text;
    }
  } catch (e) {
    // no-op
  }
  return results.length > 0 ? results : '';
}

/**
 * Returns Wikipedia subcategories for a Wikipedia category.
 *
 * @param {string} category The Wikipedia category in the format "language:Category_Title" ("en:Category:Visitor_attractions_in_Berlin") to get subcategories for.
 * @param {string=} opt_namespaces Only include pages in these namespaces (optional).
 * @return {Array<string>} The list of subcategories.
 * @customfunction
 */
function WIKISUBCATEGORIES(category, opt_namespaces) {
  'use strict';
  if (!category) {
    return '';
  }
  var results = [];
  try {
    var language;
    var title;
    if (category.indexOf(':') !== -1) {
      language = category.split(/:(.+)?/)[0];
      title = category.split(/:(.+)?/)[1];
    } else {
      language = DEFAULT_LANGUAGE;
      title = category;
    }
    if (!title) {
      return '';
    }
    var url = 'https://' + language + '.wikipedia.org/w/api.php' +
        '?action=query' +
        '&list=categorymembers' +
        '&cmlimit=max' +
        '&cmprop=title' +
        '&cmtype=subcat%7Cpage' +
        '&format=xml' +
        '&cmnamespace=' + (opt_namespaces ?
            encodeURIComponent(opt_namespaces) : '14') +
        '&cmtitle=' + encodeURIComponent(title.replace(/\s/g, '_'));
    var xml = UrlFetchApp.fetch(url, HEADERS).getContentText();
    var document = XmlService.parse(xml);
    var entries = document.getRootElement().getChild('query')
        .getChild('categorymembers').getChildren('cm');
    for (var i = 0; i < entries.length; i++) {
      var text = entries[i].getAttribute('title').getValue();
      results[i] = text;
    }
  } catch (e) {
    // no-op
  }
  return results.length > 0 ? results : '';
}

/**
 * Returns Wikipedia categories for a Wikipedia article.
 *
 * @param {string} article The Wikipedia article in the format "language:Article_Title" ("en:Berlin") to get categories for.
 * @return {Array<string>} The list of categories.
 * @customfunction
 */
function WIKICATEGORIES(article) {
  'use strict';
  if (!article) {
    return '';
  }
  var results = [];
  try {
    var language;
    var title;
    if (article.indexOf(':') !== -1) {
      language = article.split(/:(.+)?/)[0];
      title = article.split(/:(.+)?/)[1];
    } else {
      language = DEFAULT_LANGUAGE;
      title = article;
    }
    if (!title) {
      return '';
    }
    var url = 'https://' + language + '.wikipedia.org/w/api.php' +
        '?action=query' +
        '&prop=categories' +
        '&format=xml' +
        '&cllimit=max' +
        '&titles=' + encodeURIComponent(title.replace(/\s/g, '_'));
    var xml = UrlFetchApp.fetch(url, HEADERS).getContentText();
    var document = XmlService.parse(xml);
    var entries = document.getRootElement().getChild('query').getChild('pages')
        .getChild('page').getChild('categories').getChildren('cl');
    for (var i = 0; i < entries.length; i++) {
      var text = entries[i].getAttribute('title').getValue();
      results[i] = text;
    }
  } catch (e) {
    // no-op
  }
  return results.length > 0 ? results : '';
}

/**
 * Returns Wikipedia inbound links for a Wikipedia article.
 *
 * @param {string} article The Wikipedia article in the format "language:Article_Title" ("de:Berlin") to get inbound links for.
 * @param {string=} opt_namespaces Only include pages in these namespaces (optional).
 * @return {Array<string>} The list of inbound links.
 * @customfunction
 */
function WIKIINBOUNDLINKS(article, opt_namespaces) {
  'use strict';
  if (!article) {
    return '';
  }
  var results = [];
  try {
    var language;
    var title;
    if (article.indexOf(':') !== -1) {
      language = article.split(/:(.+)?/)[0];
      title = article.split(/:(.+)?/)[1];
    } else {
      language = DEFAULT_LANGUAGE;
      title = article;
    }
    if (!title) {
      return '';
    }
    var url = 'https://' + language + '.wikipedia.org/w/api.php' +
        '?action=query' +
        '&list=backlinks' +
        '&bllimit=max' +
        '&blnamespace=' + (opt_namespaces ?
            encodeURIComponent(opt_namespaces) : '0') +
        '&format=xml' +
        '&bltitle=' + encodeURIComponent(title.replace(/\s/g, '_'));
    var xml = UrlFetchApp.fetch(url, HEADERS).getContentText();
    var document = XmlService.parse(xml);
    var entries = document.getRootElement().getChild('query')
        .getChild('backlinks').getChildren('bl');
    for (var i = 0; i < entries.length; i++) {
      var text = entries[i].getAttribute('title').getValue();
      results[i] = text;
    }
  } catch (e) {
    // no-op
  }
  return results.length > 0 ? results : '';
}

/**
 * Returns Wikipedia outbound links for a Wikipedia article.
 *
 * @param {string} article The Wikipedia article in the format "language:Article_Title" ("de:Berlin") to get outbound links for.
 * @param {string=} opt_namespaces Only include pages in these namespaces (optional).
 * @return {Array<string>} The list of outbound links.
 * @customfunction
 */
function WIKIOUTBOUNDLINKS(article, opt_namespaces) {
  'use strict';
  if (!article) {
    return '';
  }
  var results = [];
  try {
    var language;
    var title;
    if (article.indexOf(':') !== -1) {
      language = article.split(/:(.+)?/)[0];
      title = article.split(/:(.+)?/)[1];
    } else {
      language = DEFAULT_LANGUAGE;
      title = article;
    }
    if (!title) {
      return '';
    }
    var url = 'https://' + language + '.wikipedia.org/w/api.php' +
        '?action=query' +
        '&prop=links' +
        '&plnamespace=' + (opt_namespaces ?
            encodeURIComponent(opt_namespaces) : '0') +
        '&format=xml' +
        '&pllimit=max' +
        '&titles=' + encodeURIComponent(title.replace(/\s/g, '_'));
    var xml = UrlFetchApp.fetch(url, HEADERS).getContentText();
    var document = XmlService.parse(xml);
    var entries = document.getRootElement().getChild('query').getChild('pages')
        .getChild('page').getChild('links').getChildren('pl');
    for (var i = 0; i < entries.length; i++) {
      var text = entries[i].getAttribute('title').getValue();
      results[i] = text;
    }
  } catch (e) {
    // no-op
  }
  return results.length > 0 ? results : '';
}

/**
 * Returns Wikipedia mutual links, i.e, the intersection of inbound and outbound links for a Wikipedia article.
 *
 * @param {string} article The Wikipedia article in the format "language:Article_Title" ("de:Berlin") to get mutual links for.
 * @param {string=} opt_namespaces Only include pages in these namespaces (optional).
 * @return {Array<string>} The list of mutual links.
 * @customfunction
 */
function WIKIMUTUALLINKS(article, opt_namespaces) {
  'use strict';
  var inboundLinks = WIKIINBOUNDLINKS(article, opt_namespaces);
  var outboundLinks = WIKIOUTBOUNDLINKS(article, opt_namespaces);
  var mutualLinks = inboundLinks.filter(function(link) {
    return outboundLinks.indexOf(link) > -1;
  });
  return mutualLinks;
}

/**
 * Returns Wikipedia geocoordinates for a Wikipedia article.
 *
 * @param {string} article The Wikipedia article in the format "language:Article_Title" ("de:Berlin") to get geocoordinates for.
 * @return {Array<number>} The latitude and longitude.
 * @customfunction
 */
function WIKIGEOCOORDINATES(article) {
  'use strict';
  if (!article) {
    return '';
  }
  var results = [];
  try {
    var language;
    var title;
    if (article.indexOf(':') !== -1) {
      language = article.split(/:(.+)?/)[0];
      title = article.split(/:(.+)?/)[1];
    } else {
      language = DEFAULT_LANGUAGE;
      title = article;
    }
    if (!title) {
      return '';
    }
    var url = 'https://en.wikipedia.org/w/api.php' +
        '?action=query' +
        '&prop=coordinates' +
        '&format=xml' +
        '&colimit=max' +
        '&coprimary=primary' +
        '&titles=' + encodeURIComponent(title.replace(/\s/g, '_'));
    var xml = UrlFetchApp.fetch(url, HEADERS).getContentText();
    var document = XmlService.parse(xml);
    var coordinates = document.getRootElement().getChild('query')
        .getChild('pages').getChild('page').getChild('coordinates')
        .getChild('co');
    var latitude = coordinates.getAttribute('lat').getValue();
    var longitude = coordinates.getAttribute('lon').getValue();
    results = [[latitude, longitude]];
  } catch (e) {
    // no-op
  }
  return results.length > 0 ? results : '';
}

/**
 * Returns Wikidata facts for a Wikipedia article.
 *
 * @param {string} article The Wikipedia article in the format "language:Article_Title" ("de:Berlin") to get Wikidata facts for.
 * @param {string=} opt_multiObjectMode Whether to return all object values (pass "all") or just the first (pass "first") when there are more than one object values (optional).
 * @return {Array<string>} The list of Wikidata facts.
 * @customfunction
 */
function WIKIDATAFACTS(article, opt_multiObjectMode) {
  'use strict';

  var simplifyClaims = function(claims) {
    var simpleClaims = {};
    for (var id in claims) {
      var claim = claims[id];
      simpleClaims[id] = simpifyClaim(claim);
    }
    return simpleClaims;
  };

  var simpifyClaim = function(claim) {
    var simplifiedClaim = [];
    var len = claim.length;
    for (var i = 0; i < len; i++) {
      var statement = claim[i];
      var simpifiedStatement = simpifyStatement(statement);
      if (simpifiedStatement !== null) {
        simplifiedClaim.push(simpifiedStatement);
      }
    }
    return simplifiedClaim;
  };

  var simpifyStatement = function(statement) {
    var mainsnak = statement.mainsnak;
    if (mainsnak === null) {
      return null;
    }
    var datatype = mainsnak.datatype;
    var datavalue = mainsnak.datavalue;
    if (datavalue === null || datavalue === undefined) {
      return null;
    }
    switch (datatype) {
      case 'string':
      case 'commonsMedia':
      case 'url':
      case 'math':
      case 'external-id':
        return datavalue.value;
      case 'monolingualtext':
        return datavalue.value.text;
      case 'wikibase-item':
        var qid = 'Q' + datavalue.value['numeric-id'];
        qids.push(qid);
        return qid;
      case 'time':
        return datavalue.value.time;
      case 'quantity':
        return datavalue.value.amount;
      default:
        return null;
    }
  };

  var getPropertyAndEntityLabels = function(propertiesAndEntities) {
    var labels = {};
    try {
      var size = 50;
      var j = propertiesAndEntities.length;
      for (var i = 0; i < j; i += size) {
        var chunk = propertiesAndEntities.slice(i, i + size);
        var url = 'https://www.wikidata.org/w/api.php' +
            '?action=wbgetentities' +
            '&languages=en' +
            '&format=json' +
            '&props=labels' +
            '&ids=' + chunk.join('%7C');
        var json = JSON.parse(UrlFetchApp.fetch(url, HEADERS).getContentText());
        var entities = json.entities;
        chunk.forEach(function(item) {
          if ((entities[item]) &&
              (entities[item].labels) &&
              (entities[item].labels.en) &&
              (entities[item].labels.en.value)) {
            labels[item] = entities[item].labels.en.value;
          } else {
            labels[item] = false;
          }
        });
      }
    } catch (e) {
      // no-op
    }
    return labels;
  };

  if (!article) {
    return '';
  }
  var results = [];
  try {
    var language;
    var title;
    if (article.indexOf(':') !== -1) {
      language = article.split(/:(.+)?/)[0];
      title = article.split(/:(.+)?/)[1];
    } else {
      language = DEFAULT_LANGUAGE;
      title = article;
    }
    if (!title) {
      return '';
    }
    var url = 'https://wikidata.org/w/api.php' +
        '?action=wbgetentities' +
        '&sites=' + language + 'wiki' +
        '&format=json' +
        '&props=claims' +
        '&titles=' + encodeURIComponent(title.replace(/\s/g, '_'));
    var json = JSON.parse(UrlFetchApp.fetch(url, HEADERS).getContentText());
    var entity = Object.keys(json.entities)[0];
    var qids = [];
    var simplifiedClaims = simplifyClaims(json.entities[entity].claims);
    var properties = Object.keys(simplifiedClaims);
    var labels = getPropertyAndEntityLabels(properties.concat(qids));
    for (var claim in simplifiedClaims) {
      var claims = simplifiedClaims[claim].filter(function(value) {
        return value !== null;
      });
      // Only return single-object facts
      if (claims.length === 1) {
        var label = labels[claim];
        var value = /^Q\d+$/.test(claims[0]) ? labels[claims[0]] : claims[0];
        if (label && value) {
          results.push([label, value]);
        }
      }
      // Optionally return multi-object facts
      if ((
            (/^first$/i.test(opt_multiObjectMode)) ||
            (/^all$/i.test(opt_multiObjectMode))
          ) && (claims.length > 1)) {
        var label = labels[claim];
        claims.forEach(function(claimObject, i) {
          if (i > 0 && /^first$/i.test(opt_multiObjectMode)) {
            return;
          }
          var value = /^Q\d+$/.test(claimObject) ?
              labels[claimObject] : claimObject;
          if (label && value) {
            results.push([label, value]);
          }
        });
      }
    }
  } catch (e) {
    // no-op
  }
  return results.length > 0 ? results : '';
}

/**
 * Returns Wikipedia pageviews statistics for a Wikipedia article.
 *
 * @param {string} article The Wikipedia article in the format "language:Article_Title" ("de:Berlin") to get pageviews statistics for.
 * @param {string=} opt_start The start date in the format "YYYYMMDD" ("2007-06-08") since when pageviews statistics should be retrieved from (optional).
 * @param {string=} opt_end The end date in the format "YYYYMMDD" ("2007-06-08") until when pageviews statistics should be retrieved to (optional).
 * @param {boolean=} opt_sumOnly Whether to only return the sum of all pageviews in the requested period (optional).
 * @return {Array<number>} The list of pageviews between start and end per day.
 * @customfunction
 */
function WIKIPAGEVIEWS(article, opt_start, opt_end, opt_sumOnly) {
  'use strict';

  var getIsoDate = function(date) {
    var date = new Date(date);
    var year = date.getFullYear();
    var month = (date.getMonth() + 1) < 10 ?
        '0' + (date.getMonth() + 1) :
        (date.getMonth() + 1).toString();
    var day = date.getDate() < 10 ?
        '0' + date.getDate() :
        date.getDate().toString();
    return year + month + day;
  };

  if (!article) {
    return '';
  }
  var results = [];
  var sum = 0;
  try {
    var language;
    var title;
    if (article.indexOf(':') !== -1) {
      language = article.split(/:(.+)?/)[0];
      title = article.split(/:(.+)?/)[1];
    } else {
      language = DEFAULT_LANGUAGE;
      title = article;
    }
    if (!title) {
      return '';
    }
    opt_start = opt_start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    if (typeof opt_start === 'object') {
      opt_start = getIsoDate(opt_start);
    }
    opt_end = opt_end || new Date(Date.now() - 1 * 24 * 60 * 60 * 1000);
    if (typeof opt_end === 'object') {
      opt_end = getIsoDate(opt_end);
    }
    var url = 'https://wikimedia.org/api/rest_v1/metrics/pageviews/' +
        'per-article' +
        '/' + language + '.wikipedia' +
        '/all-access' +
        '/user' +
        '/' +  encodeURIComponent(title.replace(/\s/g, '_')) +
        '/daily' +
        '/' + opt_start +
        '/' + opt_end;
    var json = JSON.parse(UrlFetchApp.fetch(url, HEADERS).getContentText());
    json.items.forEach(function(item) {
      if (opt_sumOnly) {
        sum += item.views;
      } else {
        var timestamp = item.timestamp
            .replace(/^(\d{4})(\d{2})(\d{2})(\d{2})$/, '$1-$2-$3-$4').split('-');
        timestamp = new Date(Date.UTC(
            parseInt(timestamp[0], 10), // Year
            parseInt(timestamp[1], 10) - 1, // Month
            parseInt(timestamp[2], 10), // Day
            parseInt(timestamp[3], 10), // Hour
            0, // Minute
            0)); // Second))
        results.push([
          timestamp,
          item.views
        ]);
      }
    });
  } catch (e) {
    // no-op
  }
  if (opt_sumOnly) {
    return sum;
  } else {
    results.reverse(); // Order from new to old
    return results.length > 0 ? results : '';
  }
}

/**
 * Returns Wikipedia pageedits statistics for a Wikipedia article.
 *
 * @param {string} article The Wikipedia article in the format "language:Article_Title" ("de:Berlin") to get pageedits statistics for.
 * @param {string=} opt_start The start date in the format "YYYYMMDD" ("2007-06-08") since when pageedits statistics should be retrieved from (optional).
 * @param {string=} opt_end The end date in the format "YYYYMMDD" ("2007-06-08") until when pageedits statistics should be retrieved to (optional).
 * @return {Array<number>} The list of pageedits between start and end and their deltas.
 * @customfunction
 */
function WIKIPAGEEDITS(article, opt_start, opt_end) {
  'use strict';

  var getIsoDate = function(date, time) {
    var date = new Date(date);
    var year = date.getFullYear();
    var month = (date.getMonth() + 1) < 10 ?
        '0' + (date.getMonth() + 1) :
        (date.getMonth() + 1).toString();
    var day = date.getDate() < 10 ?
        '0' + date.getDate() :
        date.getDate().toString();
    return year + '-' + month + '-' + day + time;
  };

  if (!article) {
    return '';
  }
  var results = [];
  try {
    var language;
    var title;
    if (article.indexOf(':') !== -1) {
      language = article.split(/:(.+)?/)[0];
      title = article.split(/:(.+)?/)[1];
    } else {
      language = DEFAULT_LANGUAGE;
      title = article;
    }
    if (!title) {
      return '';
    }
    opt_start = opt_start || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    if (typeof opt_start === 'object') {
      opt_start = getIsoDate(opt_start, 'T00:00:00');
    }
    opt_end = opt_end || new Date();
    if (typeof opt_end === 'object') {
      opt_end = getIsoDate(opt_end, 'T23:59:59');
    }
    var url = 'https://en.wikipedia.org/w/api.php' +
        '?action=query' +
        '&prop=revisions' +
        '&rvprop=size%7Ctimestamp' +
        '&rvlimit=max' +
        '&format=xml' +
        '&rvstart=' + opt_end + // Reversed on purpose due to confusing API name
        '&rvend=' + opt_start + // Reversed on purpose due to confusing API name
        '&titles=' + encodeURIComponent(title.replace(/\s/g, '_'));
    var xml = UrlFetchApp.fetch(url, HEADERS).getContentText();
    var document = XmlService.parse(xml);
    var entries = document.getRootElement().getChild('query').getChild('pages')
        .getChild('page').getChild('revisions').getChildren('rev');
    for (var i = 0; i < entries.length - 1; i++) {
      var timestamp = entries[i].getAttribute('timestamp').getValue().replace(
          /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})Z$/,
          '$1-$2-$3-$4-$5-$6').split('-');
      timestamp = new Date(Date.UTC(
          parseInt(timestamp[0], 10), // Year
          parseInt(timestamp[1], 10) - 1, // Month
          parseInt(timestamp[2], 10), // Day
          parseInt(timestamp[3], 10), // Hour
          parseInt(timestamp[4], 10), // Minute
          parseInt(timestamp[5], 10))); // Second
      var delta = entries[i].getAttribute('size').getValue() -
          entries[i + 1].getAttribute('size').getValue();
      results.push([
        timestamp,
        delta
      ]);
    }
  } catch (e) {
    // no-op
  }
  return results.length > 0 ? results : '';
}

/**
 * Returns Wikipedia article results for a query.
 *
 * @param {string} query The query in the format "language:Query" ("de:Berlin") to get search results for.
 * @param {boolean=} opt_didYouMean Whether to return a "did you mean" suggestion, defaults to false (optional).
 * @param {string=} opt_namespaces Only include pages in these namespaces (optional).
 * @return {Array<string>} The list of article results.
 * @customfunction
 */
function WIKISEARCH(query, opt_didYouMean, opt_namespaces) {
  'use strict';
  if (!query) {
    return '';
  }
  var results = [];
  try {
    var language;
    var title;
    if (query.indexOf(':') !== -1) {
      language = query.split(/:(.+)?/)[0];
      title = query.split(/:(.+)?/)[1];
    } else {
      language = DEFAULT_LANGUAGE;
      title = query;
    }
    if (!title) {
      return '';
    }
    var url = 'https://' + language + '.wikipedia.org/w/api.php' +
        '?action=query' +
        '&format=json' +
        '&list=search' +
        '&srinfo=suggestion' +
        '&srprop=' + // Empty on purpose
        '&srlimit=max' +
        '&srsearch=' + encodeURIComponent(title) +
        '&srnamespace=' + (opt_namespaces ?
            encodeURIComponent(opt_namespaces) : '0');
    var json = JSON.parse(UrlFetchApp.fetch(url, HEADERS).getContentText());
    json.query.search.forEach(function(result, i) {
      result = result.title;
      if (opt_didYouMean) {
        if (i === 0) {
          results[i] = [
            result,
            json.query.searchinfo ? json.query.searchinfo.suggestion : title
          ];
        } else {
          results[i] = [result, ''];
        }
      } else {
        results[i] = result;
      }
    });
  } catch (e) {
    // no-op
  }
  return results.length > 0 ? results : '';
}

/**
 * Returns the Wikidata qid of the corresponding Wikidata item for an article.
 *
 * @param {string} article The article in the format "language:Query" ("de:Berlin") to get the Wikidata qid for.
 * @return {string} The Wikidata qid.
 * @customfunction
 */
function WIKIDATAQID(article) {
  'use strict';
  if (!article) {
    return '';
  }
  var results = [];
  try {
    var language;
    var title;
    if (article.indexOf(':') !== -1) {
      language = article.split(/:(.+)?/)[0];
      title = article.split(/:(.+)?/)[1];
    } else {
      language = DEFAULT_LANGUAGE;
      title = article;
    }
    if (!title) {
      return '';
    }
    var url = 'https://www.wikidata.org/w/api.php' +
        '?action=wbgetentities' +
        '&sites=' + language + 'wiki' +
        '&format=json' +
        '&props=' + // Empty on purpose
        '&titles=' + encodeURIComponent(title);
    var json = JSON.parse(UrlFetchApp.fetch(url, HEADERS).getContentText());
    results[0] = Object.keys(json.entities)[0];
  } catch (e) {
    // no-op
  }
  return results.length > 0 ? results : '';
}

/**
 * Returns the output of the Quarry (https://meta.wikimedia.org/wiki/Research:Quarry) query with the specified query ID.
 *
 * @param {number} queryId The query ID of the Quarry query to run.
 * @return {Array<string>} The list of query results, the first line represents the header.
 * @customfunction
 */
function WIKIQUARRY(queryId) {
  'use strict';
  if (!queryId) {
    return '';
  }
  var results = [];
  try {
    var url = 'http://quarry.wmflabs.org/query/' + queryId +
        '/result/latest/0/json';
    var json = JSON.parse(UrlFetchApp.fetch(url, HEADERS).getContentText());
    results[0] = json.headers;
    results = results.concat(json.rows);
  } catch (e) {
    // no-op
  }
  return results.length > 0 ? results : '';
}

/**
 * Returns Google Suggest results for the given keyword.
 *
 * @param {string} query The query in the format "language:Query" ("de:Berlin") to get suggestions for.
 * @return {Array<string>} The list of suggestions.
 * @customfunction
 */
function GOOGLESUGGEST(query) {
  'use strict';
  if (!keyword) {
    return '';
  }
  var results = [];
  try {
    var language;
    var title;
    if (query.indexOf(':') !== -1) {
      language = query.split(/:(.+)?/)[0];
      title = query.split(/:(.+)?/)[1];
    } else {
      language = DEFAULT_LANGUAGE;
      title = query;
    }
    if (!title) {
      return '';
    }
    var url = 'https://suggestqueries.google.com/complete/search' +
        '?output=toolbar' +
        '&hl=' + language +
        '&q=' + encodeURIComponent(title);
    var xml = UrlFetchApp.fetch(url, HEADERS).getContentText();
    var document = XmlService.parse(xml);
    var entries = document.getRootElement().getChildren('CompleteSuggestion');
    for (var i = 0; i < entries.length; i++) {
      var text = entries[i].getChild('suggestion').getAttribute('data')
          .getValue();
      results[i] = text;
    }
  } catch (e) {
    // no-op
  }
  return results.length > 0 ? results : '';
}

/**
 * Executed on add-on install.
 */
function onInstall() {
  'use strict';
  onOpen();
}

/**
 * Executed on add-on open.
 */
function onOpen() {
  'use strict';
  SpreadsheetApp.getUi().createAddonMenu()
      .addItem('Show documentation', 'showDocumentation_')
      .addToUi();
}

/**
 * Shows a sidebar with help.
 */
function showDocumentation_() {
  'use strict';
  var html = HtmlService.createHtmlOutputFromFile('Documentation')
      .setSandboxMode(HtmlService.SandboxMode.IFRAME)
      .setTitle('Documentation')
      .setWidth(300);
  SpreadsheetApp.getUi().showSidebar(html);
}
