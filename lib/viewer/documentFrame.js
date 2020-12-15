const ObjectFrame = require("./objectFrame");
const FrameConfig = require("./frameConfig");
const FrameHelper = require("../utils");

/**
 * @file Document Frame 
 * @license Apache Version 2
 */


function DocumentFrame(client, config){
	this.client = client;
	this.config = (config ? config : new FrameConfig());
	this.load_schema = false;
}

DocumentFrame.prototype.options = function(opts){
	this.config = opts;
	return this;
}

DocumentFrame.prototype.db = function(dburl){
    this.client.db(dburl);
    return this;
}

/**
 *  @param {String} url - loads the document frame from the document API in frame form
 *  - loads the frame encapsulates more meta-data in the json and reduces the number of api calls we need to make
 *  @returns {Promise}
 */
DocumentFrame.prototype.loadDocument = function(url, encoding){
     encoding = encoding || "system:frame";
	 return this.client.getDocument(url, {"system:encoding": encoding})
	.then((response) => {
		(encoding == "system:frame" ? this.loadDataFrames(response) : this.loadJSON(response));
	});
}

DocumentFrame.prototype.loadSchema = function(cls, dbURL){
	var ncls = FrameHelper.unshorten(cls);
	return this.client.getClassFrame(dbURL, ncls)
	.then((response) => this.loadSchemaFrames(response, ncls));
}

/**
 *  @param {String} url - loads the document frame along with its class frame
 *  @param {String} [cls] - optional class id of the document - if absent class frames will be loaded from the document class once it is loaded
 *  @returns {Promise}
 *  - loads a document frame and it's class frame in unison
 */

DocumentFrame.prototype.loadComplete = function(url, cls){
    if(cls){
        return Promise.all([this.loadDocument(url), this.loadDocumentSchema(cls)]);        
    }
    else {
	    return this.loadDocument(url)
        .then((response) =>  {
			this.loadSchema(this.document.cls);
		});
    }
}

DocumentFrame.prototype.loadJSON = function(json, type){
    if(this.docid){
        return this.loadDocument(this.docid);
    }
    else if(this.clsid){
        return this.loadDocumentSchema(this.clsid);
    }
    console.error("Either docid or clid must be set before load is called")
}

DocumentFrame.prototype.loadData = function(jsonld, cls, classframes){
	if(!cls){
		if(this.document) cls = this.document.cls;
		else {
			if(jsonld && jsonld["@type"]){
				cls = jsonld["@type"];
			}
		}
	}
	if(cls){
		if(!this.document){
            this.document = new ObjectFrame(cls, jsonld, classframes);
		}
		else {
			this.document.loadJSONLDDocument(jsonld);
        }
	}
	else {
		console.log("Missing Class" + " " + "Failed to add dataframes due to missing class");
	}
}

DocumentFrame.prototype.load = function(classframes, doc){
    this.document = new ObjectFrame(doc["@type"], doc, classframes)  
}


DocumentFrame.prototype.loadSchemaFrames = function(classframes, cls){
	if(!cls){
		if(classframes && classframes.length && classframes[0] && classframes[0].domain){
			cls = classframes[0].domain;
		}
	}
	if(cls){
		if(!this.document){
			this.document = new ObjectFrame(cls);
		}
		if(classframes){
			this.document.loadClassFrames(classframes);
			if(!this.document.subjid){
				this.document.newDoc = true;
				this.document.fillFromSchema(FrameHelper.genBNID(FrameHelper.urlFragment(cls)+"_"));
			}
		}
	}
	else {
		console.log("Missing Class", "Failed to add class frames due to missing both class and classframes");
	}
}

DocumentFrame.prototype.filterFrame = function(loadRenderer){
	var myfilt = function(frame, rule){
		if(typeof rule.render() != "undefined"){
			frame.render = rule.render();
		}
/*		else {
			if(rule.renderer()){
				var renderer = loadRenderer(rule.renderer(), frame, rule.args);		
			}
			if(renderer){
				frame.render = function(fframe){
					return renderer(fframe);
				}
			}
		}*/
		if(rule.compare()){
			frame.compare = rule.compare();
		}
		if(rule.errors()){
			frame.errors = frame.errors ? frame.errors.concat(rule.errors()) : rule.errors();
        }
        else if(rule.errors() === false) delete frame.errors
	}
	this.applyRules(false, false, myfilt);
}

DocumentFrame.prototype.setErrors = function(errors, frameconf){
    this.clearErrors(frameconf)
    for(var i = 0; i<errors.length; i++){
        addRuleForVio(frameconf, errors[i])
    }
    var myfilt = function(frame, rule){
        if(rule.errors()){
			frame.errors = frame.errors ? frame.errors.concat(rule.errors()) : rule.errors();
        }
    }
	this.applyRules(false, frameconf, myfilt);   
}

DocumentFrame.prototype.clearErrors = function(frameconf){
    frameconf.all()
    var myfilt = function(frame, rule){
        if(frame.errors) delete(frame.errors)
    }
    this.applyRules(false, frameconf, myfilt)
    frameconf.rules = []
}

function addRuleForVio(docview, error){
    let prop = (error['vio:property'] ? error['vio:property']["@value"] : false)
    let subj = (error['vio:subject'] ? error['vio:subject']["@value"] : false)
    let msg = (error['vio:message'] ? error['vio:message']["@value"] : false)
    let val = (error['api:value'] ? error['api:value'] : false)
    if(val && val[0] == '"' && val[val.length-1] == '"')
        val = val.substring(1, val.length-1)
    let type = (error['api:type'] ? error['api:type'] : false)
    if(type && val){ //api:BadCast
        docview.data().value(val).type(type).errors([error])
    }
    if(prop && subj){//untypedInstanceViolation
        let shrt = FrameHelper.shorten(subj)
        if(shrt.substring(0, 5) == "woql:") shrt == shrt.substring(5)
        docview.data().property(prop).value(shrt, subj).errors([error])
    }
}

/*"
 * adds render and compare functions to object frames
 */
DocumentFrame.prototype.applyRules = function(doc, config, mymatch){
    doc = doc || this.document;
    if(!doc) return
	config = (config ? config : this.config);
	var onmatch = function(frame, rule){
		config.setFrameDisplayOptions(frame, rule);
		if(mymatch) mymatch(frame, rule);
	};
	doc.mfilter(config.rules, onmatch);
}

module.exports = DocumentFrame ;
