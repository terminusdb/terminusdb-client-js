
/*
* Transforms from internal json representation to human writable WOQL.js format
*/
WOQLPrinter.prettyPrint = function(indent, show_context, q, fluent){
	var str = "";
	const newlining_operators = ["get", "from", "into"];
	for(var operator in q){
		//ignore context in pretty print
		if(operator == "@context") {
			if( show_context){
				var c = this.getContext();
				if(c) str += "@context: " + JSON.stringify(c) + "\n";
			}
			continue;
		}
		//statement starts differently depending on indent and whether it is fluent style or regular function style
		str += this.getWOQLPrelude(operator, fluent, indent - this.indent);
		var val = q[operator];
		if(this.isChainable(operator, val[val.length-1])){
			//all arguments up until the last are regular function arguments
			str += this.uncleanArguments(operator,  val.slice(0, val.length-1), indent, show_context);
			if(newlining_operators.indexOf(operator) !== -1){
				//some fluent function calls demand a linebreak..
				str += "\n" + nspaces(indent-this.indent);
			}
			//recursive call to query included in tail
			str += this.prettyPrint(indent, show_context, val[val.length-1], true);
		}
		else {
			//non chainable operators all live inside the function call parameters
			if(!this.hasShortcut(operator, val, indent)){
				str += this.uncleanArguments(operator,  val, indent, show_context);
			}
		}
	}
	//remove any trailing dots in the chain (only exist in incompletely specified queries)
	if(str.substring(str.length-1) == "."){
		str = str.substring(0, str.length-1);
	}
	return str;
}

WOQLPrinter = {}

/**
 * Gets the starting characters for a WOQL query - varies depending on how the query is invoked and how indented it is
 */
WOQLPrinter.getWOQLPrelude = function(operator, fluent, inline){
	if(operator === "true" || operator === "false"){
		return operator;
	}
	if(fluent){
		return "." + operator;
	}
	return (inline ? "\n" + nspaces(inline) : "") + "WOQL." + operator;
}

/**
 * Determines whether a given operator can have a chained query as its last argument
 */
WOQLPrinter.isChainable = function(operator, lastArg){
	const non_chaining_operators = ["and", "or", "remote", "file", "re"];
	if(lastArg && typeof lastArg == "object" && typeof lastArg['@value'] == "undefined"  && typeof lastArg['@type'] == "undefined"  && typeof lastArg['value'] == "undefined" && non_chaining_operators.indexOf(operator) == -1){
		return true;
	}
	return false;
}

/**
 * Transforms arguments to WOQL functions from the internal (clean) version, to the WOQL.js human-friendly version
 */
WOQLPrinter.uncleanArguments = function(operator, args, indent, show_context){
	if(this.hasShortcut(operator, args)){
		return this.getShortcut(operator, args, indent);
	}
	let str = '(';
	for(var i = 0; i<args.length; i++){
		if(this.argIsSubQuery(operator, args[i], i)){
			str += this.prettyPrint(indent + this.indent, show_context, args[i], false);
		}
		else if(operator == "get" && i == 0){ // weird one, needs special casing
			str += "\n" + nspaces(indent-this.indent) + "WOQL";
			for(var j = 0; j < args[0].length; j++){
				var myas = (args[0][j].as ? args[0][j].as : args[0][j]);
				var lhs = myas[0];
				var rhs = myas[1];
				if(typeof lhs == "object" && lhs['@value']){
					lhs = lhs['@value'];
				}
				if(typeof lhs == "object") {
					lhs = JSON.stringify(lhs);
				}
				else {
					lhs = '"' + lhs + '"'
				}
				str += '.as(' + lhs;
				if(rhs) str += ', "' + rhs + '"';
				str += ")";
				str += "\n" + nspaces(indent);
			}
		}
		else {
			str += this.uncleanArgument(operator, args[i], i, args);
		}
		if(i < args.length -1) str +=  ',';
	}
	const args_take_newlines = ["and", "or"];
	if(args_take_newlines.indexOf(operator) != -1){
		str += "\n" + nspaces(indent-this.indent);
	}
	str += ")";
	return str;
}


/**
 * Passed as arguments: 1) the operator (and, triple, not, opt, etc)
 * 2) the value of the argument
 * 3) the index (position) of the argument.
 */
