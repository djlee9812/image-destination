function processImage() {
    var subscriptionKey = config.MSKEY;
    var uriBase = "https://westcentralus.api.cognitive.microsoft.com/vision/v1.0/analyze";

    // Request parameters.
    var params = {
        "visualFeatures": "Categories,Description,Color",
        "details": "Landmarks",
        "language": "en",
    };

    // Display the image.
    var sourceImageUrl = document.getElementById("inputImage").value;
    document.querySelector("#sourceImage").src = sourceImageUrl;

    // Perform the REST API call.
    $.ajax({
        url: uriBase + "?" + $.param(params),

        // Request headers.
        beforeSend: function(xhrObj){
            xhrObj.setRequestHeader("Content-Type","application/json");
            xhrObj.setRequestHeader("Ocp-Apim-Subscription-Key", subscriptionKey);
        },

        type: "POST",

        // Request body.
        data: '{"url": ' + '"' + sourceImageUrl + '"}',
    })

    .done(function(data) {
        // Show formatted JSON on webpage.
        filter(data)
        console.log(data)
    })

    .fail(function(jqXHR, textStatus, errorThrown) {
        // Display error message.
        var errorString = (errorThrown === "") ? "Error. " : errorThrown + " (" + jqXHR.status + "): ";
        errorString += (jqXHR.responseText === "") ? "" : jQuery.parseJSON(jqXHR.responseText).message;
        alert(errorString);
    });
};

function filter(data) {
    //count scores to see which results
    let scores = {
        city: 0,
        nature: 0,
        forest: 0,
        beach: 0,
        rural: 0,
    }
    let descriptions = data.description.tags
    //count landmarks
    let landmark = ""
    if(typeof(data.categories[0].detail.landmarks[0]) !== 'undefined') {
        landmark = data.categories[0].detail.landmarks[0].name
        console.log(landmark)
    }
    //arrays of descriptors 
    //use dictionary hash
    /*const dict = {"building": "city", "subway": "city", "car": "city", "street": "city", "traffic": "city", "skyscraper": "city", "river": "city", "bridge": "city", "light": "city", "tower": "city", 
    "sand": "beach", "ocean": "beach", "water": "beach", "blue": "beach", "reef": "beach", "palm": "beach", "towel": "beach",
    "rock": "nature", "ocean": "nature", "water": "nature", "animal": "nature", "field": "nature", "green": "nature", "flower": "nature", "tree": "nature", "river": "nature", "plant": "nature", "mountain": "nature",
    "water": "forest", "tree": "forest", "green": "forest", "brown": "forest", "grass": "forest", "wood": "forest", "plant": "forest", "flower": "forest",
    "farm": "rural", "animal": "rural", "grass": "rural", "field": "rural", "cow": "rural", "sheep": "rural", "hill": "rural", "plant": "rural", "pasture": "rural", "herd": "rural",
    "old": "historical", "stone": "historical", "church": "historical", "brick": "historical", "statue": "historical", "castle": "historical", "park": "historical"}*/
    const city = ["building", "subway", "car", "street", "traffic", "skyscraper", "river", "bridge", "light", "tower"]
    const beach = ["sand", "ocean", "water", "blue", "reef", "palm", "towel"]
    const nature = ["rock", "ocean", "water", "animal", "field", "green", "flower", "tree", "river", "plant", "mountain"]
    const forest = ["water", "tree", "green", "brown", "grass", "wood", "plant", "flower"]
    const rural = ["farm", "animal", "grass", "field", "cow", "sheep", "hill", "plant", "pasture", "herd"]
    const historical = ["old", "church", "stone", "brick", "statue","castle", "park"]
    //iterate each tag
    for (var i=0; i< Math.min(descriptions.length, 10); i++) {
        // do something to give ratings to each category      
        if(descriptions[i] === "nature"){
            scores.nature += 5
            continue
        }
        if(descriptions[i] === "city"){
            scores.city += 5
            continue
        }
        if(descriptions[i] === "beach"){
            scores.beach += 5
            continue
        }
        if(descriptions[i] === "rural" || descriptions[i] === "country" || descriptions[i] === "countryside"){
            scores.rural += 5
            continue
        }
        if(descriptions[i] === "forest"){
            scores.forest += 5
            continue
        }
        /*
        for(key in dict) {
            if(descriptions[i] === key) {
                scores.window[dict[key]] += 1
                continue
            }
        }*/
        
        for(x in beach){
            if (descriptions[i] === beach[x]) {
                scores.beach += 1
                continue 
            }
        }
        for(x in nature){
            if (descriptions[i] === nature[x]) {
                scores.nature += 1
                continue 
            }
        }
        for(x in city){
            if (descriptions[i] === city[x]) {
                scores.city += 1
                continue 
            }
        }
        for(x in rural){
            if (descriptions[i] === rural[x]) {
                scores.rural += 1
                continue 
            }
        }
        for(x in forest){
            if (descriptions[i] === forest[x]) {
                scores.forest += 1
                continue 
            }
        }
    }
    console.log(scores)

    //access data.json
    $.getJSON( "data.json", function( data ) {
        console.log(data)
      var items = [];
      $.each( data, function( key, val ) {
        items.push( {key: val} );
        //do comparison here, put min 5
    });
  });
}