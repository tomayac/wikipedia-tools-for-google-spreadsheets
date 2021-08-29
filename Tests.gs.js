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

/**
 * Runs tests with different input configurations
 */
function _runTests() {
  'use strict';

  var checkResult = function(caller, result) {
    Logger.log(caller + ' ' + (result.length ?
        '✅ OK: ' + JSON.stringify(result) : '❌ Error' + JSON.stringify(result)));
    if (Array.isArray(result)) {
      var pass = result.map(row => row.every(col => col)).every(row => row)
      Logger.log(caller + ' 2D array check ' + (pass ?
          '✅ 2D array OK: ' + JSON.stringify(result) : '❌ 2D array Error' + JSON.stringify(result)));
    }
  };

  var project = 'en.wikipedia';
  var article = 'en:Berlin';
  var qid = 'Q64';
  var articleOrPoint = ['en:Berlin', '52.51666667,13.38333333'];
  var linkPattern = 'en:github.com';
  var query = 'en:Berlin';
  var queryId = 1226;
  var fileName = 'en:Flag of Berlin.svg';
  var category = 'en:Category:Berlin';
  var opt_namespaces = '0|1|2';
  var opt_targetLanguages = ['de', 'fr'];
  var opt_targetLanguage = 'de';
  var opt_includeDistance = true;
  var radius = 1000;
  var opt_multiObjectMode = ['all', 'first'];
  var opt_property = 'P31';
  var opt_properties = ['P31', 'P17'];
  var opt_didYouMean = true;
  var opt_skipHeader = true;
  var opt_sumOnly = true;
  var opt_protocol = 'https';
  var opt_start = new Date(new Date() - 7 * 24 * 60 * 60 * 1000);
  var opt_end = new Date(new Date() - 1 * 24 * 60 * 60 * 1000);
  var opt_date = new Date(new Date() - 1 * 24 * 60 * 60 * 1000);
  var opt_access = 'all-access';
  var opt_accessSite = 'all-sites';
  var opt_agent = 'all-agents';
  var opt_granularity = 'daily';

  checkResult('WIKIQUARRY', WIKIQUARRY(queryId));

  checkResult('WIKICATEGORIES', WIKICATEGORIES(article));
  checkResult('WIKICATEGORIES', WIKICATEGORIES(article.replace('en:', '')));

  checkResult('WIKIGEOCOORDINATES', WIKIGEOCOORDINATES(article));
  checkResult('WIKIGEOCOORDINATES', WIKIGEOCOORDINATES(
      article.replace('en:', '')));

  checkResult('WIKIDATAQID', WIKIDATAQID(article));
  checkResult('WIKIDATAQID', WIKIDATAQID([[article], [article]]));
  checkResult('WIKIDATAQID', WIKIDATAQID(article.replace('en:', '')));

  checkResult('WIKIDATALOOKUP', WIKIDATALOOKUP('P298', 'AUT'));

  checkResult('GOOGLESUGGEST', GOOGLESUGGEST(query));
  checkResult('GOOGLESUGGEST', GOOGLESUGGEST(query.replace('en:', '')));

  checkResult('WIKICOMMONSLINK', WIKICOMMONSLINK(fileName));
  checkResult('WIKICOMMONSLINK', WIKICOMMONSLINK(fileName.replace('en:', '')));

  checkResult('WIKICATEGORYMEMBERS', WIKICATEGORYMEMBERS(category));
  checkResult('WIKICATEGORYMEMBERS', WIKICATEGORYMEMBERS(
      category.replace('en:', '')));
  checkResult('WIKICATEGORYMEMBERS', WIKICATEGORYMEMBERS(category,
      opt_namespaces));
  checkResult('WIKICATEGORYMEMBERS', WIKICATEGORYMEMBERS(
      category.replace('en:', ''), opt_namespaces));

  checkResult('WIKISUBCATEGORIES', WIKISUBCATEGORIES(category));
  checkResult('WIKISUBCATEGORIES', WIKISUBCATEGORIES(
      category.replace('en:', '')));
  checkResult('WIKISUBCATEGORIES', WIKISUBCATEGORIES(category, opt_namespaces));
  checkResult('WIKISUBCATEGORIES', WIKISUBCATEGORIES(
      category.replace('en:', ''), opt_namespaces));

  checkResult('WIKISYNONYMS', WIKISYNONYMS(article));
  checkResult('WIKISYNONYMS', WIKISYNONYMS(article.replace('en:', '')));
  checkResult('WIKISYNONYMS', WIKISYNONYMS(article, opt_namespaces));
  checkResult('WIKISYNONYMS', WIKISYNONYMS(article.replace('en:', ''),
      opt_namespaces));

  checkResult('WIKIINBOUNDLINKS', WIKIINBOUNDLINKS(article));
  checkResult('WIKIINBOUNDLINKS', WIKIINBOUNDLINKS(article.replace('en:', '')));
  checkResult('WIKIINBOUNDLINKS', WIKIINBOUNDLINKS(article, opt_namespaces));
  checkResult('WIKIINBOUNDLINKS', WIKIINBOUNDLINKS(article.replace('en:', ''),
      opt_namespaces));

  checkResult('WIKIOUTBOUNDLINKS', WIKIOUTBOUNDLINKS(article));
  checkResult('WIKIOUTBOUNDLINKS', WIKIOUTBOUNDLINKS(
      article.replace('en:', '')));
  checkResult('WIKIOUTBOUNDLINKS', WIKIOUTBOUNDLINKS(article, opt_namespaces));
  checkResult('WIKIOUTBOUNDLINKS', WIKIOUTBOUNDLINKS(article.replace('en:', ''),
      opt_namespaces));

  checkResult('WIKIMUTUALLINKS', WIKIMUTUALLINKS(article));
  checkResult('WIKIMUTUALLINKS', WIKIMUTUALLINKS(article.replace('en:', '')));
  checkResult('WIKIMUTUALLINKS', WIKIMUTUALLINKS(article, opt_namespaces));
  checkResult('WIKIMUTUALLINKS', WIKIMUTUALLINKS(article.replace('en:', ''),
      opt_namespaces));

  checkResult('WIKILINKSEARCH', WIKILINKSEARCH(linkPattern));
  checkResult('WIKILINKSEARCH', WIKILINKSEARCH(linkPattern.replace('en:', '')));
  checkResult('WIKILINKSEARCH', WIKILINKSEARCH(linkPattern, opt_protocol));
  checkResult('WIKILINKSEARCH', WIKILINKSEARCH(linkPattern.replace('en:', ''),
      opt_protocol));
  checkResult('WIKILINKSEARCH', WIKILINKSEARCH(linkPattern, opt_protocol,
      opt_namespaces));
  checkResult('WIKILINKSEARCH', WIKILINKSEARCH(linkPattern.replace('en:', ''),
      opt_protocol, opt_namespaces));

  checkResult('WIKIEXPAND', WIKIEXPAND(article));
  checkResult('WIKIEXPAND', WIKIEXPAND(article.replace('en:', '')));
  checkResult('WIKIEXPAND', WIKIEXPAND(article, opt_targetLanguages));
  checkResult('WIKIEXPAND', WIKIEXPAND(article.replace('en:', ''),
      opt_targetLanguages));

  checkResult('WIKIARTICLESAROUND', WIKIARTICLESAROUND(articleOrPoint[0],
      radius));
  checkResult('WIKIARTICLESAROUND', WIKIARTICLESAROUND(
      articleOrPoint[0].replace('en:', ''), radius));
  checkResult('WIKIARTICLESAROUND', WIKIARTICLESAROUND(articleOrPoint[1],
      radius));
  checkResult('WIKIARTICLESAROUND', WIKIARTICLESAROUND(articleOrPoint[0],
      radius, opt_includeDistance));
  checkResult('WIKIARTICLESAROUND', WIKIARTICLESAROUND(
      articleOrPoint[0].replace('en:', ''), radius, opt_includeDistance));
  checkResult('WIKIARTICLESAROUND', WIKIARTICLESAROUND(articleOrPoint[1],
      radius, opt_includeDistance));
  checkResult('WIKIARTICLESAROUND', WIKIARTICLESAROUND(articleOrPoint[0],
      radius, opt_includeDistance, opt_namespaces));
  checkResult('WIKIARTICLESAROUND', WIKIARTICLESAROUND(
      articleOrPoint[0].replace('en:', ''), radius, opt_includeDistance,
      opt_namespaces));
  checkResult('WIKIARTICLESAROUND', WIKIARTICLESAROUND(articleOrPoint[1],
      radius, opt_includeDistance, opt_namespaces));

  checkResult('WIKITRANSLATE', WIKITRANSLATE(article));
  checkResult('WIKITRANSLATE', WIKITRANSLATE(article.replace('en:', '')));
  checkResult('WIKITRANSLATE', WIKITRANSLATE(article, opt_targetLanguage));
  checkResult('WIKITRANSLATE', WIKITRANSLATE(article, opt_targetLanguages));
  checkResult('WIKITRANSLATE', WIKITRANSLATE(article.replace('en:', ''),
      opt_targetLanguage));
  checkResult('WIKITRANSLATE', WIKITRANSLATE(article.replace('en:', ''),
      opt_targetLanguages));
  checkResult('WIKITRANSLATE', WIKITRANSLATE(article, opt_targetLanguages,
      opt_skipHeader));
  checkResult('WIKITRANSLATE', WIKITRANSLATE(article.replace('en:', ''),
      opt_targetLanguage, opt_skipHeader));
  checkResult('WIKITRANSLATE', WIKITRANSLATE(article.replace('en:', ''),
      opt_targetLanguages, opt_skipHeader));

  checkResult('WIKIDATAFACTS', WIKIDATAFACTS(article));
  checkResult('WIKIDATAFACTS', WIKIDATAFACTS(article.replace('en:', '')));
  checkResult('WIKIDATAFACTS', WIKIDATAFACTS(article, opt_multiObjectMode[0]));
  checkResult('WIKIDATAFACTS', WIKIDATAFACTS(article, opt_multiObjectMode[1]));
  checkResult('WIKIDATAFACTS', WIKIDATAFACTS(article.replace('en:', ''),
      opt_multiObjectMode[0]));
  checkResult('WIKIDATAFACTS', WIKIDATAFACTS(article.replace('en:', ''),
      opt_multiObjectMode[1]));
  checkResult('WIKIDATAFACTS', WIKIDATAFACTS(qid));
  checkResult('WIKIDATAFACTS', WIKIDATAFACTS(article, opt_multiObjectMode[0]));
  checkResult('WIKIDATAFACTS', WIKIDATAFACTS(article, opt_multiObjectMode[1]));
  checkResult('WIKIDATAFACTS', WIKIDATAFACTS(article, opt_multiObjectMode[0],
      opt_property));
  checkResult('WIKIDATAFACTS', WIKIDATAFACTS(article, opt_multiObjectMode[1],
      opt_property));
  checkResult('WIKIDATAFACTS', WIKIDATAFACTS(article, opt_multiObjectMode[0],
      opt_properties));
  checkResult('WIKIDATAFACTS', WIKIDATAFACTS(article, opt_multiObjectMode[1],
      opt_properties));

  checkResult('WIKIDATALABELS', WIKIDATALABELS(qid));
  checkResult('WIKIDATALABELS', WIKIDATALABELS(qid, opt_targetLanguage));
  checkResult('WIKIDATALABELS', WIKIDATALABELS(qid, opt_targetLanguages));
  checkResult('WIKIDATALABELS', WIKIDATALABELS(qid, 'all'));

  checkResult('WIKIDATADESCRIPTIONS', WIKIDATADESCRIPTIONS(qid));
  checkResult('WIKIDATADESCRIPTIONS', WIKIDATADESCRIPTIONS(qid, opt_targetLanguage));
  checkResult('WIKIDATADESCRIPTIONS', WIKIDATADESCRIPTIONS(qid, opt_targetLanguages));
  checkResult('WIKIDATADESCRIPTIONS', WIKIDATADESCRIPTIONS(qid, 'all'));

  checkResult('WIKIPAGEVIEWS', WIKIPAGEVIEWS(article));
  checkResult('WIKIPAGEVIEWS', WIKIPAGEVIEWS(article.replace('en:', '')));
  checkResult('WIKIPAGEVIEWS', WIKIPAGEVIEWS(article, opt_start, opt_end));
  checkResult('WIKIPAGEVIEWS', WIKIPAGEVIEWS(article.replace('en:', ''),
      opt_start, opt_end));
  checkResult('WIKIPAGEVIEWS', WIKIPAGEVIEWS(article, opt_start, opt_end,
      opt_sumOnly));
  checkResult('WIKIPAGEVIEWS', WIKIPAGEVIEWS(article.replace('en:', ''),
      opt_start, opt_end, opt_sumOnly));

  checkResult('WIKIPAGEVIEWSPERARTICLE', WIKIPAGEVIEWSPERARTICLE(project,
      article.replace('en:', '')));
  checkResult('WIKIPAGEVIEWSPERARTICLE', WIKIPAGEVIEWSPERARTICLE(project,
      article.replace('en:', ''), opt_access, opt_agent, opt_granularity,
      opt_start, opt_end));
  checkResult('WIKIPAGEVIEWSPERARTICLE', WIKIPAGEVIEWSPERARTICLE(project,
      article.replace('en:', ''), opt_access, opt_agent, opt_granularity,
      opt_start, opt_end, opt_sumOnly));

  checkResult('WIKIPAGEVIEWSAGGREGATE', WIKIPAGEVIEWSAGGREGATE(project));
  checkResult('WIKIPAGEVIEWSAGGREGATE', WIKIPAGEVIEWSAGGREGATE(project,
      opt_access, opt_agent, opt_granularity, opt_start, opt_end));

  checkResult('WIKIPAGEVIEWSTOP', WIKIPAGEVIEWSTOP(project));
  checkResult('WIKIPAGEVIEWSTOP', WIKIPAGEVIEWSTOP(project, opt_access,
      opt_date));

  checkResult('WIKIUNIQUEDEVICES', WIKIUNIQUEDEVICES(project));
  checkResult('WIKIUNIQUEDEVICES', WIKIUNIQUEDEVICES(project, opt_accessSite,
      opt_granularity, opt_start, opt_end));

  checkResult('WIKIPAGEEDITS', WIKIPAGEEDITS(article));
  checkResult('WIKIPAGEEDITS', WIKIPAGEEDITS(article.replace('en:', '')));
  checkResult('WIKIPAGEEDITS', WIKIPAGEEDITS(article, opt_start, opt_end));
  checkResult('WIKIPAGEEDITS', WIKIPAGEEDITS(article.replace('en:', ''),
      opt_start, opt_end));

  checkResult('WIKISEARCH', WIKISEARCH(query));
  checkResult('WIKISEARCH', WIKISEARCH(query.replace('en:', '')));
  checkResult('WIKISEARCH', WIKISEARCH(query, opt_didYouMean));
  checkResult('WIKISEARCH', WIKISEARCH(query.replace('en:', ''),
      opt_didYouMean));
  checkResult('WIKISEARCH', WIKISEARCH(query.replace('en:', ''), opt_didYouMean,
      opt_namespaces));
}
