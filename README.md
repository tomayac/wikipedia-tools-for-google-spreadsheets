# Wikipedia Tools for Google Spreadsheets
A couple of Wikipedia utilities for use in Google Spreadsheets.

## Documentation
See the [documentation](https://script.google.com/macros/library/versions/d/MGZfQ_cBpwsvTDk_-3Pp5ZWGKoUaL1Yht)
sorted by version (choose the latest stable release).

## Usage
Use it in your spreadsheet following the [managing libraries](https://developers.google.com/apps-script/guide_libraries)
documentation. The required project key is ```MGZfQ_cBpwsvTDk_-3Pp5ZWGKoUaL1Yht```. You can then use the functions in the scripts editor
using the identifier prefix `WikipediaTools.` as outlined below:

```javascript
WikipediaTools.GOOGLESUGGEST(keyword, opt_language);

WikipediaTools.WIKIEXPAND(article, opt_targetLanguages, opt_returnAsObject);

WikipediaTools.WIKIEXPAND(article, opt_targetLanguages, opt_returnAsObject);

WikipediaTools.WIKITRANSLATE(article, opt_targetLanguages, opt_returnAsObject, opt_skipHeader);
```

If you want to use the provided functions directly from a cell, you need to alias all functions as follows:

```javascript
function GOOGLESUGGEST(keyword, opt_language) {
  return WikipediaTools.GOOGLESUGGEST(keyword, opt_language);
}

function WIKIEXPAND(article, opt_targetLanguages, opt_returnAsObject) {
  return WikipediaTools.WIKIEXPAND(article, opt_targetLanguages, opt_returnAsObject);
}

function WIKISYNONYMS(article) {
  return WikipediaTools.WIKISYNONYMS(article);
}

function WIKITRANSLATE(article, opt_targetLanguages, opt_returnAsObject, opt_skipHeader) {
  return WikipediaTools.WIKITRANSLATE(article, opt_targetLanguages, opt_returnAsObject, opt_skipHeader);
}
```

## License

Copyright 2015 Thomas Steiner (@tomayac)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.