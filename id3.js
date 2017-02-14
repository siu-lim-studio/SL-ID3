/*fonction ID3(exemples, attributCible, attributsNonCibles)
   si exemples est vide alors  Nœud terminal 
       retourner un nœud Erreur
   sinon si attributsNonCibles est vide alors  Nœud terminal 
       retourner un nœud ayant la valeur la plus représentée pour attributCible
   sinon si tous les exemples ont la même valeur pour attributCible alors /* Nœud terminal 
       retourner un nœud ayant cette valeur
   sinon /* Nœud intermédiaire 
       attributSélectionné = attribut maximisant le gain d'information parmi attributsNonCibles
       attributsNonCiblesRestants = suppressionListe(attributsNonCibles, attributSélectionné)
       nouveauNœud = nœud étiqueté avec attributSélectionné
       
       pour chaque valeur de attributSélectionné faire
           exemplesFiltrés = filtreExemplesAyantValeurPourAttribut(exemples, attributSélectionné, valeur)
           nouveauNœud->fils(valeur) = ID3(exemplesFiltrés, attributCible, attributsNonCiblesRestants)
       finpour
       
       retourner nouveauNœud
*/
/*
function ID3(exemples , attributCible , attributsNonCibles){
  
   // si exemple est vide alors
   if(!exemples){
     return ErrorNode();
   }else if(!attributsNonCibles){ // Noeud terminal 
     return MostRepresentedValue();
   }else if(Exemples.Samevalues(attributCible)){
     return NodeValue();
   }else{
     var attributSelectionne = MaxInfoGain(attributsNonCibles);
     var attributsNonCiblesRestants = suppressionListe(attributsNonCibles,attributSélectionné);
     nouveauNœud = new Node(attributSélectionné);

     foreach(valeur in attributSélectionné){
       var exemplesFiltrés = filtreExemplesAyantValeurPourAttribut(exemples,attributSélectionné,valeur);
       nouveauNœud.children[valeur] = ID3(exemplesFiltrés,attributCible,attributsNonCiblesRestants);
     }
     return nouveauNœud;
   }

}
*/




var _ = require('underscore');
const log = console.log;
var examples = [
{day:'D1',outlook:'Sunny', temp:'Hot', humidity:'High', wind: 'Weak',play:'No'},
{day:'D2',outlook:'Sunny', temp:'Hot', humidity:'High', wind: 'Strong',play:'No'},
{day:'D3',outlook:'Overcast', temp:'Hot', humidity:'High', wind: 'Weak',play:'Yes'},
{day:'D4',outlook:'Rain', temp:'Mild', humidity:'High', wind: 'Weak',play:'Yes'},
{day:'D5',outlook:'Rain', temp:'Cool', humidity:'Normal', wind: 'Weak',play:'Yes'},
{day:'D6',outlook:'Rain', temp:'Cool', humidity:'Normal', wind: 'Strong',play:'No'},
{day:'D7',outlook:'Overcast', temp:'Cool', humidity:'Normal', wind: 'Strong',play:'Yes'},
{day:'D8',outlook:'Sunny', temp:'Mild', humidity:'High', wind: 'Weak',play:'No'},
{day:'D9',outlook:'Sunny', temp:'Cool', humidity:'Normal', wind: 'Weak',play:'Yes'},
{day:'D10',outlook:'Rain', temp:'Mild', humidity:'Normal', wind: 'Weak',play:'Yes'},
{day:'D11',outlook:'Sunny', temp:'Mild', humidity:'Normal', wind: 'Strong',play:'Yes'},
{day:'D12',outlook:'Overcast', temp:'Mild', humidity:'High', wind: 'Strong',play:'Yes'},
{day:'D13',outlook:'Overcast', temp:'Hot', humidity:'Normal', wind: 'Weak',play:'Yes'},
{day:'D14',outlook:'Rain', temp:'Mild', humidity:'High', wind: 'Strong',play:'No'}
];

var samples = [{outlook:'Overcast', temp:'Mild', humidity:'High', wind: 'Strong',play: 'Yes'},
         {outlook:'Rain', temp:'Mild', humidity:'High', wind: 'Strong', play: 'No'},
         {outlook:'Sunny', temp:'Cool', humidity:'Normal', wind: 'Weak', play: 'Yes'}];

