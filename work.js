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
    /*let landmark = ""
    if(data.categories[0].detail.landmarks[0].name) {
        landmark = data.categories[0].detail.landmarks[0].name
        console.log(landmark)
    }*/
    //arrays of descriptors 
    const city = ["buildling", "subway", "car", "street", "traffic", "skyscraper", "river", "bridge", "light"]
    const beach = ["sand", "ocean", "water", "blue", "reef", "palm", "towel"]
    const nature = ["rock", "ocean", "water", "animal", "field", "green", "flower", "tree", "river", "plant"]
    const forest = ["mountain", "water", "tree", "green", "brown", "grass", "wood", "plant", "flower"]
    const rural = ["farm", "animal", "grass", "field", "cow", "sheep", "hill", "plant", "pasture", "herd"]
    //iterate each tag
    for (var i=0; i< Math.min(descriptions.length, 10); i++) {
        // do something to give ratings to each category      
        if(descriptions[i] === "nature"){
            scores.nature += 5
        }
        if(descriptions[i] === "city"){
            scores.city += 5
        }
        if(descriptions[i] === "beach"){
            scores.beach += 5
        }
        if(descriptions[i] === "rural" || descriptions[i] === "country" || descriptions[i] === "countryside"){
            scores.rural += 5
        }
        if(descriptions[i] === "forest"){
            scores.forest += 5
        }
        for(x in beach){
            if (descriptions[i] === beach[x]) {
                scores.beach += 1
            }
        }
        for(x in nature){
            if (descriptions[i] === nature[x]) {
                scores.nature += 1
            }
        }
        for(x in city){
            if (descriptions[i] === city[x]) {
                scores.city += 1
            }
        }
        for(x in rural){
            if (descriptions[i] === rural[x]) {
                scores.rural += 1
            }
        }
        for(x in forest){
            if (descriptions[i] === forest[x]) {
                scores.forest += 1
            }
        }
    }
    console.log(scores)
}