'use strict';
module.exports = {
				 WOQLClient:require('./lib/woqlClient'),
                  ConnectionCapabilities:require('./lib/connectionCapabilities'),
                  ConnectionConfig:require('./lib/connectionConfig'),
                  IDParser:require('./lib/terminusIDParser'),
                  ErrorMessage:require('./lib/errorMessage'),
                  FrameHelper:require('./lib/frameHelper'),
                  ObjectFrame:require('./lib/objectFrame'),
                  TerminusDocumentViewer:require('./lib/documentViewer'),
                  WOQLViewer:require('./lib/woqlViewer'),
                  WOQL:require('./lib/woql')};