WOQLPrinter.uncleanArgument = function(operator, val, index, allArgs){
	//numeric values go out untouched...
	const numeric_operators = ["limit", "start", "eval", "plus", "minus", "times", "divide", "exp", "div"];
	if(operator == "isa"){
		val = (index == 0 ? this.unclean(val, 'subject') : this.unclean(val, 'class'));
	}
	else if(operator == "sub"){
		val = this.unclean(val, 'class');
	}
	else if(["select"].indexOf(operator) != -1){}
	else if(["quad", "add_quad", "delete_quad", "add_triple", "delete_triple", "triple"].indexOf(operator) != -1){
		switch(index){
			case 0: val = this.unclean(val, "subject"); break;
			case 1: val = this.unclean(val, "predicate"); break;
			case 2: val = this.unclean(val, "object"); break;
			case 3: val = this.unclean(val, "graph"); break;
		}
	}
	if(typeof val == "object"){
		if(operator == "concat" && index == 0){
			var cstr = "";
			if(val.list){
				for(var i = 0 ; i<val.list.length; i++){
					if(val.list[i]['@value']) cstr += val.list[i]['@value'];
					else cstr += val.list[i];
				}
			}
			var oval = '"' + cstr + '"';
		}
		else {
			var oval = this.uncleanObjectArgument(operator, val, index);
		}
		return oval;
	}
	//else if(numeric_operators.indexOf(operator) !== -1){
	//	return val;
	//}
	if(typeof val == "string"){
		return '"' + val + '"';
	}
	return val;
}

WOQLPrinter.uncleanObjectArgument = function(operator, val, index){
	if(val['@value'] && (val['@language'] || (val['@type'] && val['@type'] == "xsd:string"))) return '"' + val['@value'] + '"';
	if(val['@value'] && (val['@type'] && val['@type'] == "xsd:integer")) return val['@value'];
	if(val['list']) {
		var nstr = "[";
		for(var i = 0 ; i<val['list'].length; i++){
			if(typeof val['list'][i] == "object"){
				nstr += this.uncleanObjectArgument("list", val['list'][i], i);
			}
			else {
				nstr += '"' + val['list'][i] + '"';
			}
			if(i < val['list'].length-1){
				nstr += ",";
			}
		}
		nstr += "]";
		return nstr;
	}
	return JSON.stringify(val);
}

WOQLPrinter.argIsSubQuery = function(operator, arg, index){
	const squery_operators = ["and", "or", "when", "not", "opt", "exp", "minus", "div", "divide", "plus", "multiply"];
	if(squery_operators.indexOf(operator) !== -1){
		if(arg && typeof arg != "object") return false;
		return true;
	}
	if(operator == "group_by" && index == 2) return true;
	else return false;
}

/**
 * Goes from the properly prefixed clean internal version of a variable to the WOQL.js unprefixed form
 */
WOQLPrinter.unclean = function(s, part){
	if(typeof s != "string") return s;
	if(s.indexOf(":") == -1) return s;
	if(s.substring(0,4) == "http") return s;
	var suff = s.split(":")[1];
	if(this.vocab && this.vocab[suff] && this.vocab[suff] == s){
		return suff;
	}
	if(!part) return s;
	if(part == "subject" && (s.split(":")[0] == "doc")) return suff;
	if(part == "class" && (s.split(":")[0] == "scm")) return suff;
	if(part == "predicate" && (s.split(":")[0] == "scm")) return suff;
	if(part == "type" && (s.split(":")[0] == "scm")) return suff;
	if(part == "graph" && (s.split(":")[0] == "db")) return suff;
	return s;
}

WOQLPrinter.hasShortcut = function(operator, args, indent){
	if(operator == "true") return true;
	return false;
}

WOQLPrinter.getShortcut = function(operator, args, indent){
	if(operator == "true") return true;
}

function nspaces(n){
	let spaces = "";
	for(var i = 0; i<n; i++){
		spaces += " ";
	}
	return spaces;
}

WOQLPrinter.printLine = function(indent, clauses){
	return "(\n" + nspaces(indent) + "WOQL." + clauses.join(",\n"+ nspaces(indent) + "WOQL.") + "\n" + nspaces(indent - this.indent) + ")";
}



