/**
 * @license
 * Copyright 2016 Thomas Steiner (@tomayac). All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Returns Wikipedia synonyms (redirects) for a Wikipedia article
 *
 * @param {string} article The Wikipedia article in the format "language:Article_Title" ("de:Berlin") to get synonyms for
 * @return {Array<string>} The list of synonyms
 */
function WIKISYNONYMS(article) {
  if (!article) {
    return '';
  }
  var results = [];
  try {
    var language = article.split(':')[0];
    var title = article.split(':')[1];
    if (!title) {
      return '';
    }
    var url = 'https://' + language + '.wikipedia.org/w/api.php' +
        '?action=query' +
        '&blnamespace=0' +
        '&list=backlinks' +
        '&blfilterredir=redirects' +
        '&bllimit=max' +
        '&format=xml' +
        '&bltitle=' + title.replace(/\s/g, '_');
    var xml = UrlFetchApp.fetch(url).getContentText();
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
 * Returns Wikipedia translations (language links) for a Wikipedia article
 *
 * @param {string} article The Wikipedia article in the format "language:Article_Title" ("de:Berlin") to get translations for
 * @param {Array<string>=} opt_targetLanguages The list of languages to limit the results to (optional)
 * @param {boolean=} opt_returnAsObject Whether to return the results as an object, defaults to false (optional)
 * @param {boolean=} opt_skipHeader Whether to skip the header, defaults to false (optional)
 * @return {Array<string>} The list of translations
 */
function WIKITRANSLATE(article, opt_targetLanguages, opt_returnAsObject,
    opt_skipHeader) {
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
    var language = article.split(':')[0];
    var title = article.split(':')[1];
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
        '&titles=' + title.replace(/\s/g, '_');
    var xml = UrlFetchApp.fetch(url).getContentText();
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
 * Returns Wikipedia translations (language links) and synonyms (redirects) for a Wikipedia article
 *
 * @param {string} article The Wikipedia article in the format "language:Article_Title" ("de:Berlin") to get translations and synonyms for
 * @param {Array<string>=} opt_targetLanguages The list of languages to limit the results to (optional)
 * @param {boolean=} opt_returnAsObject Whether to return the results as an object, defaults to false (optional)
 * @return {Array<string>} The list of translations and synonyms
 */
function WIKIEXPAND(article, opt_targetLanguages, opt_returnAsObject) {
  if (!article) {
    return '';
  }
  var results = opt_returnAsObject ? {} : [];
  try {
    var language = article.split(':')[0];
    var title = article.split(':')[1];
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
 * @license
 * Copyright 2015 Thomas Steiner (@tomayac). All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0

 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Returns Google Suggest results for the given keyword
 *
 * @param {string} keyword The keyword to get suggestions for
 * @param {string=} opt_language The language to get suggestions in, defaults to "en" (optional)
 * @return {Array<string>} The list of suggestions
 */
function GOOGLESUGGEST(keyword, opt_language) {
  if (!keyword) {
    return '';
  }
  opt_language = opt_language || 'en';
  var results = [];
  try {
    var url = 'http://suggestqueries.google.com/complete/search' +
        '?output=toolbar' +
        '&hl=' + opt_language +
        '&q=' + encodeURIComponent(keyword);
    var xml = UrlFetchApp.fetch(url).getContentText();
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
 * Returns Wikipedia synonyms (redirects) for a Wikipedia article
 *
 * @param {string} article The Wikipedia article in the format "language:Article_Title" ("de:Berlin") to get synonyms for
 * @return {Array<string>} The list of synonyms
 */
function WIKISYNONYMS(article) {
  if (!article) {
    return '';
  }
  var results = [];
  try {
    var language = article.split(':')[0];
    var title = article.split(':')[1];
    if (!title) {
      return '';
    }
    var url = 'https://' + language + '.wikipedia.org/w/api.php' +
        '?action=query' +
        '&blnamespace=0' +
        '&list=backlinks' +
        '&blfilterredir=redirects' +
        '&bllimit=max' +
        '&format=xml' +
        '&bltitle=' + title.replace(/\s/g, '_');
    var xml = UrlFetchApp.fetch(url).getContentText();
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
 * Returns Wikipedia translations (language links) for a Wikipedia article
 *
 * @param {string} article The Wikipedia article in the format "language:Article_Title" ("de:Berlin") to get translations for
 * @param {Array<string>=} opt_targetLanguages The list of languages to limit the results to (optional)
 * @param {boolean=} opt_returnAsObject Whether to return the results as an object, defaults to false (optional)
 * @param {boolean=} opt_skipHeader Whether to skip the header, defaults to false (optional)
 * @return {Array<string>} The list of translations
 */
function WIKITRANSLATE(article, opt_targetLanguages, opt_returnAsObject,
    opt_skipHeader) {
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
    var language = article.split(':')[0];
    var title = article.split(':')[1];
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
        '&titles=' + title.replace(/\s/g, '_');
    var xml = UrlFetchApp.fetch(url).getContentText();
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
 * Returns Wikipedia translations (language links) and synonyms (redirects) for a Wikipedia article
 *
 * @param {string} article The Wikipedia article in the format "language:Article_Title" ("de:Berlin") to get translations and synonyms for
 * @param {Array<string>=} opt_targetLanguages The list of languages to limit the results to (optional)
 * @param {boolean=} opt_returnAsObject Whether to return the results as an object, defaults to false (optional)
 * @return {Array<string>} The list of translations and synonyms
 */
function WIKIEXPAND(article, opt_targetLanguages, opt_returnAsObject) {
  if (!article) {
    return '';
  }
  var results = opt_returnAsObject ? {} : [];
  try {
    var language = article.split(':')[0];
    var title = article.split(':')[1];
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
 * Returns Wikipedia category members for a Wikipedia category
 *
 * @param {string} category The Wikipedia category in the format "language:Category_Title" ("en:Category:Visitor_attractions_in_Berlin") to get members for
 * @return {Array<string>} The list of category members
 */
function WIKICATEGORYMEMBERS(category) {
  if (!category) {
    return '';
  }
  var results = [];
  try {
    var language = category.split(':')[0];
    var title = category.split(':')[1] + ':' + category.split(':')[2];
    if (!title) {
      return '';
    }
    var url = 'https://' + language + '.wikipedia.org/w/api.php' +
        '?action=query' +
        '&list=categorymembers' +
        '&cmlimit=max' +
        '&cmprop=title' +
        '&cmtype=subcat%7Cpage' +
        '&format=xml'+
        '&cmnamespace=0' +
        '&cmtitle=' + encodeURIComponent(title.replace(/\s/g, '_'));
    var xml = UrlFetchApp.fetch(url).getContentText();
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
 * Returns Wikipedia subcategories for a Wikipedia category
 *
 * @param {string} category The Wikipedia category in the format "language:Category_Title" ("en:Category:Visitor_attractions_in_Berlin") to get subcategories for
 * @return {Array<string>} The list of subcategories
 */
function WIKISUBCATEGORIES(category) {
  if (!category) {
    return '';
  }
  var results = [];
  try {
    var language = category.split(':')[0];
    var title = category.split(':')[1] + ':' + category.split(':')[2];
    if (!title) {
      return '';
    }
    var url = 'https://' + language + '.wikipedia.org/w/api.php' +
        '?action=query' +
        '&list=categorymembers' +
        '&cmlimit=max' +
        '&cmprop=title' +
        '&cmtype=subcat%7Cpage' +
        '&format=xml'+
        '&cmnamespace=14' +
        '&cmtitle=' + encodeURIComponent(title.replace(/\s/g, '_'));
    var xml = UrlFetchApp.fetch(url).getContentText();
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
 * Returns Google Suggest results for the given keyword
 *
 * @param {string} keyword The keyword to get suggestions for
 * @param {string=} opt_language The language to get suggestions in, defaults to "en" (optional)
 * @return {Array<string>} The list of suggestions
 */
function GOOGLESUGGEST(keyword, opt_language) {
  if (!keyword) {
    return '';
  }
  opt_language = opt_language || 'en';
  var results = [];
  try {
    var url = 'http://suggestqueries.google.com/complete/search' +
        '?output=toolbar' +
        '&hl=' + opt_language +
        '&q=' + encodeURIComponent(keyword);
    var xml = UrlFetchApp.fetch(url).getContentText();
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
