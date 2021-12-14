function  convert(obj){
    if (obj == null){
        return null
    } else if (typeof(obj) == 'number'){
        return { '@type' : 'Value',
                 'data' : { '@type' : 'xsd:decimal',
                            '@value' : obj }}
    } else if (typeof(obj) == 'boolean'){
        return { '@type' : 'Value',
                 'data' : { '@type' : 'xsd:boolean',
                            '@value' : obj }}
    } else if (typeof(obj) == 'str'){
        return { '@type' : 'Value',
                 'data' : { '@type' : 'xsd:string',
                            '@value' : obj }}
    } else if (typeof(obj) == 'object'){
        var pairs = []
        for (const [key, value] of Object.entries(obj)) {
            pairs.push({ '@type' : 'FieldValuePair',
                         'field' : key,
                         'value' : convert(value) })
        }
        return { '@type' : 'DictionaryTemplate',
                 'data' : pairs }
    }
}

function Var(name){
        this.name = name
}

function Doc(obj) {
        this.doc = obj
        this.encoded = convert(obj)
}
module.exports = {Var,Doc}