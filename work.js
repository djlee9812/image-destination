function processImage() {
    var subscriptionKey = '34e6e96447014c988a6ccf64ecb3f221';
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
        //console.log(data)
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
        historical: 0
    }
    let descriptions = data.description.tags
    //count landmarks
    let landmark = ""
    if(typeof(data.categories[0].detail.landmarks[0]) !== 'undefined') {
        landmark = data.categories[0].detail.landmarks[0].name
        //console.log(landmark)
    }
    //arrays of descriptors 
    //use dictionary hash
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
        for(x in historical){
            if (descriptions[i] === historical[x]) {
                scores.historical += 1
                continue
            }
        }
    }

    //use callback to solve synchronous problem
    order(scores, function(items){
        items.sort(function(a, b) {
            return b.score - a.score
        });
        if(items.length > 7){
            items = items.slice(0,7)
        }
        clear();
        for(i in items){
            results(items[i], i)
        }
    });
}


function order(scores, callback){
    var items = [];
    $.getJSON( "data.json", function( data ) {
        $.each( data, function( key, val ) {
            //do comparison here, put min 5
            val.score = 0
            for(i in scores){
                val.score += scores[i] * data[key].type[i]
            }
            items.push(data[key]);
        });
        callback(items);
        return;
    });
}

function results(item, i){
    let dollars = ''
    for (i=0; i<item.cost; i++){
        dollars += '<i class="fa fa-usd" aria-hidden="true"></i>'
    }
    console.log(dollars);
    var html = [
    '<div class="result">',
    '<h1 class="heading">' + item.place + ', ' + item.country + '</h1>',
    dollars,
    '<p>Lowest Flight fares: ' + '</p>',
    '</div>'
    ].join("\n");
    $("#results").append(html)
}

function clear() {
    $("#results").html("Your destination recommendations are:")
}

function fares() {

}