var features = ['outlook', 'temp', 'humidity', 'wind'];

var count = function(a,l){
    return _.filter(l,function(b) { return b === a}).length
}
var mostCommon = function(l){
  return  _.sortBy(l,function(a){
       return count(a,l);
    }).reverse()[0];
}

var prob = function(val,vals){
    var instances = _.filter(vals,function(x) {return x === val}).length;
    var total = vals.length;
    return instances/total;
}

var log2 = function(n){

    return Math.log(n)/Math.log(2);

}

var entropy = function(vals){
    var uniqueVals = _.unique(vals);
    var probs = uniqueVals.map(function(x){return prob(x,vals)});
    var logVals = probs.map(function(p){return -p*log2(p) });
    return logVals.reduce(function(a,b){return a+b},0);
}

var maxGain = function(_s,target,features){
    return _.max(features,function(e){return gain(_s,target,e)});
}

var gain = function(_s,target,feature){
    var attrVals = _.unique(_.pluck(_s,feature));
    var setEntropy = entropy(_.pluck(_s,target));
    var setSize = _.size(_s);
    var entropies = attrVals.map(function(n){
    var subset = _s.filter(function(x){return x[feature] === n});
     return (subset.length/setSize)*entropy(_.pluck(subset,target));
    });
    var sumOfEntropies =  entropies.reduce(function(a,b){return a+b},0);
    return setEntropy - sumOfEntropies;
}
var randomTag = function(){
    return "_r"+Math.round(Math.random()*1000000).toString();
}

var id3 = function(_s,target,features){

    var targets = _.unique(_.pluck(_s,target));
    if (targets.length == 1){
       console.log("end node! "+targets[0]);
       return {type:"result", val: targets[0], name: targets[0],alias:targets[0]+randomTag() }; 
    }
    if(features.length == 0){
     console.log("returning the most dominate feature!!!");
     var topTarget = mostCommon(_.pluck(_s,target));
     return {type:"result", val: topTarget, name: topTarget, alias: topTarget+randomTag()};
    }
    var bestFeature = maxGain(_s,target,features);
    var remainingFeatures = _.without(features,bestFeature);
    var possibleValues = _.unique(_.pluck(_s,bestFeature));
    console.log("node for "+bestFeature);
    var node = {name: bestFeature,alias: bestFeature+randomTag()};
    node.type = "feature";
    node.vals = _.map(possibleValues,function(v){
    console.log("creating a branch for "+v);
    var _newS = _(_.filter(_s,function(x) {return x[bestFeature] == v}));
    var child_node = {name:v,alias:v+randomTag(),type: "feature_value"};
    child_node.child =  id3(_newS,target,remainingFeatures);
     return child_node;
    });
    return node;
}

var predict = function(id3Model,sample) {
  var root = id3Model;
  while(root.type != "result"){
    var attr = root.name;
    
    var sampleVal = sample[attr];

    var childNode = _.detect(root.vals,function(x){return x.name == sampleVal});
    root = childNode.child;
    log(attr);log(sampleVal);log(root.val);
  }
  return root.val;
}


//var pluck = _.pluck(examples,"play");
//log(pluck);
/*
var targets = _.unique(_.pluck(examples,"play"));
log(targets);
var topTarget = mostCommon(_.pluck(examples,"play"));
log(topTarget);

var bestFeature = maxGain(examples,"play",features);
log(bestFeature);

var remainingFeatures = _.without(features,bestFeature);
log(remainingFeatures);

var possibleValues = _.unique(_.pluck(examples,bestFeature));
log(possibleValues);

var _newS = _(_.filter(examples,function(x) {return x[bestFeature] == 'Sunny'}));
log(_newS);
*/
var tr = id3(examples,'play',features);
//log(tr);
log("*******");
var pred = predict(tr,samples[1]);
log(pred);

/*var entropies = [1,2,3];
var sumOfEntropies =  entropies.reduce(function(a,b){return a+b},0.001);
log(sumOfEntropies);

var vals = [0,1,0,0,0,0,0,0,1,1,0];
var uniqueVals = [0,1];
var probs = uniqueVals.map(function(x){return prob(x,vals)});
log(probs);

var logVals = probs.map(function(p){return -p*log2(p) });
log(logVals);
*/